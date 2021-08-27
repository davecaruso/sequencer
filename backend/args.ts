import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const args = yargs(hideBin(process.argv))
  .option('cache', { type: 'string', description: 'Cache directory' })
  .option('ffmpeg-path', { type: 'string', description: 'Override path to ffmpeg' })
  .option('melt-path', { type: 'string', description: 'Override path to melt' })
  .option('fusion-path', { type: 'string', description: 'Override path to fusion' })
  .positional('file', { description: 'File to open.' })
  .parseSync();
