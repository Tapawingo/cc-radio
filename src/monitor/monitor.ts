/*
 * Author: Eric
 * Displays statistics in the terminal
 */
import { ConsoleManager, PageBuilder, ConfirmPopup, OptionPopup, CustomPopup, ButtonPopup } from 'console-gui-tools'
import path from 'node:path'
import fs from 'node:fs'
import config from '../bot.config.json'
import { useGuildStore } from '../store';
import { Track } from '../modules/queue';
import { timeFormat } from '../modules/player'
import { AudioPlayerStatus } from '@discordjs/voice';
import { Client, Status } from 'discord.js';

const handlersPath = path.join(__dirname, '../handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.ts'));

class Monitor {
    private GUI: ConsoleManager;
    private store: any = {};
    private client!: Client;
    public startTime: Date = new Date();
    public warnings: number = 0;
    public errors: number = 0;

    constructor(options?: any) {
        this.GUI = new ConsoleManager(options || {
            title: config.name,
            logPageSize: 8,
            overrideConsole: true,
            layoutOptions: {
                boxed: true,
                boxColor: 'cyan',
                type: 'double',
                changeFocusKey: 'ctrl+l',
                direction: 'vertical',
                showTitle: true
            }
        });

        useGuildStore.on('set', this.render);
        useGuildStore.on('del', this.render);

        this.keybinds();
    };

    public setClient = (client: Client) => {
        this.client = client;
    };

    public render = () => {
        const page = new PageBuilder();

        if (this.client) {
            page.addRow({ text: `Gateway:`, color: 'cyan' }, { text: ` ${ this.client.ws.gateway }`, color: 'white' });
            page.addRow({ text: `Ping (avg):`, color: 'cyan' }, { text: ` ${ this.client.ws.ping }ms`, color: 'white' });
            page.addRow({ text: `Status:`, color: 'cyan' }, { text: ` ${ Status[this.client.ws.status] }`, color: 'white' });

            page.addSpacer();

            page.addRow({ text: `Warnings:`, color: 'yellow' }, { text: this.warnings.toString(), color: 'white' });
            page.addRow({ text: `Errors:`, color: 'yellow' }, { text: this.errors.toString(), color: 'white' });
        }

        page.addSpacer();
    
        page.addRow({ text: `Source Handlers:`, color: 'cyan' });
        for (const file of handlerFiles) {
            page.addRow({ text: `   ${ file }`, color: 'gray' });
        };

        page.addSpacer();
    
        if (this.store.guild) {
            const storedGuild = useGuildStore.getPlayer(this.store.guild)!;

            if (storedGuild.player) {                
            const status = storedGuild.player.getStatus();
                page.addRow({ text: `Status:`, color: 'green' }, { text: ` ${ storedGuild.player.getStatus() }`, color: 'white' });
                if (status === AudioPlayerStatus.Playing) {
                    const currentTrack = storedGuild.player.getQueue().getCurrentTrack();
                    const duration = timeFormat(currentTrack.meta.duration, { minutes: true });
                    const current = timeFormat((Date.now() - storedGuild.player.getStartedPlaying()) / 1000, { minutes: true, hours: duration.length > 5 });
                    page.addRow({ text: `Current Track:`, color: 'green' }, { text: ` ${ currentTrack.meta.title } ${ current } / ${ duration }`, color: 'white' });
                };

                const tracks = storedGuild.player.getQueue().getAllTracks();
                const curIndex = storedGuild.player.getQueue().getCurrentIndex();
                page.addRow({ text: `Queue (${ tracks.length }):`, color: 'green' });
                tracks.forEach((track: Track, index: number) => {
                    const color = curIndex === index ? 'white' : 'gray';
                    const handler = track.handler.meta;
                    page.addRow({ text: `   ${ index }: [${ handler }] ${ track.meta.title } (${ track.meta.source })`, color: color });
                })
            };
        } else {
            page.addRow({ text: `Guild Sessions:`, color: 'green' }, { text: ` ${ useGuildStore.guilds.keys().length }`, color: 'white' });
        };
    
        page.addSpacer(2);
    
        page.addRow({ text: `Commands:`, color: 'white' });
        page.addRow({ text: `   'q'`, color: 'gray' }, { text: `   - Exit App`, color: 'white' });
        page.addRow({ text: `   'g'`, color: 'gray' }, { text: `   - Guild Statistics`, color: 'white' });
        // @TODO Add guild only commands to emulate in-guild commands (./commands)
    
        page.addSpacer();
    
        this.GUI.setPage(page, 0);
    };

