import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Message } from 'discord.js';
import { MessageCommandBuilder, MessageCommand } from '../../../utils/messageCommand';
import { GuildQueue, Track, useQueue } from "discord-player";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays the song currently playing.')
        .setAlias(['np']),

	async execute(interaction: MessageCommand) {
        await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);

            if (!queue?.currentTrack) {
                await interaction.editReply({ content: '', embeds: [new EmbedBuilder()
                    .setColor(0x2b2d31)
                    .setDescription(`There is nothing playing.`)
                ] });
                return;
            }

            reply(interaction, queue, queue.currentTrack);
        } catch (e: any) {
            console.error(e, 'RADIO');
            if (e.name === 'VoiceChannelMissingError') {
                await interaction.editReply('You are not connected to a voice channel!');
            } else {
                await interaction.editReply(`Something went wrong.`);
            };
        }
	},
};

const reply = async (interaction: MessageCommand, queue: GuildQueue, track: Track) => {
    await interaction.editReply({ content: '', embeds: [
        new EmbedBuilder()
            .setColor(0x2b2d31)
            .setThumbnail(track.thumbnail)
            .setTitle(`**${ track.title }**`)
            .setDescription([
                `${ sToHMS(queue.node.getTimestamp()?.progress) } `,
                `<:bar_start:1296631298198081607>`,
                `<:bar_middle:1296631315860426792>`.repeat(13),
                `<:bar_end:1296631332612476988>`,
                `${ track.duration }`
            ].join(''))
            .setFooter({
                text: `${ track.requestedBy?.username }`
            })
            .setAuthor({
                name: `${ track.author }`,
                url: `${ track.url }`
            })
    ] });
}

function sToHMS(s?: number) {
    if (!s) return "";

    let seconds = s;
    const hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    let formatted = `${ seconds.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    }) }`;
    formatted = `${ minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    }) }:` + formatted
    if (hours > 0) formatted = `${ hours.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    }) }:` + formatted

    return formatted;
}