import { shell } from 'electron';
import { writeFile, remove } from 'fs-extra';
import path from 'path';
import { FComposition } from '../shared/fcomposition';
import { AppState, SequenceFusionClip } from '../shared/types';

interface ISQ_AddFusionClip {
  sqId: string;
  clip: SequenceFusionClip;
}
interface ISQ_SetClipProp {
  sqId: string;
  clipId: string;
  prop: string;
  value: any;
}
interface SQ_RemoveFusionClip {
  sqId: string;
  clipId: string;
}
interface ISQ_RunAudioSync {
  sqId: string;
  clipId: string;
}

const root = 'C:\\Code\\creative-toolkit\\sample'

export async function SQ_AddFusionClip(state: AppState, { sqId, clip }: ISQ_AddFusionClip) {
  state.project.resources[sqId].fusion[clip.source] = clip;

  const comp = FComposition.create();
  comp.RenderRangeStart = clip.offset + clip.trim_in;
  comp.RenderRangeEnd = clip.offset + clip.trim_out;
  comp.GlobalRange = comp.RenderRange;
  comp.CurrentTime = comp.RenderRangeStart;
  console.log(comp);

  await writeFile(
    path.join(root, clip.source),
    comp.toString(),
  );
}

export async function SQ_RemoveFusionClip(state: AppState, { sqId, clipId }: SQ_RemoveFusionClip) {
  delete state.project.resources[sqId].fusion[clipId];

  await remove(path.join(root, clipId));
}

export async function SQ_SetClipProp(state: AppState, { sqId, clipId, prop, value }: ISQ_SetClipProp) {
  const clip = state.project.resources[sqId].fusion[clipId];
  (clip as any)[prop] = value;
}

export async function SQ_RunAudioSync(state: AppState, { sqId, clipId }: ISQ_RunAudioSync) {
  // not implemented
}

export async function General_Open(state: AppState, file: string) {
  shell.openPath(path.resolve(root, file));
}