import { useQueue } from "discord-player";
import { MessageCommand, MessageCommandBuilder } from "../../../utils/messageCommand";
import { EmbedBuilder } from "discord.js";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('skip')
        .setDescription('Skips current track.')
        .setAlias(['s']),

	async execute(interaction: MessageCommand) {
        await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);

            if (!queue?.currentTrack) {
                await interaction.editReply({ content: '', embeds: [new EmbedBuilder()
                    .setColor(0x2b2d31)
                    .setDescription(`There is nothing to skip.`)
                ] });
                return;
            }
            
            const skipped_track = queue.currentTrack;
            queue.node.skip();
            await interaction.editReply({ content: '', embeds: [new EmbedBuilder()
                .setColor(0x2b2d31)
                .setDescription(`**Skipped ${ skipped_track?.title }**`)
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