import { spawn } from 'child_process';
import { remove, writeFile } from 'fs-extra';
import path from 'path';
import { Sequence, SequenceClip } from '../../shared/types';
import { xml } from '../../shared/xml';
import { CACHE_PATH, MELT_PATH } from './../paths';

function getFileExtension(clip: SequenceClip) {
  if (clip.trackType === 'audio') {
    return 'wav';
  }
  if (clip.trackType === 'video') {
    return 'mp4';
  }
  return '';
}

export function sequenceToXML(sqId: string, sq: Sequence, out: string) {
  const root = xml('mlt');

  root.elem('consumer', {
    f: 'mp4',
    g: '15',
    channels: '2',
    crf: '15',
    progressive: '1',
    target: out,
    threads: '0',
    real_time: '-4',
    mlt_service: 'avformat',
    vcodec: 'libx264',
    ab: '256k',
    bf: '2',
    preset: 'faster',
    acodec: 'aac',
  });

  const tracks: SequenceClip[][] = [];

  for (const clip of Object.values(sq.clips)) {
    const track = tracks[clip.track] || (tracks[clip.track] = []);
    track.push(clip);
  }

  const clips = new Map<string, SequenceClip>();
  const playlists = tracks.map((track, i) => {
    const playlist = xml('playlist');
    const sortedClips = track.sort((a, b) => a.offset - b.offset);
    let x = 0;
    sortedClips.forEach((clip) => {
      clips.set(clip.id, clip);
      if (clip.offset > x) {
        playlist.elem('blank', {
          length: (clip.offset - x).toString(),
        });
      }
      x = clip.offset + (clip.trimEnd - clip.trimStart);
      playlist.elem('entry', {
        producer: clip.id,
        in: clip.trimStart,
        out: clip.trimEnd,
      });
    });
    return playlist;
  });
  clips.forEach((clip, id) => {
    root.elem('producer', {
      id,
      mlt_service: 'avformat',
      resource: clip.isMedia
        ? path.resolve(path.dirname(sq.id), clip.source)
        : path.join(CACHE_PATH, `${id}.${getFileExtension(clip)}`),
    });
  });

  const tractor = root.elem('tractor');
  const multitrack = tractor.elem('multitrack');
  playlists.forEach((playlist) => {
    multitrack.add(playlist);
  });

  return root.stringify();
}

export async function renderSequence(sqId: string, sq: Sequence, out: string) {
  const renderId = `mlt_${Date.now()}`;
  const xml = sequenceToXML(sqId, sq, out);
  const xmlPath = path.join(CACHE_PATH, renderId + '.xml');
  await writeFile(xmlPath, xml);

  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    console.log(`Rendering sequence ${sqId} with ${renderId}`);
    const child = spawn(MELT_PATH, [xmlPath], {
      stdio: 'pipe',
    });
    child.on('error', reject);
    child.on('close', (code) => {
      console.log(`render time: ${Date.now() - start}ms`);
      remove(xmlPath);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('melt failed'));
      }
    });
  });
}
