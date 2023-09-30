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
import { timeFormat } from '../modules/player'

export const command = new MessageCommand({
    name: 'nowPlaying',
    alias: ['np'],
    description: 'Retrieves current song',
    args: [],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return;
        if (!message.member.voice.channel) return;

        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        if (!storedGuild) {
            message.reply({ content: `**Now Playing:** Nothing`, allowedMentions: { repliedUser: false } });
            return;
        };
        const currentTrack = storedGuild.player.getQueue().getCurrentTrack();
        if (!currentTrack) {
            message.reply({ content: `**Now Playing:** Nothing`, allowedMentions: { repliedUser: false } });
            return;
        };

        const duration = timeFormat(currentTrack.meta.duration, { minutes: true });
        const current = timeFormat((Date.now() - storedGuild.player.getStartedPlaying()) / 1000, { minutes: true, hours: duration.length > 5 });
        message.reply({ content: `**Now Playing:** ${ currentTrack.meta.title } (${ current } / ${ duration })`, allowedMentions: { repliedUser: false } });
    }
});