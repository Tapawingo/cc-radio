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
    name: 'toIndex',
    alias: ['ti'],
    description: 'Skips to given index in queue',
    args: [
        { name: 'Index', description: 'Index in queue to skip to.', required: false }
    ],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return;
        if (!message.member.voice.channel) return;
        if (!args[0]) {
            message.reply({ content: `Argument: INDEX missing`, allowedMentions: { repliedUser: false } });
            return;
        };

        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        const track = storedGuild.player.getQueue().getTrack(Number(args[0]));
        if (!track) {
            message.reply({ content: `Index doesn't exist`, allowedMentions: { repliedUser: false } });
            return;
        };
        storedGuild.player.playIndex(Number(args[0]));
    }
});