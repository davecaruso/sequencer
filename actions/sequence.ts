import path from 'path';
import { shell } from 'electron';
import { writeFile, remove, readFile, pathExists } from 'fs-extra';
import { FComposition } from '../shared/fcomposition';
import { AppState, SequenceAudioClip, SequenceFusionClip } from '../shared/types';
import { v4 } from 'uuid';
import { combineAudio } from '../backend/ffmpeg-audio';
import { CACHE_PATH } from '../backend/paths';
import { Project_Save } from './project';
import { FTool } from '../shared/ftool';
import { renderFusionFile } from '../backend/fusion-automated';
import { renderSequence } from '../backend/renderSequence';

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

interface ISQ_RenderSingleClip {
  sqId: string;
  clipId: string;
}

interface ISQ_Render {
  sqId: string;
  exportLocation: string;
}

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

  const saver = new FTool(`Saver {
    NameSet = true,
    Inputs = {
      Clip = Input {
        Value = Clip {
          Filename = "",
          FormatID = "QuickTimeMovies",
          Length = 0,
          Saving = true,
          TrimIn = 0,
          ExtendFirst = 0,
          ExtendLast = 0,
          Loop = 1,
          AspectMode = 0,
          Depth = 0,
          GlobalStart = -2000000000,
          GlobalEnd = 0
        },
      },
      Input = Input {
        SourceOp = "Background1",
        Source = "Output",
      },
      OutputFormat = Input { Value = FuID { "QuickTimeMovies" }, },
      ["QuickTimeMovies.Compression"] = Input { Value = FuID { "H.264_avc1" }, },
      ["QuickTimeMovies.Advanced"] = Input { Value = 1, },
    },
    ViewInfo = OperatorInfo { Pos = { 750, 50 } },
  }`);
  saver.Inputs.get('Clip').get('Value').set('Filename', path.join(CACHE_PATH, `${id}.mp4`));

  const background = new FTool(`Background {
    Inputs = {
      Width = Input { Value = 1920, },
      Height = Input { Value = 1080, },
      TopLeftRed = Input { Value = 0.62, },
      TopLeftGreen = Input { Value = 0.4, },
      TopLeftBlue = Input { Value = 0.2, },
    },
    ViewInfo = OperatorInfo { Pos = { 100, 50 } },
  }`);

  comp.Tools.set('Background1', background);
  comp.Tools.set('CTK_Output', saver);
  
  await writeFile(
    path.join(path.dirname(state.projectFilepath), clip.source),
    comp.toString(),
  );
}

export async function SQ_AddAudioClip(state: AppState, { sqId, clip }: ISQ_AddAudioClip) {
  const id = v4();

  state.project.resources[sqId].audioClips[id] = clip;
  state.project.resources[sqId].audioDirty = true;
}

export async function SQ_RemoveFusionClip(state: AppState, { sqId, clipId }: ISQ_RemoveFusionClip) {
  const file =  state.project.resources[sqId].fusion[clipId].source;

  delete state.project.resources[sqId].fusion[clipId];

  await remove(path.join(path.dirname(state.projectFilepath), file));
}

export async function SQ_RemoveAudioClip(state: AppState, { sqId, clipId }: ISQ_RemoveAudioClip) {
  delete state.project.resources[sqId].audioClips[clipId];
  state.project.resources[sqId].audioDirty = true;
}

export async function SQ_SetFusionClipProp(state: AppState, { sqId, clipId, prop, value }: ISQ_SetFusionClipProp) {
  const clip = state.project.resources[sqId].fusion[clipId];
  (clip as any)[prop] = value;
  clip.dirty = true;

  await SQ_UpdateComposition(state, { sqId, clipId });
}

export async function SQ_SetAudioClipProp(state: AppState, { sqId, clipId, prop, value }: ISQ_SetAudioClipProp) {
  const clip = state.project.resources[sqId].audioClips[clipId];
  (clip as any)[prop] = value;
  state.project.resources[sqId].audioDirty = true;
}

export async function SQ_UpdateComposition(state: AppState, { sqId, clipId }: ISQ_UpdateComposition) {
  const clip = state.project.resources[sqId].fusion[clipId];
  const compPath = path.join(path.dirname(state.projectFilepath), clip.source);
  if (!clip.dirty) return;

  const compText = (await readFile(compPath)).toString();
  const comp = new FComposition(compText);
  comp.RenderRangeStart = clip.offset;
  comp.RenderRangeEnd = clip.offset + clip.duration;
  comp.GlobalRange = comp.RenderRange;
  comp.CurrentTime = comp.RenderRangeStart;
  comp.AudioFilename = CACHE_PATH + '\\' + sqId + '.wav';
  await writeFile(compPath, comp.toString());

  clip.dirty = false;
}

export async function SQ_UpdateAllCompositions(state: AppState, { sqId }: ISQ_UpdateAllCompositions) {
  const clips = state.project.resources[sqId].fusion;
  await Promise.all(Object.keys(clips).map(async(clip) => SQ_UpdateComposition(state, { sqId, clipId: clip })));
}

export async function SQ_RenderAudio(state: AppState, { sqId }: ISQ_RenderAudio) {
  const outputFile = path.join(CACHE_PATH, `${sqId}.wav`);
  const sq = state.project.resources[sqId];

  if (!sq.audioDirty && await pathExists(outputFile)) return;

  const audioClips = Object.values(sq.audioClips);

  console.log('rendering audio', sqId);

  await combineAudio(audioClips, outputFile);

  sq.audioDirty = false;
}

export async function SQ_RenderSingleClip(state: AppState, { sqId, clipId }: ISQ_RenderSingleClip) {
  await Project_Save(state);
  await SQ_UpdateComposition(state, { sqId, clipId });
  
  const sq = state.project.resources[sqId];
  const clip = sq.fusion[clipId];

  await renderFusionFile(path.resolve(path.dirname(state.projectFilepath), clip.source));
}

export async function SQ_Render(state: AppState, { sqId, exportLocation }: ISQ_Render) {
  await Project_Save(state);
  await SQ_RenderAudio(state, { sqId });
  await Promise.all(Object.keys(state.project.resources[sqId].fusion).map(async(clipId) => SQ_RenderSingleClip(state, { sqId, clipId })));
  await renderSequence(sqId, state.project.resources[sqId], path.resolve(path.dirname(state.projectFilepath), exportLocation));
}

export async function General_Open(state: AppState, file: string) {
  shell.openPath(path.resolve(path.dirname(state.projectFilepath), file));
}