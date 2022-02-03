import { TypedEmitter } from "tiny-typed-emitter";
import Collection from "../utils/Collection";
import Player from "./FriesPlayer";
import type { NodeOptions } from "../utils/Interfaces";
export interface FriesEvents<T = unknown> {
    playerMove(player: Player<T>, voiceChannel: string, dataVoiceChannel: string): void;
    playerDisconnect(player: Player<T>, voiceChannel: string): void;
}
export default class LavaFries<T = unknown> extends TypedEmitter<FriesEvents<T>> {
    client: any;
    nodeOptions: NodeOptions[];
    shards: number;
    nodeCollection: Collection<any, any>;
    playerCollection: Collection<any, any>;
    constructor(client: any, node: any[]);
    get leastLoadNode(): any | any[];
    post(data: any): void;
    connect(nodeOptions: any): any;
    create(options: any, queueOption?: any): any;
    private handleStateUpdate;
}
