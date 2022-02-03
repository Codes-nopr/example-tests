"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-plusplus */
const Collection_1 = __importDefault(require("../utils/Collection"));
class Queue extends Collection_1.default {
    constructor(player, options) {
        var _a, _b, _c;
        super();
        this.player = player;
        this.repeatTrack = (_a = options === null || options === void 0 ? void 0 : options.repeatTrack) !== null && _a !== void 0 ? _a : false;
        this.repeatQueue = (_b = options === null || options === void 0 ? void 0 : options.repeatQueue) !== null && _b !== void 0 ? _b : false;
        this.skipOnError = (_c = options === null || options === void 0 ? void 0 : options.skipOnError) !== null && _c !== void 0 ? _c : false;
    }
    get duration() {
        return this.map((x) => x.length).reduce((acc, cur) => acc + cur);
    }
    get empty() {
        return !this.size;
    }
    toggleRepeat(type) {
        if (type === "track" && !this.repeatTrack) {
            this.repeatTrack = true;
            this.repeatQueue = false;
            return this.repeatTrack;
        }
        if (type === "track" && this.repeatTrack) {
            this.repeatTrack = false;
            return this.repeatTrack;
        }
        if (type === "queue" && !this.repeatQueue) {
            this.repeatQueue = true;
            this.repeatTrack = false;
            return this.repeatQueue;
        }
        if (type === "queue" && this.repeatQueue) {
            this.repeatQueue = false;
            this.repeatTrack = true;
            return this.repeatQueue;
        }
        if (type === "disable") {
            this.repeatTrack = false;
            this.repeatQueue = false;
            return false;
        }
        return false;
    }
    add(data) {
        if (!data)
            throw new TypeError("Provided argument is not of type \"Track\" or \"Track[]\".");
        if (Array.isArray(data)) {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.length; i++) {
                this.set((this.size < 1 ? 0 : this.lastKey) + 1, data[i]);
            }
        }
        else {
            this.set((this.size < 1 ? 0 : this.lastKey) + 1, data);
        }
    }
    remove(pos) {
        const track = this.KArray()[pos || 0];
        this.delete(track[0]);
        return track[1];
    }
    wipe(start, end) {
        if (!start)
            throw new RangeError("Queue#wipe() \"start\" parameter missing.");
        if (!end)
            throw new RangeError("Queue#wipe() \"end\" parameter missing.");
        if (start >= end)
            throw new RangeError("Queue#wipe() Start parameter must be smaller than end.");
        if (start >= this.size)
            throw new RangeError("Queue#wipe() Start parameter must be smaller than queue length.");
        const bucket = [];
        const trackArr = this.KArray();
        for (let i = start; i === end; i++) {
            const track = trackArr[i];
            bucket.push(track[1]);
            this.delete(track[0]);
        }
        return bucket;
    }
    clearQueue() {
        const curr = this.first;
        this.clear();
        if (curr)
            this.set(1, curr);
    }
    moveTrack(from, to) {
        if (!from)
            throw new RangeError("Queue#moveTrack() \"from\" parameter missing.");
        if (!to)
            throw new RangeError("Queue#moveTrack() \"to\" parameter missing.");
        if (to > this.size)
            throw new RangeError(`Queue#moveTrack() The new position cannot be greater than ${this.size}.`);
        if (this.player.playing && (to === 0 || from === 0)) {
            throw new Error("Queue#moveTrack() Cannot change position or replace currently playing track.");
        }
        const arr = [...this.values()];
        const track = arr.splice(from, 1)[0];
        if (!track) {
            throw new RangeError("Queue#moveTrack() No track found at the given position.");
        }
        arr.splice(to, 0, track);
        this.clearQueue();
        for (let i = 0; i < arr.length; i++) {
            this.set(i + 1, arr[i]);
        }
    }
}
exports.default = Queue;
