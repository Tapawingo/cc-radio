/*
 * Author: Eric
 * Generic help command
 * 
 * Arguments:
 * 0: Argument <TYPE>
 */

import { Client, Message } from "discord.js";
import { MessageCommand, MessageCommandArgument } from '../modules/command'
import { helpEmbed } from '../embeds/help'
import path from 'node:path'
import fs from 'node:fs'

export const command = new MessageCommand({
    name: 'help',
    alias: ['h'],
    description: 'Displays help command',
    args: [
        { name: 'Command', description: 'Display help for specific command', required: false }
    ],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        var helpMessage = `__HELP MESSAGE__ (very much temporary)\n`;

        const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.ts'));
        const commands = commandFiles.map((file: string) => {
            const filePath = path.join(__dirname, file);
            const { command } = require(filePath);
            return command;
        });

        if (args[0]) {
            const commandD = commands.find((commandD: MessageCommand) => {
                return commandD.isCommand(args[0]);
            });

            if (commandD) {
                message.reply({ embeds: [helpEmbed(commandD)], allowedMentions: { repliedUser: false } });
                return;
            }
            
            message.reply({ content: `Unknown Command`, allowedMentions: { repliedUser: false } });
            return;
        }



        message.reply({ embeds: [helpEmbed(commands)], allowedMentions: { repliedUser: false } });
    }
});