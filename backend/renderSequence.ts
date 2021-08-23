import { spawn } from "child_process";
import { writeFile } from "fs-extra";
import path from "path";
import { Sequence } from "../shared/types";
import { xml } from "../shared/xml";
import { CACHE_PATH, MELT_PATH } from "./paths";

export function sequenceToXML(sqId: string, sq: Sequence, out: string) {
  const root = xml('mlt');

  root.elem('consumer', {
    f: "mp4",
    g: "15",
    channels: "2",
    crf: "15",
    progressive: "1",
    target: out,
    threads: "0",
    real_time: "-4",
    mlt_service: "avformat",
    vcodec: "libx264",
    ab: "256k",
    bf: "2",
    preset: "faster",
    acodec: "aac",
  });

  const clips = new Map();
  const playlist = xml('playlist');
  const sortedClips = Object.entries(sq.fusion).sort((a, b) => a[1].offset - b[1].offset);
  let x = 0;
  for (const [id, clip] of sortedClips) {
    clips.set(id, clip);
    if (clip.offset > x) {
      playlist.elem('blank', {
        length: (clip.offset - x).toString()
      });
    }
    x = clip.offset + clip.duration;
    playlist.elem('entry', {
      producer: id,
      in: 0,
      out: clip.duration,
    });
  }

  root.elem('producer', {
    id: 'audio',
    mlt_service: 'avformat',
    resource: path.join(CACHE_PATH, sqId + '.wav'),
  });
  clips.forEach((clip, id) => {
    root.elem('producer', {
      id,
      mlt_service: 'avformat',
      resource: path.join(CACHE_PATH, id + '.mp4'),
    });
  });
  
  const tractor = root.elem('tractor');
  const multitrack = tractor.elem('multitrack');
  multitrack.add(playlist);

  const maxAudioLength = Math.max(...Object.values(sq.audioClips).map((clip) => clip.offset - clip.trim_in + clip.trim_out)) * 30;

  const audioPlaylist = xml('playlist');
  audioPlaylist.add(xml('entry', {
    producer: 'audio',
    in: 0,
    out: maxAudioLength,
  }));

  tractor.add(audioPlaylist);

  return root.stringify();
}

export async function renderSequence(sqId: string, sq: Sequence, out: string) {
  const xml = sequenceToXML(sqId, sq, out);
  const xmlPath = path.join(CACHE_PATH, sqId + '.xml');
  await writeFile(xmlPath, xml);
  
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    console.log(`Rendering sequence ${sqId}`);
    const child = spawn(MELT_PATH, [ xmlPath ], {
      stdio: "pipe"
    });
    child.on("error", reject);
    child.on("close", code => {
      console.log(`render time: ${Date.now() - start}ms`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("melt failed"));
      }
    });
  });
} 
