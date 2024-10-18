import { EmbedBuilder } from 'discord.js';
import { MessageCommandBuilder, MessageCommand } from '../../../utils/messageCommand';
import { SearchResult, Track, useMainPlayer } from "discord-player";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('play')
        .setDescription('Play a track from either a URL or an attached file.')
        .addArgument(option => option
            .setName('query or file Attachment')
            .setDescription('Can be a attached file, search text or a url.')
            .setRequired(true)
        )
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

                try {
                    let { track } = await player.play(channel, attachment.url, {
                        nodeOptions: {
                            metadata: interaction
                        },
                        requestedBy: interaction.member.user
                    });

                    await trackReply(interaction, track);
                    return;
                } catch (e: any) {
                    console.error(e);
                }
            }

            if (!args) throw new Error('MissingQueryArgs');
            let { track, searchResult } = await player.play(channel, args.join(' '), {
                nodeOptions: {
                    metadata: interaction
                },
                requestedBy: interaction.member.user
            });

            if (searchResult.hasPlaylist()) {
                await queueReply(interaction, searchResult);
                return;
            }

            await trackReply(interaction, track);
        } catch (e: any) {
            console.error(e, 'RADIO');
            switch (e.message) {
                case 'VoiceChannelMissingError':
                    await interaction.editReply('You are not connected to a voice channel!');
                    break;
                
                case 'MissingQueryArgs':
                    await interaction.editReply(`Missing query argument.`);
                    break;

                default:
                    if (e.name.includes('ERR_NO_RESULT')) {
                        await interaction.editReply({ content: '', embeds: [new EmbedBuilder()
                            .setColor(0x2b2d31)
                            .setDescription(`**0** results for query.`)
                        ] });
                        break;
                    }

                    await interaction.editReply(`Something went wrong.`);
                    break;
            }
        }
	},
};

const trackReply = async (interaction: MessageCommand, track: Track) => {
    await interaction.editReply({ content: '', embeds: [
        new EmbedBuilder()
            .setColor(0x2b2d31)
            .setDescription(`Queued **${ track.title }** [${ track.duration }] ● <@${ interaction.member?.id }>`)
    ] });
}

const queueReply = async (interaction: MessageCommand, searchResult: SearchResult) => {
    await interaction.editReply({ content: '', embeds: [
        new EmbedBuilder()
            .setColor(0x2b2d31)
            .setDescription(`Queued **${ searchResult.tracks.length } tracks** [${ searchResult.playlist?.durationFormatted }] ● <@${ interaction.member?.id }>`)
    ] });
}