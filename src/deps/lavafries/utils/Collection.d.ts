export default class Collection<K, V> extends Map<K, V> {
    get first(): V;
    get firstKey(): K;
    get last(): V;
    get lastKey(): K;
    getSome(amount: number, position: "start" | "end"): V[] | undefined;
    toArray(): V[];
    KArray(): [K, V][];
    map<T>(func: (value: V, key: K) => T): T[];
}
