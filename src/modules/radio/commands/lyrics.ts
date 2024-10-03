import { useMainPlayer, useQueue } from "discord-player";
import { MessageCommand, MessageCommandBuilder } from "../../../utils/messageCommand";
import { EmbedBuilder } from "discord.js";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('lyric')
        .setDescription('Shows lyrics for current song.')
        .setAlias(['ly']),

	async execute(interaction: MessageCommand) {
        const player = useMainPlayer();
        await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);

            if (!queue?.currentTrack) {
                await interaction.editReply('Nothing currently playing.');
                return;
            }

            const current_track = queue.currentTrack;

            const lyrics = await player.lyrics.search({
                q: current_track.cleanTitle ?? current_track.title
            });

            if (!lyrics.length) return interaction.editReply({ content: 'No lyrics found.' });

            const trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
            await interaction.editReply({ content: '', embeds: [
                new EmbedBuilder()
                    .setTitle(lyrics[0].name)
                    .setAuthor({
                        name: lyrics[0].artistName
                    })
                    .setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics)
                    .setColor(13632027)
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