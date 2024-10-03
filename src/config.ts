import dotenv from 'dotenv'
import conf from '../config.bot.json';

dotenv.config();

if (!conf.bot?.token || !conf.bot?.client_id || !conf.extractors) {
  throw new Error("Missing config values");
}

export const config = conf;
export const env = process.env;