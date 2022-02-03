"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class FriesNode {
    constructor(lavafries, options) {
        this.lavafries = lavafries;
        this.options = options;
        if (!this.options.host)
            throw new TypeError("Options host is required parameter.");
        if (!this.options.port)
            throw new TypeError("Options port is required parameter.");
        if (!this.options.password)
            throw new TypeError("Options password is required parameter.");
        if (!this.options.secure)
            this.options.secure = false;
        if (!this.options.retryAmount)
            this.options.retryAmount = 5;
        if (!this.options.retryDelay)
            this.options.retryDelay = 5000;
        if (!this.options.requestTimeout)
            this.options.requestTimeout = 30e3;
        this.stats = {
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0,
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0,
            },
            lastUpdated: Date.now(),
        };
        this.socket = null;
        this.connect();
    }
    get connected() {
        if (!this.socket)
            return false;
        return this.socket.readyState === ws_1.default.OPEN;
    }
    connect() {
        const headers = {
            Authorization: this.options.password,
            "User-Id": this.lavafries.client.user.id,
            "Num-Shards": this.lavafries.shards,
            "Client-Name": "lavafries",
        };
        this.socket = new ws_1.default(`ws${this.options.secure ? "s" : ""}://${this.options.host}:${this.options.port}/`, { headers });
        this.socket.once("open", this.open.bind(this));
        this.socket.once("close", this.close.bind(this));
        this.socket.on("error", this.error.bind(this));
        this.socket.on("message", this.message.bind(this));
    }
    open() {
        this.lavafries.emit("nodeConnect", this);
    }
    close(code, reason) {
        this.lavafries.emit("nodeClose", this, { code, reason });
        if (code !== 1000 || reason !== "destroy") {
            for (let i = 0; i < this.options.retryAmount; i += 1) {
                this.reconnect();
                i += 1;
            }
            throw new RangeError(`Can't establish websocket connection after trying ${this.options.retryAmount} times.`);
        }
    }
    error(msg) {
        this.lavafries.emit("nodeError", this, msg || "");
    }
    reconnect() {
        setTimeout(() => {
            this.lavafries.emit("nodeError", this);
            this.socket.removeAllListeners();
            this.socket = null;
            this.lavafries.emit("nodeReconnect", this);
            this.connect();
        }, this.options.retryDelay);
    }
    destroyNode() {
        if (!this.connected)
            return;
        this.socket.close(1000, "destroy");
        this.socket.removeAllListeners();
        this.socket = null;
        this.lavafries.nodeCollection.delete(this.options.host);
    }
    message(data) {
        var _a, _b, _c, _d, _e, _f;
        if (!data)
            throw new RangeError("No incoming data found.");
        const payload = JSON.parse(data === null || data === void 0 ? void 0 : data.toString());
        const { op, type, code, guildId, state, } = payload;
        if (!op)
            return;
        const player = this.lavafries.playerCollection.get(guildId);
        if (op !== "event") {
            // eslint-disable-next-line default-case
            switch (op) {
                case "stats":
                    this.stats = Object.assign({}, payload);
                    delete this.stats.op;
                    break;
                case "playerUpdate":
                    if (player) {
                        player.position = (_a = state === null || state === void 0 ? void 0 : state.position) !== null && _a !== void 0 ? _a : 0;
                    }
                    break;
            }
        }
        else if (op === "event") {
            if (!player)
                return;
            player.isPlaying = false;
            const track = player.queue.first;
            // eslint-disable-next-line default-case
            switch (type) {
                case "TrackStartEvent":
                    player.isPlaying = true;
                    this.lavafries.emit("trackPlay", track, player, payload);
                    break;
                case "TrackEndEvent":
                    if (!track)
                        return;
                    if (track && player.queue.repeatTrack) {
                        player.play();
                    }
                    else if (track && player.queue.repeatQueue) {
                        const toAdd = player.queue.remove();
                        if (toAdd)
                            player.queue.add(toAdd);
                        player.play();
                    }
                    else if (track && player.queue.size > 1) {
                        player.queue.remove();
                        player.play();
                        this.lavafries.emit("trackEnd", track, player, payload);
                    }
                    else if (track && player.queue.size === 1) {
                        player.queue.remove();
                        this.lavafries.emit("queueEnd", track, player, payload);
                    }
                    break;
                case "TrackStuckEvent":
                    if (!track)
                        return;
                    player.queue.remove();
                    if (player.queue.skipOnError)
                        player.play();
                    this.lavafries.emit("trackStuck", track, player, payload);
                    break;
                case "TrackExceptionEvent":
                    if (!track)
                        return;
                    player.queue.remove();
                    if (player.queue.skipOnError)
                        player.play();
                    this.lavafries.emit("trackError", track, player, payload);
                    break;
                case "WebSocketClosedEvent":
                    if ([4009, 4015].includes(code)) {
                        this.lavafries.post({
                            op: 4,
                            d: {
                                guild_id: guildId,
                                channel_id: (_b = player === null || player === void 0 ? void 0 : player.options) === null || _b === void 0 ? void 0 : _b.voiceChannel.id,
                                self_mute: (_d = (_c = player === null || player === void 0 ? void 0 : player.options) === null || _c === void 0 ? void 0 : _c.mute) !== null && _d !== void 0 ? _d : false,
                                self_deaf: (_f = (_e = player === null || player === void 0 ? void 0 : player.options) === null || _e === void 0 ? void 0 : _e.deafen) !== null && _f !== void 0 ? _f : false,
                            },
                        });
                    }
                    this.lavafries.emit("socketClosed", this, payload);
                    break;
            }
        }
        else {
            this.lavafries.emit("nodeError", this, `Unknown event with op: ${op} and data: ${payload}`);
        }
    }
    post(data) {
        return new Promise((res, rej) => {
            if (!this.connected)
                res(false);
            const formattedData = JSON.stringify(data);
            if (!formattedData || !formattedData.startsWith("{")) {
                rej(new Error("No JSON payloads found in websocket."));
            }
            this.socket.send(formattedData, (err) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(true);
                }
            });
        });
    }
}
exports.default = FriesNode;
