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
                await interaction.editReply('**Queue is empty**');
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
        .setLabel('Back')
        .setEmoji('⬅️')
        .setCustomId(`${ message.id }-back`)

    const forwardButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Forward')
        .setEmoji('➡️')
        .setCustomId(`${ message.id }-forward`)

    const generateEmbed = async (start: number) => {
        const tracks = queue.tracks.toArray().slice(start, start + 10);
        
        const current_track = queue.currentTrack;
        if (current_track) {
            tracks.unshift(current_track);
        }

        return new EmbedBuilder()
            .setTitle('Queue')
            .setColor(13632027)
            .setThumbnail('https://cdn.discordapp.com/attachments/325719272745861126/1085462710847819816/cc_radio.jpg')
            .setDescription(tracks.map((track, index) => {
                return `**${ start + index === 0 ? '> ' : `${ start + index })` }** **[${ track.title }](${ track.url }) (${ track.duration })**`
            }).join('\n'))
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