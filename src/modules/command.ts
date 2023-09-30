import { Client, Message } from "discord.js";

export interface MessageCommandOptions {
    name: string,
    description?: string,
    alias?: string | Array<string>,
    args: Array<MessageCommandArgument>,
    execute: (client: Client, message: Message, args: Array<string>) => Promise<void>,
};

export interface MessageCommandArgument {
    name: string,
    description: string,
    required?: boolean
}

export class MessageCommand implements MessageCommandOptions {
    name: string;
    description: string = '';
    alias: string | Array<string> = [];
    args: Array<MessageCommandArgument> = [];
    execute: (client: Client, message: Message, args: Array<string>) => Promise<void>;

    constructor(options: MessageCommandOptions) {
        this.name = options.name;
        this.execute = options.execute;
        this.args = options.args;
        this.execute = options.execute;
        if (options.description) this.description = options.description;
        if (options.alias) this.alias = options.alias;
    };

    public isCommand = (command: string): boolean => {
        var nameArr = [this.getName()].concat(this.getAlias());
        return nameArr.map(name => name.toLowerCase()).includes(command.toLowerCase());
    };

    public getArgs = (): Array<MessageCommandArgument> => {
        return this.args;
    };

    public getAlias = (): Array<string> => {
        if (typeof this.alias === 'string') return [this.alias];
        return this.alias;
    };

    public getName = (): string => {
        return this.name;
    };

    public getDescription = (): string => {
        return this.description;
    };
}