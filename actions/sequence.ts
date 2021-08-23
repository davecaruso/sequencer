import path from 'path';
import { shell } from 'electron';
import { writeFile, remove, readFile } from 'fs-extra';
import { FComposition } from '../shared/fcomposition';
import { AppState, SequenceAudioClip, SequenceFusionClip } from '../shared/types';
import { v4 } from 'uuid';
import { combineAudio } from '../backend/ffmpeg-audio';
import { CACHE_PATH } from '../backend/paths';
import { Project_Save } from './project';

interface ISQ_AddFusionClip {
  sqId: string;
  clip: SequenceFusionClip;
}

interface ISQ_AddAudioClip {
  sqId: string;
  clip: SequenceAudioClip;
}

interface ISQ_UpdateAllCompositions {
  sqId: string;
}

interface ISQ_SetFusionClipProp {
  sqId: string;
  clipId: string;
  prop: string;
  value: any;
}

interface ISQ_SetAudioClipProp {
  sqId: string;
  clipId: string;
  prop: string;
  value: any;
}

interface ISQ_RemoveFusionClip {
  sqId: string;
  clipId: string;
}

interface ISQ_RemoveAudioClip {
  sqId: string;
  clipId: string;
}

interface ISQ_UpdateComposition {
  sqId: string;
  clipId: string;
}

interface ISQ_RenderAudio {
  sqId: string;
}

const root = 'C:\\Code\\creative-toolkit\\sample'

export async function SQ_AddFusionClip(state: AppState, { sqId, clip }: ISQ_AddFusionClip) {
  const id = v4();

  clip.dirty = false;

  state.project.resources[sqId].fusion[id] = clip;

  const comp = FComposition.create();
  comp.RenderRangeStart = clip.offset;
  comp.RenderRangeEnd = clip.offset + clip.duration;
  comp.GlobalRange = comp.RenderRange;
  comp.CurrentTime = comp.RenderRangeStart;
  comp.AudioFilename = CACHE_PATH + '\\' + sqId + '.wav';
  
  await writeFile(
    path.join(root, clip.source),
    comp.toString(),
  );

  await Project_Save(state);
}

export async function SQ_AddAudioClip(state: AppState, { sqId, clip }: ISQ_AddAudioClip) {
  const id = v4();

  state.project.resources[sqId].audioClips[id] = clip;
  state.project.resources[sqId].audioDirty = true;

  await Project_Save(state);
}

export async function SQ_RemoveFusionClip(state: AppState, { sqId, clipId }: ISQ_RemoveFusionClip) {
  const file =  state.project.resources[sqId].fusion[clipId].source;

  delete state.project.resources[sqId].fusion[clipId];

  await remove(path.join(root, file));
  await Project_Save(state);
}

export async function SQ_RemoveAudioClip(state: AppState, { sqId, clipId }: ISQ_RemoveAudioClip) {
  delete state.project.resources[sqId].audioClips[clipId];
  state.project.resources[sqId].audioDirty = true;
}

export async function SQ_SetFusionClipProp(state: AppState, { sqId, clipId, prop, value }: ISQ_SetFusionClipProp) {
  const clip = state.project.resources[sqId].fusion[clipId];
  (clip as any)[prop] = value;

  await SQ_UpdateComposition(state, { sqId, clipId });
}

export async function SQ_SetAudioClipProp(state: AppState, { sqId, clipId, prop, value }: ISQ_SetAudioClipProp) {
  const clip = state.project.resources[sqId].audioClips[clipId];
  (clip as any)[prop] = value;
  state.project.resources[sqId].audioDirty = true;
}

export async function SQ_UpdateComposition(state: AppState, { sqId, clipId }: ISQ_UpdateComposition) {
  const clip = state.project.resources[sqId].fusion[clipId];
  if (!clip.dirty) return;

  const compText = (await readFile(path.join(root, clip.source))).toString();
  const comp = new FComposition(compText);
  comp.RenderRangeStart = clip.offset;
  comp.RenderRangeEnd = clip.offset + clip.duration;
  comp.GlobalRange = comp.RenderRange;
  comp.CurrentTime = comp.RenderRangeStart;
  comp.AudioFilename = CACHE_PATH + '\\' + sqId + '.wav';
  await writeFile(path.join(root, clip.source), comp.toString());

  clip.dirty = false;
  await Project_Save(state);
}

export async function SQ_UpdateAllCompositions(state: AppState, { sqId }: ISQ_UpdateAllCompositions) {
  const clips = state.project.resources[sqId].fusion;
  await Promise.all(Object.keys(clips).map(async(clip) => SQ_UpdateComposition(state, { sqId, clipId: clip })));
}

export async function SQ_RenderAudio(state: AppState, { sqId }: ISQ_RenderAudio) {
  const sq = state.project.resources[sqId];
  if (!sq.audioDirty) return;

  const audioClips = Object.values(sq.audioClips);
  const outputFile = path.join(CACHE_PATH, `${sqId}.wav`);

  await combineAudio(audioClips, outputFile);

  sq.audioDirty = false;

  await Project_Save(state);
}

export async function General_Open(state: AppState, file: string) {
  shell.openPath(path.resolve(root, file));
}
