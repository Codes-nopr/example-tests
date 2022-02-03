"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable prefer-destructuring */
/* eslint-disable no-case-declarations */
/* eslint-disable no-promise-executor-return */
const undici_1 = require("undici");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const FriesQueue_1 = __importDefault(require("./FriesQueue"));
const Utils_1 = __importDefault(require("../utils/Utils"));
const Check_1 = __importDefault(require("../utils/Check"));
const Constants_1 = __importDefault(require("../utils/Constants"));
class FriesPlayer {
    constructor(lavafries, options, queueOption) {
        var _a;
        this.lavafries = lavafries;
        this.options = options;
        this.node = this.lavafries.leastLoadNode;
        this.vol = (_a = options === null || options === void 0 ? void 0 : options.volume) !== null && _a !== void 0 ? _a : 100;
        this.queue = new FriesQueue_1.default(this, queueOption || {});
        // eslint-disable-next-line no-array-constructor
        this.bands = new Array();
        this.isPlaying = false;
        this.isPaused = false;
        this.position = 0;
        this.connected = false;
        this.connect();
        this.lavafries.playerCollection.set(options.guild.id, this);
        this.lavafries.emit("nodeCreate", this.node.options.host, this);
    }
    get isConnected() {
        return this.connected;
    }
    get playing() {
        return this.isPlaying;
    }
    get paused() {
        return this.isPaused;
    }
    get getVolume() {
        return this.vol;
    }
    get getVoiceID() {
        return this.options.voiceChannel.id;
    }
    get getGuildID() {
        return this.options.guild.id;
    }
    connect() {
        var _a, _b, _c, _d;
        this.lavafries.post({
            op: 4,
            d: {
                guild_id: this.options.guild.id,
                channel_id: this.options.voiceChannel.id,
                self_deaf: (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.deafen) !== null && _b !== void 0 ? _b : false,
                self_mute: (_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.mute) !== null && _d !== void 0 ? _d : false,
            },
        });
        this.connected = true;
    }
    play(options) {
        const extra = options || (["startTime", "endTime", "noReplace"].every((v) => Object.keys(options || {}).includes(v))
            ? options
            : {});
        if (this.queue.empty)
            throw new RangeError("Queue is empty.");
        if (this.connected === false)
            this.connect();
        const track = this.queue.first;
        this.isPlaying = true;
        this.node.post(Object.assign({ op: "play", track: track.trackString, guildId: this.options.guild.id }, extra));
    }
    friesSearch(query, user, options) {
        (0, Check_1.default)(query, "string", "Query must be a string.");
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const search = /^(?:(?:http|https):\/\/|\w+:)/.test(query)
                ? encodeURI(query)
                : `${options.source || "yt"}search:${query}`;
            const { body } = yield (0, undici_1.request)(`http${this.node.options.secure ? "s" : ""}://${this.node.options.host}:${this.node.options.port}/loadtracks?identifier=${search}`, {
                method: "GET",
                headers: {
                    Authorization: this.node.options.password,
                },
                bodyTimeout: this.node.options.requestTimeout,
                headersTimeout: this.node.options.requestTimeout,
            });
            const { loadType, playlistInfo, tracks, } = yield body.json();
            const arr = [];
            const data = {
                name: playlistInfo.name,
                trackCount: tracks.length,
                // eslint-disable-next-line object-shorthand
                tracks: tracks,
            };
            // eslint-disable-next-line default-case
            switch (loadType) {
                case Constants_1.default.noMatches:
                    resolve(loadType);
                    break;
                case Constants_1.default.loadFailed:
                    resolve(loadType);
                    break;
                case Constants_1.default.trackLoaded:
                    const trackData = Utils_1.default.newTrack(tracks[0], user, loadType);
                    arr.push(trackData);
                    if (options.add !== true)
                        return resolve(arr);
                    this.queue.add(trackData);
                    resolve(arr);
                    break;
                case Constants_1.default.playlistLoaded:
                    const playlist = Utils_1.default.newPlaylist(data, user, loadType);
                    resolve(playlist);
                    break;
                case Constants_1.default.searchResult:
                    const res = tracks.map((t) => Utils_1.default.newTrack(t, user, loadType));
                    resolve(res);
                    break;
            }
            return null;
        }));
    }
    pause(condition) {
        (0, Check_1.default)(condition, "boolean", "Pause state must be a boolean.");
        this.node.post({
            op: "pause",
            guildId: this.options.guild.id,
            pause: condition,
        });
        this.isPaused = condition;
    }
    stop() {
        this.node.post({
            op: "stop",
            guildId: this.options.guild.id,
        });
    }
    setVolume(level) {
        (0, Check_1.default)(level, "number", "Volume level must be a number (integer).");
        this.vol = Math.max(Math.min(level, 1000), 0);
        this.node.post({
            op: "volume",
            guildId: this.options.guild.id,
            volume: this.vol,
        });
    }
    seek(position) {
        (0, Check_1.default)(position, "number", "Position must be a number.");
        if (position < 0 || position > this.queue.first.length)
            throw new RangeError(`Provided position must be in between 0 and ${this.queue.first.length}.`);
        this.position = position;
        this.node.post({
            op: "seek",
            guildId: this.options.guild.id,
            position,
        });
        return this.position;
    }
    setTrackRepeat() {
        this.queue.toggleRepeat("track");
        return !!this.queue.repeatTrack;
    }
    setQueueRepeat() {
        this.queue.toggleRepeat("queue");
        return !!this.queue.repeatQueue;
    }
    disableLoop() {
        this.queue.toggleRepeat("disable");
        return !!this.queue.repeatTrack
            || !!this.queue.repeatQueue;
    }
    setEQ(...bands) {
        if (!(bands instanceof Array))
            throw new TypeError("Bands must be an array.");
        // eslint-disable-next-line no-param-reassign
        if (Array.isArray(bands[0]))
            bands = bands[0];
        if (!bands.length || !bands.every((band) => JSON.stringify(Object.keys(band).sort()) === "[\"band\",\"gain\"]")) {
            throw new RangeError("Bands must be in a non-empty object containing band and gain properties.");
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const { band, gain } of bands)
            this.bands[band] = gain;
        this.node.post({
            op: "equalizer",
            guildId: this.options.guild.id,
            bands: this.bands.map((gain, band) => ({ band, gain })),
        });
    }
    clearEQ() {
        this.bands = new Array(15).fill(0.0);
        this.node.post({
            op: "equalizer",
            guildId: this.options.guild.id,
            bands: this.bands.map((gain, band) => ({ band, gain })),
        });
    }
    setTextChannel(channel) {
        (0, Check_1.default)(channel, "string", "Channel ID must be a string.");
        this.options.textChannel = channel;
    }
    setVoiceChannel(channel, waitForConnect) {
        (0, Check_1.default)(channel, "string", "Channel ID must be a string.");
        this.options.voiceChannel = channel;
        this.options.voiceChannel.id = new bignumber_js_1.default(channel);
        setTimeout(() => {
            if (this.isConnected)
                this.connect();
        }, waitForConnect || 500);
    }
    destroy() {
        this.pause(true);
        this.connected = false;
        this.lavafries.post({
            op: 4,
            d: {
                guild_id: this.options.guild.id,
                channel_id: null,
                self_deaf: false,
                self_mute: false,
            },
        });
        this.options.voiceChannel = null;
        this.options.textChannel = null;
        this.node.post({
            op: "destroy",
            guildId: this.options.guild.id,
        });
        this.lavafries.playerCollection.delete(this.options.guild.id);
    }
    setKaraoke(lvl, monoLvl, filtBand, filtWidth) {
        (0, Check_1.default)(lvl, "number", "Level must be a number.");
        (0, Check_1.default)(monoLvl, "number", "Monolevel must be a number.");
        (0, Check_1.default)(filtBand, "number", "Filter band must be a number.");
        (0, Check_1.default)(filtWidth, "number", "Filter width must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            karaoke: {
                level: lvl,
                monoLevel: monoLvl,
                filterBand: filtBand,
                filterWidth: filtWidth,
            },
        });
    }
    setTimescale(spd, pit, rt) {
        (0, Check_1.default)(spd, "number", "Speed must be a number.");
        (0, Check_1.default)(pit, "number", "Pitch must be a number.");
        (0, Check_1.default)(rt, "number", "Rate must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            timescale: {
                speed: spd,
                pitch: pit,
                rate: rt,
            },
        });
    }
    setTremolo(freq, dept) {
        (0, Check_1.default)(freq, "number", "Frequency must be a number.");
        (0, Check_1.default)(dept, "number", "Depth must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            tremolo: {
                frequency: freq,
                depth: dept,
            },
        });
    }
    setVibrato(freq, dept) {
        (0, Check_1.default)(freq, "number", "Frequency must be a number.");
        (0, Check_1.default)(dept, "number", "Depth must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            vibrato: {
                frequency: freq,
                depth: dept,
            },
        });
    }
    setRotation(rot) {
        (0, Check_1.default)(rot, "number", "Rotation must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            rotation: {
                rotationHz: rot,
            },
        });
    }
    setDistortion(sinOff, sinSc, cosOff, cosSc, tanOff, tanSc, offS, sc) {
        (0, Check_1.default)(sinOff, "number", "SinOffSet must be a number.");
        (0, Check_1.default)(sinSc, "number", "SinScale must be a number.");
        (0, Check_1.default)(cosOff, "number", "CosOffSet must be a number.");
        (0, Check_1.default)(cosSc, "number", "CosScale must be a number.");
        (0, Check_1.default)(tanOff, "number", "TanOffSet must be a number.");
        (0, Check_1.default)(tanSc, "number", "TanOffSet must be a number.");
        (0, Check_1.default)(offS, "number", "Offset must be a number.");
        (0, Check_1.default)(sc, "number", "Scale must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            distortion: {
                sinOffset: sinOff,
                sinScale: sinSc,
                cosOffset: cosOff,
                cosScale: cosSc,
                tanOffset: tanOff,
                tanScale: tanSc,
                offset: offS,
                scale: sc,
            },
        });
    }
    setChannelMix(ltl, ltr, rtl, rtr) {
        (0, Check_1.default)(ltl, "number", "LeftToLeft must be a number.");
        (0, Check_1.default)(ltr, "number", "LeftToRight must be a number.");
        (0, Check_1.default)(rtl, "number", "RightToLeft must be a number.");
        (0, Check_1.default)(rtr, "number", "RightToRight must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            channelMix: {
                leftToLeft: ltl,
                leftToRight: ltr,
                rightToLeft: rtl,
                rightToRight: rtr,
            },
        });
    }
    setLowPass(smooth) {
        (0, Check_1.default)(smooth, "number", "Smooth must be a number.");
        this.node.post({
            op: "filters",
            guildId: this.options.guild.id,
            lowPass: {
                smoothing: smooth,
            },
        });
    }
}
exports.default = FriesPlayer;
