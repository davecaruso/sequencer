import { spawn } from "child_process";
import { mkdir, pathExists } from "fs-extra";
import path from "path";
import { SequenceAudioClip } from "../shared/types";
import { FFMPEG_PATH } from './paths';

function getCommandArgs(clips: SequenceAudioClip[], outputFile: string): string[] {
  const args: string[] = [];
  clips.forEach(clip => {
    args.push("-i");
    args.push(clip.source);
  });
  args.push("-filter_complex");
  
  let filters = [];
  clips.forEach((clip, i) => {
    filters.push(`[${i}:a]adelay=delays=${clip.offset}s:all=1[a${i}]`);
  });
  filters.push(`${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}[out]`);
  args.push(filters.join(";"));

  args.push("-map");
  args.push("[out]");
  args.push(outputFile);

  return args;
}

export async function combineAudio(clips: SequenceAudioClip[], outputFile: string): Promise<void> {
  if (!await pathExists(path.dirname(outputFile))) {
    await mkdir(path.dirname(outputFile));
  }
  const args = getCommandArgs(clips, outputFile);
  return new Promise<void>((resolve, reject) => {
    const child = spawn(FFMPEG_PATH, args);
    console.log(`Running ffmpeg with args: ${args.join(" ")}`);
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("ffmpeg failed"));
      }
    });
  });
}
