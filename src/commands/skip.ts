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

export const command = new MessageCommand({
    name: 'skip',
    alias: ['s'],
    description: 'Skips song',
    args: [],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return;
        if (!message.member.voice.channel) return;

        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        const currentTrack = storedGuild.player.getQueue().getCurrentTrack();
        if (!currentTrack) {
            message.reply({ content: `**Nothing to skip**`, allowedMentions: { repliedUser: false } });
            return;
        };
        message.reply({ content: `Skipped **${ currentTrack.meta.title }**`, allowedMentions: { repliedUser: false } });
        storedGuild.player.playNext();
    }
});