    // Create a loop to endlessly render monitor
    public start = async () => {
        this.render()
        setTimeout(this.start, 1000);
    }

    public errorPopup = (stack: string) => {
        const page = new PageBuilder(this.GUI.Screen.height - 4);
        for (const line of stack.split(/\r?\n/)) {
            page.addRow({ text: line, color: 'red' });
        };
        new CustomPopup({ id: `errorStack`, title: 'Error Stack', content: page, width: this.GUI.Screen.width - 4 }).show();
    };

    private keybinds = () => {
        var func = this;
        process.stdin.setRawMode( true );
        process.stdin.resume();
        process.stdin.setEncoding( 'utf8' );
        process.stdin.on( 'data', function( key ){
            switch (key.toString()) {
                case 'q': func.exit(); break;
                case 'g': func.selectGuild(); break;
                case '\u0003': func.exit(); break;
            };
        });
    };

    private exit = () => {
        try {
            new ConfirmPopup({
                id: "popupQuit", 
                title: "Are you sure you want to quit?"
            }).show().on("confirm", () => {
                process.exit()
            });
        } catch (err) {};
    };

    private selectGuild = () => {
        var guilds = useGuildStore.guilds.keys();
        guilds.unshift('none');

        try {
            new OptionPopup({ 
                id: "popupSelectGuild",
                title: "Select guild",
                options: guilds, 
                selected: this.store.guild ? this.store.guild : 'none'
            }).show().on("confirm", (guild: string) => {
                this.store.guild = guild === 'none' ? '' : guild;
                this.render();
            })
        } catch (err) {};
    };
};

export const useMonitor = new Monitor();

// Log to file
const logFile = async (logString: string, filename: string = 'output') => {
    const directory = path.join(__dirname, '../logs/');

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    };

    const file = path.join(directory, `${ filename } ${ useMonitor.startTime.toISOString().split('T')[0] }.log`);

    if (!fs.existsSync(file)) {
        await fs.writeFile(file, `LogFile ${ file }, started ${ useMonitor.startTime.toLocaleDateString() }\n\n`, { flag: 'a+' }, err => {}); // Create logfile header
    };

    let buffer = Buffer.from(logString + '\n');

    await fs.writeFile(file, buffer, { flag: 'a+' }, err => {});
};

// Customize logging functions
const log = console.log.bind(console);
const debug = console.debug.bind(console);
const info = console.info.bind(console);
const error = console.error.bind(console);
const warn = console.warn.bind(console);

console.log = function(data) {
    var timestamp = new Date().toLocaleString('en-GB');
    if (config.env !== 'dev') return;
    log(`${ timestamp } ${ data }`);
    logFile(`${ timestamp } ${ data }`);
};

console.debug = function(data) {
    var timestamp = new Date().toLocaleString('en-GB');
    if (config.env !== 'dev') return;
    debug(`${ timestamp } [DEBUG] ${ data }`);
    logFile(`${ timestamp } [DEBUG] ${ data }`);
};

console.info = function(data) {
    var timestamp = new Date().toLocaleString('en-GB');
    info(`${ timestamp } [INFO] ${ data }`);
    logFile(`${ timestamp } [INFO] ${ data }`);
};

console.error = function(data: string, stack?: string) {
    var timestamp = new Date().toLocaleString('en-GB');
    error(`${ timestamp } [ERROR] ${ data }`);
    useMonitor.errors += 1;
    logFile(`${ timestamp } [ERROR] ${ data }`);
    logFile(`${ timestamp } [ERROR] ${ data }`, 'error');

    if (stack) {
        useMonitor.errorPopup(stack);
    };
};

console.warn = function(data) {
    var timestamp = new Date().toLocaleString('en-GB');
    warn(`${ timestamp } [WARN] ${ data }`);
    useMonitor.warnings += 1;
    logFile(`${ timestamp } [WARN] ${ data }`);
    logFile(`${ timestamp } [ERROR] ${ data }`, 'warning');
};

// handle uncaught rejections
process.on('uncaughtException', (err: Error, origin) => {
    console.error(`Uncaught Exception: ${err.message}`, err.stack);
});

// Handle uncaught exceptions
process.on('unhandledRejection', (err: Error, promise) => {
    console.error(`Unhandled rejection ${ err.message }`, err.stack);
});