/*
 * Author: Eric
 * Main entry point
 */

import { Client, GatewayIntentBits, Events, Message } from "discord.js";
import path from 'node:path'
import fs from 'node:fs'
import { useMonitor } from './monitor/monitor'
const config = require('./bot.config.json');
// @TODO make all this into a class
var initStartTime = performance.now();
console.info(`initializing bot`)

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageTyping];
const client = new Client({ intents: intents });

useMonitor.setClient(client);
useMonitor.start();

const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.ts'));

// Once ready
client.once(Events.ClientReady, () => {
    for (const file of handlerFiles) {
        const filePath = path.join(handlersPath, file);
        const { ready } = require(filePath);
        ready(client);
    };
    var initEndTime = performance.now();
    console.info(`Initialized ${ client.user?.tag } (${ (initEndTime - initStartTime).toFixed(2) } ms)`);
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

// On new message
client.on(Events.MessageCreate, (message: Message) => {
    /* Ignore all bots */
    if (message.author.bot) return;

    /* Ignore messages not starting with the prefix */
    if (message.content.indexOf(config.commandSettings.prefix) !== 0) return;

    const args: Array<string> = message.content.slice(config.commandSettings.prefix.length).trim().split(/ +/g);
    const userCommand = args.shift()!.toLowerCase();

    const commandFile = commandFiles.find((file: string) => {
        const filePath = path.join(commandsPath, file);
        const { command } = require(filePath);
        return command.isCommand(userCommand);
    });

    if (!commandFile) return;

    const { command } = require(path.join(commandsPath, commandFile));
    command.execute(client, message, args);
});

client.login(config.auth.bot_token);