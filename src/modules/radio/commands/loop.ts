import { QueueRepeatMode, useQueue } from "discord-player";
import { MessageCommand, MessageCommandBuilder } from "../../../utils/messageCommand";
import { EmbedBuilder } from "discord.js";

module.exports = {
	data: new MessageCommandBuilder()
        .setName('loop')
        .setDescription('Loops track, queue or autoplays tracks.')
        .addArgument(option => option
            .setName('mode')
            .setDescription('How the player should loop.')
            .setChoices([
                '0 | off (no repeat)',
                '1 | track (track repeat)',
                '2 | queue (queue repeat)',
                '3 | autoplay (autoplay)'
            ])
            .setRequired(true)
        )
        .setAlias(['lo']),

	async execute(interaction: MessageCommand) {
        const args = interaction.arguments;
        await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            const queue = useQueue(interaction.guild.id);
            if (!queue) return;

            if (!args) throw new Error('MissingLoopArgs');

            const loopMode = getLoopMode(args[0]);
            if (!loopMode) throw new Error('UnknownLoopMode')

            queue.setRepeatMode(loopMode);
            await interaction.editReply({ content: '', embeds: [new EmbedBuilder()
                .setColor(0x2b2d31)
                .setDescription(`Set loop mode to ${ loopModeName(QueueRepeatMode, loopMode) }`)
            ] });
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

function getLoopMode(arg: string): number | null {
    const parsedNumber = parseInt(arg, 10);
    if (!isNaN(parsedNumber)) {
        if (Object.values(QueueRepeatMode).includes(parsedNumber)) {
            return parsedNumber;
        } else {
            return null;
        }
    }

    if (arg.toUpperCase() in QueueRepeatMode) {
        return QueueRepeatMode[arg.toUpperCase() as keyof typeof QueueRepeatMode];
    }

    return null;
}

const loopModeName = (enumObj: any, key: number | string): string | undefined => {
    return Object.values(enumObj).find((value: any) => enumObj[value] === key) as string;
}