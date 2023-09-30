/*
 * Author: Eric
 * Audio Player Class
 */

import { Channel, Guild, TextChannel } from "discord.js";
import { CreateAudioPlayerOptions, createAudioPlayer, AudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, entersState, PlayerSubscription, AudioResource } from "@discordjs/voice";
import Queue from './queue'
import Connection from './connection'
import { useGuildStore } from "../store";
import { useMonitor } from "../monitor/monitor";

export const timeFormat = (seconds: number, options?: any): string => {
    var intSeconds = Math.floor(seconds);
    
    var hours = Math.floor((intSeconds %= 86400) / 3600);
    var minutes = Math.floor((intSeconds %= 3600) / 60);
    var seconds = intSeconds % 60;

    if (hours || options?.hours) return `${ hours ? hours : 0 }:${ ('0' + (minutes ? minutes : 0)).slice(-2) }:${ ('0' + seconds).slice(-2) }`;
    if (minutes || options?.minutes) return `${ minutes ? minutes : 0 }:${ ('0' + seconds).slice(-2) }`;
    if (seconds) return seconds.toString();
    return '0';
};

export enum SourceValidationStatus {
    // Failed to validate URL
    Fail = 0,
    // Valid URL but unknown content (searches, channels etc.)
    Unknown = 100,
    // Video type
    Track = 200,
    // Playlist type
    Playlist = 201
}

export enum AudioPlayerRepeat {
    Off = 0,
    Queue = 1,
    Track = 2
}

export interface Source {
    code: SourceValidationStatus,
    source?: string
}

export default class Player {
    guild: Guild;
    replyChannel?: Channel;
    player: AudioPlayer;
    connection: Connection;
    queue: Queue;
    status: AudioPlayerStatus = AudioPlayerStatus.Idle;
    subscription?: PlayerSubscription;
    currentResource?: AudioResource | null;
    timeout: number = 300_000;
    startedPlaying: number = Date.now();
    repeat: AudioPlayerRepeat = AudioPlayerRepeat.Off; // @TODO Allow repeating
    shuffle: boolean = false; // @TODO Allow Shuffle

    constructor(guild: Guild, connection: Connection, queue?: Queue, options?: CreateAudioPlayerOptions) {
        this.guild = guild;
        this.connection = connection;
        this.queue = queue || new Queue(guild);
        this.player = createAudioPlayer(options || { behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });

        this.player.on(AudioPlayerStatus.Idle, this.autoPlay);
        this.player.on(AudioPlayerStatus.Idle, this.timeoutCallback);
        this.player.on('stateChange', this.statusMessages);
        this.player.on('stateChange', (oldState: any, newState: any) => { this.status = newState.status; });
        process.on('exit', this.cleanUp);
    };

    public on = (event: AudioPlayerStatus | string, callback: Function) => {
        this.player?.on(event as AudioPlayerStatus, callback as any);
    };

    public playNext = async () => {
        const nextTrack = this.queue.next();
        // Stop music from playing
        if (!nextTrack) {
            this.player.stop();
            this.currentResource = null;
            return
        };

        const { getSourceStream } = nextTrack.handler;
        const audioResource = await getSourceStream(nextTrack);
        
        this.player.play(audioResource);
        this.subscription = this.connection.connection?.subscribe(this.player);
        this.currentResource = audioResource;
        useMonitor.render();
    };

    public playIndex = async (index: number) => {
        const track = this.queue.setIndex(index);
        if (!track) {
            console.log(`[${ this.guild.id }] [playIndex] Index out of scope: ${ index } (queue: ${ this.queue.getAllTracks().length })`);
            return;
        };

        const { getSourceStream } = track.handler;
        const audioResource = await getSourceStream(track);
        
        this.player.play(audioResource);
        this.subscription = this.connection.connection?.subscribe(this.player);
        useMonitor.render();
    };

    public start = () => {
        if (this.status !== AudioPlayerStatus.Playing && this.status !== AudioPlayerStatus.Buffering) {
            this.connection.joinChannel();
            this.playNext();
        };
    };

    public leave = () => {
        try { this.player?.stop() } catch(err){};
        try { this.subscription?.unsubscribe() } catch(err){};
        try { this.connection.connection?.destroy() } catch(err){};
    };

    public destroy = () => {
        this.leave();
        try { useGuildStore.deletePlayer(this.guild); } catch(err){};
    };

    public getPlayer = (): AudioPlayer => {
        return this.player;
    };

    public getStatus = (): AudioPlayerStatus => {
        return this.status;
    };

    public getQueue = (): Queue => {
        return this.queue;
    };

    public getStartedPlaying = (): number => {
        return this.startedPlaying;
    };

    private autoPlay = async () => {
        this.playNext();
    };

    private timeoutCallback = async () => {
        if (this.timeout !== -1) {
            try {
                await entersState(this.player, AudioPlayerStatus.Playing, this.timeout);
            } catch (error) {
                this.destroy();

                const storedGuild = useGuildStore.getPlayer(this.guild.id);
                if (storedGuild) {                    
                    const repyChannel = this.guild.client.channels.cache.get(storedGuild.replyChannel.id) as TextChannel;
                    const song = this.queue.getCurrentTrack();
                    await repyChannel.send({ content: `Left voice channel` });
                }
            }
        }
    };

    private cleanUp = () => {
        this.player?.stop();
    }

    public statusMessages = async (oldState: any, newState: any) => {
        const storedGuild = useGuildStore.getPlayer(this.guild.id);
        if (!storedGuild) return;

        if (newState.status === AudioPlayerStatus.Buffering) {
            const repyChannel = this.guild.client.channels.cache.get(storedGuild.replyChannel.id) as TextChannel;
            const song = this.queue.getCurrentTrack();
            const message = await repyChannel.send({ content: `**Buffering:** ${ song.meta.title }` });
            console.log(`[${ this.guild.id }] [STATECHANGE] Buffering "${ song.meta.title }" (${ song.meta.source })`);

            try {
                await entersState(this.player, AudioPlayerStatus.Playing, 10_000);
                this.startedPlaying = Date.now();
                message.edit(`**Now Playing:** ${ song.meta.title }`);
            } catch (error) {
                console.warn(`[${ this.guild.id }] Failed to buffer track`);
            }
            return;
        };

        console.log(`[${ this.guild.id }] [STATECHANGE] ${ newState.status }`);
    };
}