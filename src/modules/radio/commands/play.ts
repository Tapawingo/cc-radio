import { EmbedBuilder } from 'discord.js';
import { MessageCommandBuilder, MessageCommand } from '../../../utils/messageCommand';
import { Track, useMainPlayer } from "discord-player";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('play')
        .setAlias(['p']),

	async execute(interaction: MessageCommand) {
        const player = useMainPlayer();
        const channel = interaction.member?.voice.channel;
        const args = interaction.arguments;
        const attachments = interaction.attachments;
        await interaction.deferReply();

        try {
            interaction.message.suppressEmbeds(true);

            if (!channel) throw new Error('VoiceChannelMissingError');
            
            if (attachments) {
                const attachment = attachments.first();
                if (!attachment?.url) return;

                let { track } = await player.play(channel, attachment.url, {
                    nodeOptions: {
                        metadata: interaction
                    },
                    requestedBy: interaction.member.user
                });

                reply(interaction, track);
                return;
            }

            if (!args) throw new Error('MissingQueryArgs');
            let { track, searchResult } = await player.play(channel, args.join(' '), {
                nodeOptions: {
                    metadata: interaction
                },
                requestedBy: interaction.member.user
            });

            if (searchResult.hasPlaylist()) {
                await interaction.editReply(`Queued **${ searchResult.tracks.length }** tracks.`);
                return;
            }

            reply(interaction, track);
        } catch (e: any) {
            console.error(e, 'RADIO');
            if (e.message === 'VoiceChannelMissingError') {
                await interaction.editReply('You are not connected to a voice channel!');
            } else if (e.message === 'MissingQueryArgs') {
                await interaction.editReply(`Missing query argument.`);
            };
        }
	},
};

const reply = async (interaction: MessageCommand, track: Track) => {
    await interaction.editReply({ embeds: [
        new EmbedBuilder()
            .setColor(13632027)
            .setTitle('Queued:')
            .setDescription(`[${ track.title }](${ track.url })`)
            .setThumbnail(track.thumbnail ?? 'https://cdn.discordapp.com/attachments/325719272745861126/1085462710847819816/cc_radio.jpg')
            .setFields([
                { name: 'Duration', value: `\`${ track.duration }\``, inline: true }
            ])
    ] });
}