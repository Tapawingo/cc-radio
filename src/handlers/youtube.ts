/*
 * Author: Eric
 * Handles Youtube links
 */

import { Track, TrackMeta } from '../modules/queue'
import { SourceValidationStatus, Source } from '../modules/player'
import { yt_validate, video_info, playlist_info, YouTubeVideo, setToken, stream } from 'play-dl'
import { Client, Message } from 'discord.js';
import { AudioResource, createAudioResource } from '@discordjs/voice';
const config = require('../bot.config.json');

export const meta = "youtube";

export const ready = (client: Client) => {
    setToken(config.handlerSettings.youtube)
    console.log(`Registered youtube token`);
};

export const urlValidate = (args: Array<string>): Source => {
    const source = args.find((arg: string) => {
        return arg.startsWith('http');
    });

    if (!source) return { code: SourceValidationStatus.Fail };

    const validatedSource = yt_validate(source);
    if (validatedSource === 'video') return { code: SourceValidationStatus.Track, source: source };
    if (validatedSource === 'playlist') return { code: SourceValidationStatus.Playlist, source: source };

    return { code: SourceValidationStatus.Unknown };
};

export const getSourceMeta = async (source: Source, args: Array<string>, message: Message): Promise<Array<TrackMeta> | undefined> => {
    if (!source.source) {
        return []
    }

    if (source.code === SourceValidationStatus.Track) {
        try {            
            const data = await video_info(source.source);
            return [{
                source: source.source,
                title: data.video_details.title || '',
                duration: data.video_details.durationInSec,
                thumbnails: data.video_details.thumbnails
            }];
        } catch (error) {
            message.reply({ content: `Something went wrong`, allowedMentions: { repliedUser: false } });
            return [];
        }
    };

    if (source.code === SourceValidationStatus.Playlist) {
        try {
            const data = await playlist_info(source.source, { incomplete : true });
            const tracks = await data.all_videos();
            const meta: Array<TrackMeta> = [];
            tracks.forEach((value: YouTubeVideo) => { // @BUG playlists fail to queue
                meta.push({
                    source: value.url,
                    title: value.title || '',
                    duration: value.durationInSec,
                    thumbnails: value.thumbnails
                });
            });
    
            return meta;
        } catch (err: any) {
            console.error(err);
            message.reply({ content: `Something went wrong`, allowedMentions: { repliedUser: false } });
            return [];
        };
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