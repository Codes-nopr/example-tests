/* eslint-disable no-console */
export default class Logger {
    public static red(text: string): void {
        if (typeof text !== "string") throw new TypeError("Text must be a strung data.");
        console.error(`\u001b[91m\u001b[31m${text}`);
    }

    public static green(text: string): void {
        if (typeof text !== "string") throw new TypeError("Text must be a strung data.");
        console.error(`\u001b[92m\u001b[31m${text}`);
    }
}
