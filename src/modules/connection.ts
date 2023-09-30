/*
 * Author: Eric
 * Discord voice connection
 */
import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions, joinVoiceChannel, VoiceConnectionStatus, VoiceConnection } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';

export default class Connection {
    channel: VoiceChannel;
    connectionOptions!: CreateVoiceConnectionOptions & JoinVoiceChannelOptions;
    connection?: VoiceConnection | null;

    constructor(channel: VoiceChannel) {
        this.channel = channel;

        this.connectionOptions = {
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        }

        process.on('exit', this.cleanUp);
    };

    joinChannel = () => {
        this.connection = joinVoiceChannel(this.connectionOptions);

        this.on('stateChange', (oldState: any, newState: any) => {
            const oldNetworking = Reflect.get(oldState, 'networking');
            const newNetworking = Reflect.get(newState, 'networking');

            oldNetworking?.off('stateChange', this.keepAlive);
            newNetworking?.on('stateChange', this.keepAlive);
        });
    };

    public on = (event: VoiceConnectionStatus | string, callback: Function) => {
        this.connection?.on(event as VoiceConnectionStatus, callback as any);
    };

    private keepAlive = (oldNetworkState: any, newNetworkState: any) => {
        const newUdp = Reflect.get(newNetworkState, 'udp');
        clearInterval(newUdp?.keepAliveInterval);
    };

    private cleanUp = () => {
        try { this.connection?.destroy() } catch(err){};
    }
};