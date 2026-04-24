import { client } from "./client";
import { config } from "./config";

client.once("clientReady", (c) => {
    console.log(`Logged in as ${c.user.tag}`);
});

client.login(config.token);