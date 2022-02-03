export interface toJSON {
    title?: string,
    type?: string,
    description?: string,
    url?: string,
    timestamp?: any,
    color?: string,
    fields?: any[],
    thumbnail?: string | unknown,
    image?: string | unknown,
    author?: any | any[],
    footer?: any | any[],
}

export interface InteractionStructure {
    id: any,
    name: string | string[],
    type: number | [],
    resolved?: {
        users?: Map<any, any>,
        members?: Map<any, any>,
        roles?: Map<any, any>,
        channels?: Map<any, any>,
        messages?: Map<any, any>,
    },
    options?: {
        name: string,
        type: number,
        value?: string | number,
        options?: any[],
        focused?: boolean,
    },
    custom_id?: string,
    component_type?: number,
    values?: any,
    target_id?: any,

    [Symbol.iterator]: any,
}
