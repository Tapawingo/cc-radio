
import { Message } from "discord.js";
import { MessageCommand } from "./messageCommand";
import { config } from "../config";

export default (message: Message): MessageCommand => {
    const args: string[] = message.content.slice(config.bot.command_prefix.length).trim().split(/ +/g);
    const attachments = message.attachments.size > 0 ? message.attachments : undefined;
    const command: string = args.shift()!.toLowerCase();

    return new MessageCommand(message, command, args, attachments);
}