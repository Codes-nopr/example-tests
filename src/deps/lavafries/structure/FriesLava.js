"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const FriesNode_1 = __importDefault(require("./FriesNode"));
const Collection_1 = __importDefault(require("../utils/Collection"));
const FriesPlayer_1 = __importDefault(require("./FriesPlayer"));
const states = new Map();
class LavaFries extends tiny_typed_emitter_1.TypedEmitter {
    constructor(client, node) {
        super();
        this.client = client;
        this.nodeOptions = node;
        this.shards = client.ws.shards.size;
        this.nodeCollection = new Collection_1.default();
        this.playerCollection = new Collection_1.default();
        if (!this.nodeOptions || !this.nodeOptions.length) {
            throw new Error("No nodes are provided.");
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const x of this.nodeOptions) {
            if (!this.nodeCollection.has(x.host)) {
                const newNode = new FriesNode_1.default(this, x);
                this.nodeCollection.set(x.host, newNode);
            }
        }
        this.client.on("raw", this.handleStateUpdate.bind(this));
    }
    get leastLoadNode() {
        const sorted = this.nodeCollection
            .toArray()
            .filter((x) => x.connected)
            .sort((a, b) => {
            const loadA = (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100;
            const loadB = (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100;
            return loadB - loadA;
        });
        return sorted[0];
    }
    post(data) {
        if (!data)
            return;
        const guild = this.client.guilds.cache.get(data.d.guild_id);
        if (guild) {
            guild.shard.send(data);
        }
    }
    connect(nodeOptions) {
        if (!nodeOptions || !nodeOptions.host) {
            throw new Error("No nodes are provided!");
        }
        const newNode = new FriesNode_1.default(this, nodeOptions);
        this.nodeCollection.set(nodeOptions.host, newNode);
        return newNode;
    }
    create(options, queueOption) {
        if (!options.guild) {
            throw new TypeError("guild is null or undefined.");
        }
        if (!options.voiceChannel) {
            throw new TypeError("voiceChannel is null or undefined.");
        }
        if (!options.textChannel) {
            throw new TypeError("textChannel is null or undefined.");
        }
        const oldPlayer = this.playerCollection.get(options.guild.id);
        if (oldPlayer)
            return oldPlayer;
        return new FriesPlayer_1.default(this, options, queueOption);
    }
    handleStateUpdate(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(data.t))
            return;
        if (data.d.user_id && data.d.user_id !== this.client.user.id)
            return;
        const player = this.playerCollection.get(data.d.guild_id);
        if (!player)
            return;
        const voiceState = (_b = states.get((_a = data === null || data === void 0 ? void 0 : data.d) === null || _a === void 0 ? void 0 : _a.guild_id)) !== null && _b !== void 0 ? _b : {};
        // eslint-disable-next-line default-case
        switch (data.t) {
            case "VOICE_STATE_UPDATE":
                voiceState.op = "voiceUpdate";
                voiceState.sessionId = (_d = (_c = data === null || data === void 0 ? void 0 : data.d) === null || _c === void 0 ? void 0 : _c.session_id) !== null && _d !== void 0 ? _d : null;
                if (data.d.channel_id) {
                    if (player.options.voiceChannel.id !== data.d.channel_id) {
                        const newChannel = this.client.channels.cache.get((_f = (_e = data === null || data === void 0 ? void 0 : data.d) === null || _e === void 0 ? void 0 : _e.channel_id) !== null && _f !== void 0 ? _f : null);
                        this.emit("playerMove", player, player.options.voiceChannel.id, data.d.channel_id);
                        if (newChannel)
                            player.options.voiceChannel = newChannel;
                    }
                }
                else {
                    this.emit("playerDisconnect", player, player.options.voiceChannel);
                    player.voiceChannel = null;
                    player.voiceState = {};
                    player.pause(true);
                }
                break;
            case "VOICE_SERVER_UPDATE":
                voiceState.guildId = (_h = (_g = data === null || data === void 0 ? void 0 : data.d) === null || _g === void 0 ? void 0 : _g.guild_id) !== null && _h !== void 0 ? _h : null;
                voiceState.event = (_j = data === null || data === void 0 ? void 0 : data.d) !== null && _j !== void 0 ? _j : null;
                break;
        }
        states.set((_k = data.d) === null || _k === void 0 ? void 0 : _k.guild_id, voiceState);
        const { op, guildId, sessionId, event, } = voiceState;
        if (op && guildId && sessionId && event) {
            player.node.post(voiceState)
                .then(() => states.set(guildId, {}))
                .catch((err) => {
                if (err)
                    throw new Error(err);
            });
        }
    }
}
exports.default = LavaFries;
