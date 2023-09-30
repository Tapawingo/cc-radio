/*
 * Author: Eric
 * Stores temporary data
 */

import { AudioPlayerStatus } from "@discordjs/voice";
import { Channel, Guild, TextChannel, VoiceChannel } from "discord.js";
import Connection from "./modules/connection";
import Player from "./modules/player";
import NodeCache from 'node-cache'

export interface StoredGuild {
    player: Player,
    replyChannel: TextChannel
};

class guildStore {
    guilds: NodeCache = new NodeCache( { checkperiod: 0 } );

    constructor() {}

    public getPlayer = (searchGuild: Guild | string): StoredGuild | undefined => {
        if (typeof searchGuild === 'string') return this.guilds.get(searchGuild);
        return this.guilds.get(searchGuild.id);
    };

    public newPlayer = (channel: VoiceChannel, replyChannel: TextChannel): StoredGuild => {
        const oldPlayer = this.getPlayer(channel.guild);
        if (oldPlayer) return oldPlayer

        const connection = new Connection(channel);
        const player = new Player(channel.guild, connection);
        const sg = {
            player: player,
            replyChannel: replyChannel
        };
        this.guilds.set(channel.guild.id, sg);
        console.info(`Created new session: ${ channel.guild.id }`);

        return sg;
    };

    public deletePlayer = (guild: Guild) => {
        this.guilds.del(guild.id);
        console.info(`Deleted session: ${ guild.id }`);
    };

    public on = (event: string, callback: any) => {
        this.guilds.on(event, callback);
    };
}

export const useGuildStore = new guildStore();