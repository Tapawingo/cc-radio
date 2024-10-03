import { useQueue } from "discord-player";
import { MessageCommand, MessageCommandBuilder } from "../../../utils/messageCommand";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('purge')
        .setDescription('Empties the queue.')
        .setAlias(['pu']),

	async execute(interaction: MessageCommand) {
        await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);

            if (!queue) {
                await interaction.editReply('**Nothing to purge**');
                return;
            }
            
            const amount = queue.tracks.size;
            queue.clear();
            await interaction.editReply(`**Purged ${ amount } tracks from queue.**`);
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