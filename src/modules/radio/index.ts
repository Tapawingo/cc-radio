import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { Client, TextChannel } from 'discord.js';
import { MessageCommand } from '../../utils/messageCommand';
import { config } from "../../config";

/* https://discord-player.js.org/guide */

module.exports = async (client: Client) => {
    const player = new Player(client);
    client.player = player;

    /* Register youtube extractor */
    player.extractors.register(YoutubeiExtractor, {
        authentication: config.extractors.youtube.token
    })

    await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

    player.on('debug', d => {
        console.debug(d, 'PLAYER');
    })

    player.on('error', e => {
        console.error(e, 'PLAYER')
    });

    player.events.on('playerError', (queue, error) => {
        console.error(error, 'PLAYER');

        const channel = (queue.metadata as MessageCommand).channel;
        if (!channel) return;

        (channel as TextChannel).send(`Something went wrong while streaming.`);
    });

    player.events.on('playerStart', (queue, track) => {
        const channel = (queue.metadata as MessageCommand).channel;
        if (!channel) return;

        (channel as TextChannel).send(`Now playing **${ track.title }**`);
    });

    player.events.on('emptyQueue', (queue) => {
        const channel = (queue.metadata as MessageCommand).channel;
        if (!channel) return;

        (channel as TextChannel).send('**Reached end of queue**');
    });
}