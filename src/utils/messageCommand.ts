import { Message, MessageEditOptions, MessageReplyOptions } from "discord.js";

export class MessageCommand {
  public declare readonly message: Message;
  public declare readonly command: string;
  public declare readonly arguments: string[];
  private interactionReply?: Message;

  constructor (message: Message, command: string, args?: string[]) {
    this.message = message;
    this.command = command;
    this.arguments = args ?? [];
  }

  get client() {
    return this.message.client;
  }

  get guild() {
    return this.message.guild;
  }

  get channel() {
    return this.message.channel;
  }

  get member() {
    return this.message.member;
  }

  public async deferReply(message?: string) {
    const options: MessageReplyOptions = {
      content: message ?? `${ this.client.user.username } is thinking...`,
      allowedMentions: { users: [], repliedUser: false }
    }

    this.interactionReply = await this.message.reply(options);
    return this.interactionReply;
  }

  public async reply(options: string | MessageReplyOptions) {
    if (typeof options === 'object' && !options.allowedMentions) {
      options.allowedMentions = { users: [], repliedUser: false }
    }

    if (typeof options === 'string') {
      options = { content: options, allowedMentions: { users: [], repliedUser: false } }
    }

    this.interactionReply = await this.message.reply(options);
    return this.interactionReply;
  }

  public async editReply(options: string | MessageEditOptions) {
    if (typeof options === 'object' && !options.allowedMentions) {
      options.allowedMentions = { users: [], repliedUser: false }
    }

    if (typeof options === 'string') {
      options = { content: options, allowedMentions: { users: [], repliedUser: false } }
    }

    if (!this.interactionReply) throw new Error(`Attempted to edit a non-existant reply`);

    this.interactionReply = await this.interactionReply.edit(options);
    return this.interactionReply;
  }
}

export class MessageCommandBuilder {
  public name!: string;
  public description: string = '';
  public alias?: string[];
  public args: MessageCommandArgumentBuilder[] = [];

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setAlias(alias: string[]): this {
    this.alias = alias;
    return this;
  }

  public setDescription(description: string): this {
    this.description = description;
    return this;
  }

  public addArg(option: Function): this {
    this.args.push(option(new MessageCommandArgumentBuilder()));
    return this;
  }
}

export class MessageCommandArgumentBuilder {
  public name!: string;
  public description: string = '';
}