import fs from 'fs-extra';
import path from 'path';
import args from './args';

if (process.platform !== 'win32') {
  throw new Error('This script is only for windows');
}

const binPath = process.env.PATH?.split(';') || [];

function searchForExecutable(paths: string[], executable: string, name: string): string {
  for (const path of [...binPath, ...paths]) {
    const fullPath = path + '\\' + executable;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  throw new Error(`Could not find ${name} installed on the system. Add ${executable} to %PATH% or install the software in it's default file path`); 
}

export const FFMPEG_PATH = searchForExecutable([
    'C:\\Program Files\\FFmpeg\\bin',
    'C:\\Program Files\\FFmpeg',
    'C:\\Program Files\\Shotcut',   
], 'ffmpeg.exe', 'FFmpeg');

export const FUSION_PATH = searchForExecutable([
  'C:\\Program Files\\Blackmagic Design\\Fusion 17',
  'C:\\Program Files\\Blackmagic Design\\Fusion 9'
], 'Fusion.exe', 'Blackmagic Fusion');

export const CACHE_PATH = args.cache ? path.resolve(args.cache) : (process.env.TEMP + '\\CreativeToolkit');

console.log({
  FFMPEG_PATH,
  FUSION_PATH,
  CACHE_PATH,
});
