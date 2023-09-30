/*
 * Author: Eric
 * Handles User Queries
 */

import { Track, TrackMeta } from '../modules/queue'
import { SourceValidationStatus, Source } from '../modules/player'
import { search, playlist_info, YouTubeVideo, setToken, stream } from 'play-dl'
import { Client } from 'discord.js';
import { AudioResource, createAudioResource } from '@discordjs/voice';
const config = require('../bot.config.json');

export const meta = "youtube";

export const ready = (client: Client) => {

};

export const urlValidate = (args: Array<string>): Source => {
    const source = args.find((arg: string) => {
        return arg.startsWith('http');
    });

    if (source) return { code: SourceValidationStatus.Fail };

    return { code: SourceValidationStatus.Track, source: args.join(' ') };
};

export const getSourceMeta = async (source: Source, args: Array<string>): Promise<Array<TrackMeta> | undefined> => {
    if (!source.source) {
        return []
    }

    if (source.code === SourceValidationStatus.Track) {
        const data = await search(source.source);
        if (data[0]) {            
            return [{
                source: data[0].url,
                title: data[0].title || '',
                duration: data[0].durationInSec
            }];
        }
    };
};

export const getSourceStream = async (track: Track): Promise<AudioResource> => {
    var readableStream = await stream(track.meta.source, {
        quality: 0,
        discordPlayerCompatibility: true
      });

      return createAudioResource(readableStream.stream, {
        inputType: readableStream.type
      });
}