const embedUtil = require("./embedUtil");
import type { toJSON } from "./interfaces";

export default class RichEmbed {
    public type: any;

    public title?: string;

    public description?: string;

    public url?: string;

    public color?: any;

    public timestamp?: number;

    public fields: any[];

    public thumbnail?: { url?: string; proxyURL?: string; height?: number; width?: number; };

    public image?: { url?: string; proxyURL?: string; height?: number; width?: number; };

    public author?: { name?: string; url?: string; iconURL?: string; proxyIconURL?: string; };

    public provider?: { name?: string; url: string; };

    public footer?: { text?: string; iconURL?: string; proxyIconURL?: string; };

    public constructor(data = {}, skipValidation = true) {
        this.setup(data, skipValidation);
    }

    public setup(data: any, skipValidation: any): void {
        this.type = data?.type ?? "rich";
        this.title = data?.title ?? null;
        this.description = data?.description ?? null;
        this.url = data?.url ?? null;
        this.color = "color" in data ? embedUtil.resolveColor(data.color) : null;
        this.timestamp = "timestamp" in data ? new Date(data.timestamp).getTime() : null;
        this.fields = [];
        if (data.fields) {
            this.fields = skipValidation ? data?.fields?.map(embedUtil.cloneObject)
            // @ts-ignore: Normalize fields
            : this.constructor.normalizeFields(data?.fields);
        }
        this.thumbnail = data?.thumbnail ? {
            url: data.thumbnail?.url ?? null,
            proxyURL: data.thumbnail?.proxyURL ?? data?.thumbnail?.proxy_url ?? null,
            height: data.thumbnail?.height ?? 0,
            width: data.thumbnail?.width ?? 0,
        } : null;
        this.image = data?.image ? {
          url: data.image?.url ?? null,
          proxyURL: data.image?.proxyURL ?? data?.image?.proxy_url ?? null,
          height: data.image?.height ?? 0,
          width: data.image?.width ?? 0,
        } : null;
        this.author = data?.author ? {
          name: data.author?.name ?? null,
          url: data.author?.url ?? null,
          iconURL: data?.author?.iconURL ?? data?.author?.icon_url ?? null,
          proxyIconURL: data?.author?.proxyIconURL ?? data?.author?.proxy_icon_url ?? null,
        } : null;
        this.provider = data?.provider ? {
          name: data.provider?.name ?? null,
          url: data.provider?.name ?? null,
        } : null;
        this.footer = data?.footer ? {
          text: data.footer?.text,
          iconURL: data.footer?.iconURL ?? data.footer?.icon_url ?? null,
          proxyIconURL: data.footer?.proxyIconURL ?? data.footer?.proxy_icon_url ?? null,
        } : null;
    }

    public get createdAt(): unknown | null {
        return this.timestamp ? new Date(this.timestamp) : null;
    }

    public get hexColor(): string | null {
        return this.color ? `#${this.color.toString(16).padStart(6, "0")}` : null;
    }

    public get length(): number | undefined {
        return (
            (this.title.length ?? 0)
            + (this.description.length ?? 0)
            + (this.fields.length >= 1
              ? this.fields.reduce((prev, curr) => prev + curr.name.length + curr.value.length, 0)
              : 0)
            + (this.footer.text.length ?? 0)
            + (this.author.name.length ?? 0)
          );
    }

    public addField(name: string, value?: any | any[], inline?: boolean): any {
        return this.addFields({ name, value, inline });
    }

    public addFields(...fields: any[]): this {
        // @ts-ignore: NormalizeFields
        this.fields.push(...this.constructor.normalizeFields(fields));
        return this;
    }

    public setAuthor(name: string, iconURL?: string, url?: string): this {
        this.author = { name: embedUtil.verifyString(name, RangeError, "EMBED_AUTHOR_NAME"), iconURL, url };
        return this;
    }

    public setColor(color: string): this {
        this.color = embedUtil.resolveColor(color);
        return this;
    }

    public setDescription(description: string): this {
        this.description = embedUtil.verifyString(description, RangeError, "EMBED_DESCRIPTION");
        return this;
    }

    public setFooter(text: string, iconURL?: string): this {
        this.footer = { text: embedUtil.verifyString(text, RangeError, "EMBED_FOOTER_TEXT"), iconURL };
        return this;
    }

    public setImage(url: string): this {
        this.image = { url };
        return this;
    }

    public setThumbnail(url: string): this {
        this.thumbnail = { url };
        return this;
    }

    public setTimestamp(timestamp = Date.now() as any): this {
        // eslint-disable-next-line no-param-reassign
        if (timestamp instanceof Date) timestamp = timestamp.getTime();
        this.timestamp = timestamp;
        return this;
    }

    public setTitle(title: string): this {
        this.title = embedUtil.verifyString(title, RangeError, "EMBED_TITLE");
        return this;
    }

    public setURL(url: string): this {
        this.url = url;
        return this;
    }

    protected toJSON(): toJSON {
        return {
          title: this.title,
          type: "rich",
          description: this.description,
          url: this.url,
          timestamp: this.timestamp && new Date(this.timestamp),
          color: this.color,
          fields: this.fields,
          thumbnail: this.thumbnail,
          image: this.image,
          author: this.author && {
            name: this.author.name,
            url: this.author.url,
            icon_url: this.author.iconURL,
          },
          footer: this.footer && {
            text: this.footer.text,
            icon_url: this.footer.iconURL,
          },
        };
    }

    public static normalizeField(name: any, value: any, inline: boolean = false) {
        return {
          name: embedUtil.verifyString(name, RangeError, "EMBED_FIELD_NAME", false),
          value: embedUtil.verifyString(value, RangeError, "EMBED_FIELD_VALUE", false),
          inline,
        };
    }

    public static normalizeFields(...fields: any[]) {
        return fields
          .flat(2)
          .map((field) => this.normalizeField(field.name, field.value, typeof field.inline === "boolean" ? field.inline : false));
    }
}
