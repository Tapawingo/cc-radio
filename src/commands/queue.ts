/*
 * Author: Eric
 * Generic play command
 * 
 * Arguments:
 * 0: Argument <TYPE>
 */

import { Client, Message, TextChannel, VoiceChannel } from "discord.js";
import { MessageCommand, MessageCommandArgument } from '../modules/command'
import { useGuildStore } from "../store";
import { Track } from "../modules/queue";
import { queueEmbed } from '../embeds/queue'

export const command = new MessageCommand({
    name: 'queue',
    alias: ['q'],
    description: 'Retrieves current queue',
    args: [
        { name: 'Page', description: 'page to display', required: false }
    ],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return;
        if (!message.member.voice.channel) return;

        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        const page = args[0] ? Number(args[0]) : 1;

        message.reply({ embeds: [queueEmbed(storedGuild.player.getQueue(), page)], allowedMentions: { repliedUser: false } });
    }
});