import path from 'path';
import fs from 'fs';
import { MessageCommand, MessageCommandArgumentBuilder, MessageCommandBuilder } from "../../../utils/messageCommand";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Message } from 'discord.js';
import { config } from '../../../config';

module.exports = {
	data: new MessageCommandBuilder()
        .setName('help')
        .setDescription('Displays a help message.')
        .setAlias(['h']),

	async execute(interaction: MessageCommand) {
        const message = await interaction.deferReply();

        try {
            if (!interaction.guild) throw new Error('No guild');
            
            const commands = fs.readdirSync(__dirname).filter(file => file.endsWith('.ts'));

            const commandsData = [];
            for (const file of commands) {
                console.debug(`Registering command "${ file.replace('.ts', '') }"`, 'BOT');
                const commandPath = path.join(__dirname, file);
                const command = require(commandPath);

                if ('data' in command && 'execute' in command) {
                    commandsData.push(command.data);
                }
            }

            console.log(commandsData);

            pagedEmbed(interaction, message, commandsData);
        } catch (e: any) {
            console.error(e, 'RADIO');
        }
	},
};

const pagedEmbed = async (interaction: MessageCommand, message: Message, commands: MessageCommandBuilder[]) => {
    const pageEntries = 3;
    const backButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Previous Page')
        .setEmoji('◀')
        .setCustomId(`${ message.id }-back`)

    const forwardButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Next Page')
        .setEmoji('▶')
        .setCustomId(`${ message.id }-forward`)

    const generateEmbed = async (start: number) => {
        const page_commands = commands.slice(start, start + pageEntries);
        const current_page = Math.floor(start / pageEntries) + 1;
        const pages = Math.floor((commands.length) / pageEntries);

        return new EmbedBuilder()
            .setTitle('Help')
            .setColor(13632027)
            .setDescription(
                page_commands.map(command => {
                    return [
                        `**__${ command.name } (${ command.alias?.join(', ') })__**`,
                        `${ command.description }`,
                        `**Usage**`,
                        `\`\`\`properties\n${ config.bot.command_prefix }${ command.name } ${ commandArgs(command.args) }\n\`\`\``
                    ].join('\n')
                }).join('\n')
            )
            .setFooter({
                text: `Page ${ current_page }/${ pages } | Arguments with"<>" are required; "()" are optional`
            })
    }

    const components: any[] = [];
    if ((commands.length + 1) > pageEntries) {
        components.push(new ActionRowBuilder().addComponents([forwardButton]) as any)
    }

    interaction.editReply({ content: '', embeds: [await generateEmbed(0)], components: components });

    let currentIndex = 0;
    interaction.client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isMessageComponent()) return;

        if (interaction.customId === `${ message.id }-forward`) {
            currentIndex += pageEntries;
        } else if (interaction.customId === `${ message.id }-back`) {
            currentIndex -= pageEntries;
        } else return;

        interaction.deferUpdate();

        const row = new ActionRowBuilder() as any;

        if (currentIndex > 0) {
            row.addComponents([backButton]);
        }

        if (currentIndex + pageEntries < (commands.length)) {
            row.addComponents([forwardButton]);
        }

        interaction.message.edit({
            embeds: [await generateEmbed(currentIndex)],
            components: [row]
        });
    });
}

const commandArgs = (args: MessageCommandArgumentBuilder[]) => {
    let formatted = '';
    args.forEach(arg => {
        if (arg.required) {
            formatted += `<${ arg.name }>`
        } else {
            formatted += `(${ arg.name })`
        }
    });

    return formatted;
}