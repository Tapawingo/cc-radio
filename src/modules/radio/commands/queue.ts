import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Message } from 'discord.js';
import { MessageCommandBuilder, MessageCommand } from '../../../utils/messageCommand';
import { GuildQueue, useQueue } from "discord-player";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('queue')
        .setDescription('Displays the queued tracks.')
        .setAlias(['q']),

	async execute(interaction: MessageCommand) {
        const message = await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);

            if (!queue) {
                await interaction.editReply({ content: '', embeds: [new EmbedBuilder()
                    .setColor(0x2b2d31)
                    .setDescription(`There is nothing queued.`)
                ] });
                return;
            }
            pagedEmbed(interaction, message, queue);
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

const pagedEmbed = async (interaction: MessageCommand, message: Message, queue: GuildQueue) => {
    const backButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Previous Page')
        .setEmoji('◀')
        .setCustomId(`${ message.id }-back`)

    const forwardButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Next Page')
        .setEmoji('▶')
        .setCustomId(`${ message.id }-forward`)

    const generateEmbed = async (start: number) => {
        const tracks = queue.tracks.toArray().slice(start, start + 10);
        const current_track = queue.currentTrack;
        const current_page = Math.floor(start / 10) + 1;
        const pages = Math.floor((queue.tracks.size + 1) / 10) + 1;

        const total_tracks = queue.tracks.size + 1;
        let total_durationMS = queue.tracks.toArray().reduce((a, b) => {
            return a + b.durationMS
        }, 0);

        if (current_track) {
            total_durationMS += current_track.durationMS
        }

        return new EmbedBuilder()
            .setTitle('Queue')
            .setColor(0x2b2d31)
            .setDescription([
                `**Now playing:** [${ current_track?.title }](${ current_track?.url }) \`[${ current_track?.duration }]\` ● ${ current_track?.requestedBy }.`,
                ` `,
                `**Up Next:**`,
                tracks.map((track, index) => {
                    return `**${ start + index + 1 }.** [${ track.title }](${ track.url }) \`[${ track.duration }]\` ● ${ track.requestedBy }`
                }).join('\n')
            ].join('\n'))
            .setFooter({
                text: `Page ${ current_page }/${ pages } | ${ total_tracks } song(s) | ${ msToHMS(total_durationMS) } total duration`
            })
    }

    const components: any[] = [];
    if (queue.tracks.size > 10) {
        components.push(new ActionRowBuilder().addComponents([forwardButton]) as any)
    }

    interaction.editReply({ content: '', embeds: [await generateEmbed(0)], components: components });

    let currentIndex = 0;
    interaction.client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isMessageComponent()) return;

        if (interaction.customId === `${ message.id }-forward`) {
            currentIndex += 10;
        } else if (interaction.customId === `${ message.id }-back`) {
            currentIndex -= 10;
        } else return;

        interaction.deferUpdate();

        const row = new ActionRowBuilder() as any;

        if (currentIndex > 0) {
            row.addComponents([backButton]);
        }

        if (currentIndex + 10 < queue.tracks.size) {
            row.addComponents([forwardButton]);
        }

        interaction.message.edit({
            embeds: [await generateEmbed(currentIndex)],
            components: [row]
        });
    });
}

function msToHMS(ms: number) {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    let formatted = `${ seconds.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    }) }`;
    if (minutes > 0) formatted = `${ minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    }) }:` + formatted
    if (hours > 0) formatted = `${ hours.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    }) }:` + formatted

    return formatted;
}