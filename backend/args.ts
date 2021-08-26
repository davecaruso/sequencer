import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv)).option('cache', { type: 'string' }).parseSync();

export default args;
