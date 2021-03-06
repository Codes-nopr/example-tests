import LavaFries from "./FriesLava";
import Queue from "./FriesQueue";
import type { PlayOptions } from "../utils/Interfaces";
export default class FriesPlayer<T = unknown> {
    lavafries: any;
    options: any;
    node: any | any[];
    vol?: number;
    queue: Queue;
    bands: {
        band?: number;
        gain?: number;
    }[];
    isPlaying: boolean;
    isPaused: boolean;
    position: number;
    connected: boolean;
    volume?: number;
    constructor(lavafries: LavaFries, options: any | any[], queueOption?: any);
    get isConnected(): boolean;
    get playing(): boolean;
    get paused(): boolean;
    get getVolume(): number;
    get getVoiceID(): string | number | undefined;
    get getGuildID(): string | number | undefined;
    connect(): void;
    play(options?: PlayOptions): void;
    friesSearch(query: string, user: any, options: {
        source?: "yt" | "sc";
        add?: boolean;
    }): Promise<any | any[]>;
    pause(condition: boolean): void;
    stop(): void;
    setVolume(level: number): void;
    seek(position: number): number;
    setTrackRepeat(): boolean;
    setQueueRepeat(): boolean;
    disableLoop(): boolean;
    setEQ(...bands: any[]): void;
    clearEQ(): void;
    setTextChannel(channel: string): void;
    setVoiceChannel(channel: string, waitForConnect?: number): void;
    destroy(): void;
    setKaraoke(lvl?: number, monoLvl?: number, filtBand?: number, filtWidth?: number): void;
    setTimescale(spd?: number, pit?: number, rt?: number): void;
    setTremolo(freq?: number, dept?: number): void;
    setVibrato(freq?: number, dept?: number): void;
    setRotation(rot?: number): void;
    setDistortion(sinOff?: number, sinSc?: number, cosOff?: number, cosSc?: number, tanOff?: number, tanSc?: number, offS?: number, sc?: number): void;
    setChannelMix(ltl?: number, ltr?: number, rtl?: number, rtr?: number): void;
    setLowPass(smooth?: number): void;
}
