import { useQueue } from "discord-player";
import { MessageCommand, MessageCommandBuilder } from "../../../utils/messageCommand";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('leave')
        .setDescription('Leaves channel and purges queue.')
        .setAlias(['l']),

	async execute(interaction: MessageCommand) {
        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);
            if (!queue) return;

            queue.delete();
            await interaction.reply('Left Voice Channel.');
        } catch (e: any) {
            console.error(e, 'RADIO');
        }
	},
};