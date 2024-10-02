import { EmbedBuilder } from 'discord.js';
import { MessageCommandBuilder, MessageCommand } from '../../../utils/messageCommand';
import { useMainPlayer } from "discord-player";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('play')
        .setAlias(['p']),

	async execute(interaction: MessageCommand) {
        const player = useMainPlayer();
        const channel = interaction.member?.voice.channel;
        const args = interaction.arguments;
        await interaction.deferReply();

        try {
            interaction.message.suppressEmbeds(true);

            if (!channel) throw new Error('VoiceChannelMissingError');

            const { track } = await player.play(channel, args.join(' '), {
                nodeOptions: {
                    metadata: interaction
                }
            });

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