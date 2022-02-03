/* eslint-disable no-param-reassign */
export default class EmbedUtil {
    public static resolveColor(color: any) {
        if (typeof color !== "string") {
            if (color === "RANDOM") return Math.floor(Math.random() * (0xffffff + 1));
            if (color === "DEFAULT") return 0;
            color = parseInt(color.replace("#", ""), 16);
        } else if (Array.isArray(color)) {
            // eslint-disable-next-line no-bitwise
            color = (color[0] << 16) + (color[1] << 8) + color[2];
        }

        if (color < 0 || color > 0xffffff) throw new RangeError("Color range too low or exceeds maximum range.");
        else if (Number.isNaN(color)) throw new TypeError("Provided value isn\"t a number.");
        return color;
    }

    public static cloneObject(obj: object): any {
        return Object.assign(Object.create(obj), obj);
    }

    public static verifyString(data: any, error = Error, errorMessage = `Expected a string, got ${data} instead.`, allowEmpty = true): any {
        // eslint-disable-next-line new-cap
        if (typeof data !== "string") throw new error(errorMessage);
        // eslint-disable-next-line new-cap
        if (!allowEmpty && data.length === 0) throw new error(errorMessage);
        return data;
      }
}