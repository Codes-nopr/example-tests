import Player from "./FriesPlayer";
import type { NodeOptions, PlayerStats, IncomingPayloads } from "../utils/Interfaces";
export interface NodeEvents {
    nodeConnect(func: any): void;
    nodeClose(func: any, message: {
        code: number;
        reason?: string;
    }): void;
    nodeError(func: any): void;
    nodeReconnect(func: any): void;
    trackPlay(track: any, player: Player, payload: IncomingPayloads): void;
    queueEnd(track: any, player: Player, payload: IncomingPayloads): void;
    trackStuck(track: any, player: Player, payload: IncomingPayloads): void;
    trackError(track: any, player: Player, payload: IncomingPayloads): void;
    socketClosed(func: any, payload: IncomingPayloads | any): void;
}
export default class FriesNode {
    lavafries: any;
    options: NodeOptions;
    stats: PlayerStats;
    socket: any;
    constructor(lavafries: any, options: NodeOptions);
    get connected(): boolean;
    connect(): void;
    open(): void;
    close(code?: number, reason?: string | undefined): void;
    error(msg?: any | undefined): void;
    reconnect(): void;
    destroyNode(): void;
    message(data: any | any[]): void;
    post(data: any[]): Promise<boolean>;
}
