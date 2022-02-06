import { Client, Collection } from "eris";
import { readdirSync } from "fs";
import configDotenv from "./deps/dotenv";
import { FriesLava } from "./deps/lavafries/index";

const client: any = new Client(process.env.TOKEN, {
    intents: ["guilds", "guildVoiceStates"],
    allowedMentions: { roles: false, everyone: false },
    restMode: true,
});

client.commands = new Map<any, any>();

const nodes: any[] = [
    {
        host: "localhost",
        port: 2333,
        password: "youshallnotpass",
        retries: 5,
        shards: 1,
        secure: false,
    },
];

client.manager = new FriesLava(client, nodes);
