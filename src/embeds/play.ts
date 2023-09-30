/*
 * Author: Eric
 * Constructs "play" embed
 */

import { EmbedBuilder } from "discord.js";
import { TrackMeta } from "../modules/queue";
import { timeFormat } from '../modules/player'

export const playEmbed = (track: TrackMeta, queuePos?: number) => {
    return new EmbedBuilder()
        .setColor(13632027)
        .setTitle('Queued:')
        .setDescription(`[${track.title}](${track.source})`)
        .setThumbnail(track.thumbnails ? track.thumbnails[0].url : 'https://cdn.discordapp.com/attachments/325719272745861126/1085462710847819816/cc_radio.jpg')
        .setFields([
            //{ name: 'Position in queue', value: `\`${ queuePos }\``, inline: true },
            { name: 'Duration', value: `\`${ timeFormat(track.duration, { minutes: true }) }\``, inline: true }
        ])
        .setAuthor({ name: `.play (.p)` })
}