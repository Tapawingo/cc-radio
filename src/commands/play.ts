/*
 * Author: Eric
 * Generic play command
 * 
 * Arguments:
 * 0: Argument <TYPE>
 */

import { Client, GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import { MessageCommand, MessageCommandArgument } from '../modules/command'
import path from 'node:path'
import fs from 'node:fs'
import { SourceValidationStatus, Source } from '../modules/player'
import { useGuildStore } from "../store";
import { TrackMeta } from "../modules/queue";
import { playEmbed } from '../embeds/play'

export const command = new MessageCommand({
    name: 'play',
    alias: ['p'],
    description: 'Plays song',
    args: [
        { name: 'Source', description: 'link to track or query', required: false },
        { name: 'File', description: 'File upload', required: false }
    ],
    execute: async (client: Client, message: Message, args: Array<string>) => {
        console.log(`Received Command: ${ message.content }`);

        if (!message.member) return
        if (!message.member.voice.channel) {
            message.reply({ content: `You need to be in a voice channel`, allowedMentions: { repliedUser: false } })
            return
        };

        const handlersPath = path.join(__dirname, '../handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.ts'));

        // @TODO Add file handler for playing files
        // @TODO Add Soundcloud handler
        // @TODO Add Deezer handler
        // @TODO ?Add generic link handler
        const handler = handlerFiles.find((file: string) => {
            const filePath = path.join(handlersPath, file);
            const { urlValidate } = require(filePath);

            const source: Source = urlValidate(args);
            return source.code === SourceValidationStatus.Track || source.code === SourceValidationStatus.Playlist;
        });

        if (!handler) {
            message.reply({ content: `Unknown source`, allowedMentions: { repliedUser: false } })
            console.warn(`[COMMAND] Play failed with error: [UNSH] No source handler`);
            return
        };

        const handlerPath = path.join(handlersPath, handler);
        const { urlValidate, getSourceMeta } = require(handlerPath);
        const source: Source = await urlValidate(args, message);

        if (!source) {
            message.reply({ content: `[COMMAND] Play failed with error: [AMS] Missing or mangled Source`, allowedMentions: { repliedUser: false } });
            console.warn(`[COMMAND] Play failed with error: [AMS] Missing or mangled Source`);
            return
        };

        const tracks = await getSourceMeta(source, args, message);
        const storedGuild = await useGuildStore.newPlayer(message.member.voice.channel as VoiceChannel, message.channel as TextChannel);
        
        tracks.map((track: TrackMeta) => {
            storedGuild.player.queue.addTrack({
                handler: require(handlerPath),
                meta: track,
                author: message.member as GuildMember
            });
        });

        if (tracks.length === 1) {
            message.reply({ embeds: [playEmbed(tracks[0])], allowedMentions: { repliedUser: false } });
        } else {
            message.reply({ content: `Queued **${ tracks.length }** tracks`, allowedMentions: { repliedUser: false } });
        }
        storedGuild.player.start();
    }
});