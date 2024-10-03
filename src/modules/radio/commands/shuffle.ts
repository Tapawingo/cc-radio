import { useQueue } from "discord-player";
import { MessageCommand, MessageCommandBuilder } from "../../../utils/messageCommand";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffles all the tracks in the queue.')
        .setAlias(['sh']),

	async execute(interaction: MessageCommand) {
        await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);
            if (!queue) return;

            queue.tracks.shuffle();
            await interaction.reply(`Shuffled queue.`);
        } catch (e: any) {
            console.error(e, 'RADIO');
            switch (e.message) {
                case 'UnknownLoopMode':
                    await interaction.editReply(`Unknown Loop mode ${ interaction.arguments![0] }.`);
                    break;
                
                case 'MissingLoopArgs':
                    await interaction.editReply(`Missing loop mode argument.`);
                    break;

                default:
                    await interaction.editReply(`Something went wrong.`);
                    break;
            }
        }
	},
};