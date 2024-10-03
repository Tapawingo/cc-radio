import path from 'path';
import fs from 'fs';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { config, env } from "./config";

import './utils/console';
import parseCommand from './utils/parseCommand';

const initStartTime = performance.now();
console.info(`Initializing Bot...`, 'BOT');

const intents = [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
];

const client = new Client({ intents: intents });

const modulesPath = path.join(__dirname, 'modules');
const modules = fs.readdirSync(modulesPath);

client.commands = new Collection();

client.once(Events.ClientReady, () => {
    for (const module of modules) {
        let loadTimeStart = performance.now();
        console.info(`Loading "${ module }" module..`, 'BOT');
        const modulePath = path.join(modulesPath, module);
        const moduleIndexPath = path.join(modulePath, 'index.ts');

        if (fs.existsSync(moduleIndexPath)) {
            const moduleIndex = require(moduleIndexPath);
            moduleIndex(client);
        }

        const commandsPath = path.join(modulePath, 'commands');
        if (fs.existsSync(commandsPath)) {
            const commands = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

            for (const file of commands) {
                console.debug(`Registering command "${ file.replace('.ts', '') }"`, 'BOT');
                const commandPath = path.join(commandsPath, file);
                const command = require(commandPath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);

                    if (command.data.alias) {
                        command.data.alias.forEach((alias: string) => {
                            client.commands.set(alias, command);
                        })
                    }
                } else {
                    console.warn(`The command at ${ commandPath } is missing a required "data" or "execute" property.`);
                }
            }
        }

        let loadTimeEnd = performance.now();
        console.info(`Loaded "${ module }" module (${ (loadTimeEnd - loadTimeStart).toFixed(2) }ms)`, 'BOT');
    };

    const initEndTime = performance.now();
    console.info(`Bot fully initialized! (${ (initEndTime - initStartTime).toFixed(2) }ms)`, 'BOT');
});

/* Handle interactions */
client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        console.info(`Received command ${ interaction.commandName }`);
    
        if (!command) {
            console.error(`No command matching ${ interaction.commandName } was found.`, 'BOT');
            interaction.reply({ content: '[INTERNAL ERROR] Could not find command', ephemeral: true });
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e, 'BOT');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    };
});

/* Handle message commands */
if (config.bot.command_prefix) {
    client.on(Events.MessageCreate, async message => {
        if (message.author.bot || !message.content.startsWith(config.bot.command_prefix)) return;
        const messageCommand = parseCommand(message);
        
        const command = client.commands.get(messageCommand.command);
        if (!command) return;
        
        console.debug(`Received Message Command "${ messageCommand.command }"`);
        try {
            await command.execute(messageCommand);
        } catch (e: any) {
            console.error(e, 'BOT');
            await message.reply({ content: `There was an error while executing this command (${ e.name })!`, allowedMentions: { users: [] } });
        }
    });
}

/* Handle errors */
client.on(Events.Error, e => {
    console.error(e, 'DISCORDJS');
});

if (parseInt(env.LOG_LEVEL ?? '1') < 1) {
    process.on('uncaughtException', (e) => {
        console.error(e, 'UNCAUGHT');
    });
}

client.on(Events.Debug, d => {
    console.debug(d, 'DISCORDJS');
});

client.login(config.bot.token);