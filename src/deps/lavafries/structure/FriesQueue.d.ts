import Collection from "../utils/Collection";
export default class Queue extends Collection<number, any> {
    player: any | any[];
    repeatTrack?: boolean;
    repeatQueue?: boolean;
    skipOnError?: boolean;
    constructor(player: any, options: any | any[]);
    get duration(): number;
    get empty(): boolean;
    toggleRepeat(type?: "track" | "queue" | "disable"): boolean;
    add(data: any | any[]): void;
    remove(pos?: number): any;
    wipe(start: number, end: number): any[];
    clearQueue(): void;
    moveTrack(from: number, to: number): void;
}
