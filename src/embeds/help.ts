/*
 * Author: Eric
 * Constructs "help" embed
 */

import { EmbedBuilder, Message } from "discord.js";
import Queue from "../modules/queue";
import { timeFormat } from '../modules/player'
import config from '../bot.config.json'
import { MessageCommand, MessageCommandArgument } from "../modules/command";

const formatCommand = (embed: EmbedBuilder, command: MessageCommand): EmbedBuilder => {
    return embed
        .setDescription(`## ${command.getName()} (${ command.getAlias().toString() })\n ${ command.getDescription() }`)
        .setFields([
            { name: `SYNPOSIS`, value: `${ command.getName() } ${ command.getArgs().map((arg: MessageCommandArgument) => { return arg.required ? arg.name.toUpperCase() : `[${ arg.name.toUpperCase() }]` }).toString() }` },
            { name: `DESCRIPTION`, value: `${ command.getArgs().map((arg: any) => { return ` __${ arg.name }__\n  ${ arg.description }\n` }).toString() }` }
        ]);
};

const formatHelp = (embed: EmbedBuilder, commands: Array<MessageCommand>): EmbedBuilder => {
    var out: Array<any> = [];

    for (const command of commands) {
        out.push({ 
            name: `${ command.getName() } (${ command.getAlias().toString() })`,
            value: command.getDescription()
        });
    };
	
	embed.setDescription('Type `.h <command>` to get more detailed command use');

    return embed.setFields(out);
};

export const helpEmbed = (command: Array<MessageCommand> | MessageCommand) => {
    const embed =  new EmbedBuilder()
        .setColor(13632027)
        .setTitle('Help')
        .setThumbnail('https://cdn.discordapp.com/attachments/325719272745861126/1085462710847819816/cc_radio.jpg')
        .setAuthor({ name: `.help (.h)` })

    return Array.isArray(command) ? formatHelp(embed, command) : formatCommand(embed, command);
}