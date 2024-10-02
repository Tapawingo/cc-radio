import conf from '../config.bot.json';

if (!conf.bot?.token || !conf.bot?.client_id || !conf.extractors) {
  throw new Error("Missing config values");
}

export const config = conf;