enum cli_fg {
    black = '\x1b[30m',
    red = '\x1b[31m',
    green = '\x1b[32m',
    yellow = '\x1b[33m',
    blue = '\x1b[34m',
    magenta = '\x1b[35m',
    cyan = '\x1b[36m',
    white = '\x1b[37m',
    reset = '\x1b[0m'
}

enum cli_bg {
    black = '\x1b[40m',
    red = '\x1b[41m',
    green = '\x1b[42m',
    yellow = '\x1b[43m',
    blue = '\x1b[44m',
    magenta = '\x1b[45m',
    cyan = '\x1b[46m',
    white = '\x1b[47m',
    reset = '\x1b[0m'
}

const timestamp = () => {
    return `${ cli_bg.cyan }  ${ new Date().toLocaleString('en-GB') }  ${ cli_bg.reset }`;
}

const prettyScope = (scope: string = 'BOT') => {
    if (scope) {
        return `${ cli_bg.blue }  ${ scope }  ${ cli_bg.reset }`;
    } else {
        return '';
    }
}

const log = console.log.bind(console);
const debug = console.debug.bind(console);
const info = console.info.bind(console);
const error = console.error.bind(console);
const warn = console.warn.bind(console);

console.log = function(data) {
    log(`${ timestamp() } ${ data }`);
};

console.debug = function(data, scope?: 'BOT' | 'WEB') {
    debug(`${ timestamp() }${ prettyScope(scope) }${ cli_bg.magenta }  DEBUG  ${ cli_bg.reset } ${ data }`);
};

console.info = function(data, scope?: 'BOT' | 'WEB') {
    info(`${ timestamp() }${ prettyScope(scope) }${ cli_bg.white }  INFO   ${ cli_bg.reset } ${ data }`);
};

console.error = function(data: string, scope?: 'BOT' | 'WEB') {
    error(`${ timestamp() }${ prettyScope(scope) }${ cli_bg.red }  ERROR  ${ cli_bg.reset } ${ data }`);
};

console.warn = function(data, scope?: 'BOT' | 'WEB') {
    warn(`${ timestamp() }${ prettyScope(scope) }${ cli_bg.yellow }  WARN  ${ cli_bg.reset } ${ data }`);
};