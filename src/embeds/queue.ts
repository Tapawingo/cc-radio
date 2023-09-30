/*
 * Author: Eric
 * Constructs "queue" embed
 */

import { EmbedBuilder } from "discord.js";
import Queue, { TrackMeta } from "../modules/queue";
import { timeFormat } from '../modules/player'
import config from '../bot.config.json'

const formatQueue = (queue: Queue, page: number): string => {
    const queuedTracks = queue.getAllTracks();
    if (!queuedTracks) return `*Queue is empty* \nPage 1/1`;

    const pages = Math.ceil(queuedTracks.length / config.commandSettings.queue.pageSize);
    const queueIndex = queue.getCurrentIndex();
    var out = [];

    const pageIndex = ((page - 1) * config.commandSettings.queue.pageSize);
    for (let i = pageIndex; i < (queuedTracks.length); i++) {
        if (queuedTracks[i]) {
            out.push(` ${ i === queueIndex ? '> ' : '' } \`${ i }:\` [${ queuedTracks[i].meta.title }](${ queuedTracks[i].meta.source }) | \`${ timeFormat(queuedTracks[i].meta.duration) }\` ${ queuedTracks[i].author }`);
        };
    };

    out.push(`\nPage ${ page }/${ pages }`);
    return out.join('\n');
};

export const queueEmbed = (queue: Queue, page: number = 1) => {
    return new EmbedBuilder()
    .setColor(13632027)
    .setTitle('Queue')
    .setDescription(formatQueue(queue, page))
    .setThumbnail('https://cdn.discordapp.com/attachments/325719272745861126/1085462710847819816/cc_radio.jpg')
    .setAuthor({ name: `.queue (.q)` })
}