/*
 * Author: Eric
 * Music Queue Class
 */

import { TextChannel, Guild, GuildMember } from "discord.js";
import { Source } from "./player";
import { useGuildStore } from "../store";
import { useMonitor } from "../monitor/monitor";

export interface TrackMeta {
    source: string,
    title: string,
    duration: number,
    thumbnails?: any // Actual type YouTubeThumbnail is missing from play-dl def
};

export interface handler {
    meta: string
    ready?: Function
    urlValidate: Function
    getSourceMeta: Function
    getSourceStream: Function
}

export interface Track {
    handler: handler,
    meta: TrackMeta,
    author: GuildMember
};

export default class Queue {
    guild: Guild;
    queue: Array<Track> = [];
    index: number = -1;

    constructor(guild: Guild, queue?: Array<Track>) {
        this.guild = guild;

        if (queue) {
            this.queue = queue;
        };
    };

    public addTrack = (track: Track): number => {
        console.log(`[${ this.guild.id }] [QUEUE] Queued "${ track.meta.title }" (${ track.meta.source })`);
        useMonitor.render();

        return this.queue.push(track);
    };

    public removeTrack = (track: number): void => {
        this.queue.splice(track, 1);
    };

    public next = (): Track | null => {
        if (this.index + 1 === this.queue.length) {
            console.log(`[${ this.guild.id }] [QUEUE] Reached end of queue`);
            return null;
        };
        
        this.index++;
        return this.queue[this.index];
    };

    public previous = (): Track | null => {
        if (this.index === 0) {            
            return null
        };
        
        this.index--;
        return this.queue[this.index];
    };

    public setIndex = (index: number): Track | null => {
        if (!this.queue[index]) {            
            return null
        };
        
        this.index = index;
        return this.queue[this.index];
    };

    public getTrack = (index: number): Track => {
        return this.queue[index];
    };

    public getCurrentTrack = (): Track => {
        return this.queue[this.index];
    };

    public getPreviousTrack = (): Track | null => {
        if (this.index === 0) {            
            return null
        };
        
        this.index--;
        return this.queue[this.index];
    };

    public getCurrentIndex = (): number => {
        return this.index;
    };

    public getAllTracks = (): Array<Track> => {
        return this.queue;
    };

    public destroy = () => {
        this.queue = [];
        this.index = -1;
    };
}