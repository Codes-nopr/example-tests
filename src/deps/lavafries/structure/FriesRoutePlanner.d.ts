import Node from "./FriesNode";
export default class FriesRoutePlanner {
    node: Node;
    status(): Promise<unknown | undefined>;
    freeAddress(address: string): Promise<boolean>;
    freeAllAddress(): Promise<boolean>;
}
