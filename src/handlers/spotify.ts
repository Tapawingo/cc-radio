/*
 * Author: Eric
 * Handles Spotify links
 */

import { Track, TrackMeta } from '../modules/queue'
import { SourceValidationStatus, Source } from '../modules/player'
import { sp_validate, spotify, search, playlist_info, YouTubeVideo, setToken, is_expired, refreshToken, stream, SpotifyTrack, SpotifyPlaylist, Spotify } from 'play-dl'
import { Client } from 'discord.js';
import { AudioResource, createAudioResource } from '@discordjs/voice';
const config = require('../bot.config.json');

export const meta = "spotify";

export const ready = (client: Client) => {
    setToken({
        spotify : {
        client_id: config.handlerSettings.spotify.client_id,
        client_secret: config.handlerSettings.spotify.client_secret,
        refresh_token: config.handlerSettings.spotify.refresh_token,
        market: 'NO'
        }
    });
    console.log(`Registered spotify token`);
};

const refreshTokens = async () => {
    if (is_expired()) {
        await refreshToken()
    };
};

export const urlValidate = (args: Array<string>): Source => {
    refreshTokens();

    const source = args.find((arg: string) => {
        return arg.startsWith('http');
    });

    if (!source) return { code: SourceValidationStatus.Fail };

    const validatedSource = sp_validate(source);
    if (validatedSource === 'track') return { code: SourceValidationStatus.Track, source: source };
    if (validatedSource === 'playlist') return { code: SourceValidationStatus.Playlist, source: source };
    if (validatedSource === 'album') return { code: SourceValidationStatus.Playlist, source: source };

    return { code: SourceValidationStatus.Unknown };
};

export const getSourceMeta = async (source: Source, args: Array<string>): Promise<Array<TrackMeta> | undefined> => {
    if (!source.source) return [];

    if (source.code === SourceValidationStatus.Track) {
        const data = (await spotify(source.source)) as SpotifyTrack;
        const ytData = await search(`${ data.name } ${ data.artists.map((artist) => { return artist.name }).toString() }`, { limit: 1, source: { youtube: "video" } });
        console.debug(`${ data.name } ${ data.artists.map((artist) => { return artist.name }).toString() }`);

        if (ytData[0]) {            
            return [{
                source: ytData[0].url,
                title: ytData[0].title || '',
                duration: ytData[0].durationInSec
            }];
        }
    };

    if (source.code === SourceValidationStatus.Playlist) {
        const data = (await spotify(source.source)) as SpotifyPlaylist;
        const tracks = await data.all_tracks();
        const meta: Array<TrackMeta> = [];
        await tracks.forEach(async (track: SpotifyTrack) => { // @TODO fix queueing issue with playlists
            const ytData = await search(`${track.name} ${track.artists.toString()}`, { limit: 1, source: { youtube: "video" } });
            if (ytData[0]) {                
                meta.push({
                    source: ytData[0].url,
                    title: ytData[0].title || '',
                    duration: ytData[0].durationInSec
                });
            };
        });

        return meta;
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