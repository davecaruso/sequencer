import { app, dialog } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import args from './args';

const missingSoftware: string[] = [];

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

  missingSoftware.push(
    `Could not find ${name} installed on the system. Add ${executable} to %PATH% or install the software in it's default file path`
  );

  return '';
}

export const FFMPEG_PATH = searchForExecutable(
  ['C:\\Program Files\\FFmpeg\\bin', 'C:\\Program Files\\FFmpeg', 'C:\\Program Files\\Shotcut'],
  'ffmpeg.exe',
  'FFmpeg'
);

function searchForFusion() {
  try {
    return searchForExecutable(
      [
        'C:\\Program Files\\Blackmagic Design\\Fusion Render Node 17',
        'C:\\Program Files\\Blackmagic Design\\Fusion Render Node 9',
      ],
      'FusionRenderNode.exe',
      ''
    );
  } catch {
    return searchForExecutable(
      [
        'C:\\Program Files\\Blackmagic Design\\Fusion 17',
        'C:\\Program Files\\Blackmagic Design\\Fusion 9',
      ],
      'Fusion.exe',
      'Blackmagic Fusion or Blackmagic Fusion Render Node'
    );
  }
}

export const FUSION_PATH = searchForFusion();

export const MELT_PATH = searchForExecutable(
  ['C:\\Program Files\\MLT\\bin', 'C:\\Program Files\\MLT', 'C:\\Program Files\\Shotcut'],
  'melt.exe',
  'Melt'
);

export const CACHE_PATH = args.cache
  ? path.resolve(args.cache)
  : process.env.TEMP + '\\CreativeToolkit';

app.on('ready', () => {
  for (const m of missingSoftware) {
    dialog.showMessageBoxSync({
      type: 'error',
      buttons: ['OK'],
      message: m,
      title: 'Missing Software',
    });
  }
});
