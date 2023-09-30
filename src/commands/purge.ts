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
    name: 'purge',
    alias: ['pu'],
    description: 'Purges current queue',
    args: [],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return;
        if (!message.member.voice.channel) return;

        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        const tracks = storedGuild.player.getQueue().getAllTracks();
        storedGuild.player.getPlayer().stop();
        storedGuild.player.getQueue().destroy();
        message.reply({ content: `Purged ${ tracks.length } tracks`, allowedMentions: { repliedUser: false } });
    }
});