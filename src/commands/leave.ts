/*
 * Author: Eric
 * Generic play command
 * 
 * Arguments:
 * 0: Argument <TYPE>
 */

import { Client, GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import { MessageCommand, MessageCommandArgument } from '../modules/command'
import { useGuildStore } from "../store";

export const command = new MessageCommand({
    name: 'leave',
    alias: ['l'],
    description: 'Leave voice channel',
    args: [],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return;
        if (!message.member.voice.channel) return;

        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        storedGuild.player.destroy();
        message.reply({ content: `Left voice channel`, allowedMentions: { repliedUser: false } });
    }
});