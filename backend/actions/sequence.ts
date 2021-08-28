// Creative Toolkit - by dave caruso
// Sequence Actions

import { pathExists, readFile, stat, writeFile } from 'fs-extra';
import path from 'path';
import { FComposition } from '../../shared/fcomposition';
import { FTool } from '../../shared/ftool';
import { AppState, Sequence, SequenceClip } from '../../shared/types';
import { addResource } from '../backend-state';
import { combineAudio } from '../ffmpeg-audio';
import { renderFusionFile } from '../fusion-automated';
import { renderSequence } from '../renderSequence';
import { CACHE_PATH } from '../paths';

export async function sequence_addClip(state: AppState, sqId: string, clip: SequenceClip) {
  const sq = state.resources[sqId] as Sequence;
  sq.clips[clip.id] = clip;
  await addResource(clip);

  if (clip.source.endsWith('.comp')) {
    const comp = (await pathExists(clip.source))
      ? new FComposition((await readFile(clip.source)).toString())
      : FComposition.create();

    comp.RenderRangeStart = clip.offset;
    comp.RenderRangeEnd = clip.offset + clip.trimEnd;
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
    saver.Inputs.get('Clip')
      .get('Value')
      .set('Filename', path.join(CACHE_PATH, `${clip.id}.mp4`));

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

    const sq = state.resources[sqId] as Sequence;
    const compPath = path.resolve(path.dirname(sq.path), clip.source);
    await writeFile(compPath, comp.toString());
  }
}

export async function sequence_deleteClip(state: AppState, clipId: string) {
  const resources = state.resources;
  const clip = resources[clipId] as SequenceClip;
  const sq = state.resources[clip.parent] as Sequence;

  // remove clip from sequence
  delete sq.clips[clip.id];

  // remove clip from resources
  delete state.resources[clipId];

  if (clip.trackType === 'audio') {
    sq.lastAudioRenderTime = 0;
  }
}

export async function sequence_editClipProp<K extends keyof SequenceClip>(
  state: AppState,
  clipId: string,
  prop: K,
  value: SequenceClip[K]
) {
  const clip = state.resources[clipId] as SequenceClip;
  clip[prop] = value;
}

export interface SequenceExportOptions {
  filePath: string;
}

export async function sequence_exportSequence(
  state: AppState,
  sqId: string,
  options: SequenceExportOptions
) {
  const sq = state.resources[sqId] as Sequence;
  const { filePath } = options;

  const resolvedFilePath = path.resolve(path.dirname(sq.path), filePath);

  await sequence_renderAllClips(state, sqId);

  await renderSequence(sq.id, sq, resolvedFilePath);
}

export async function sequence_renderClip(state: AppState, clipId: string) {
  const clip = state.resources[clipId] as SequenceClip;
  const sq = state.resources[clip.parent] as Sequence;

  if (clip.isMedia) {
    return;
  }

  const clipSource = path.resolve(path.dirname(sq.path), clip.source);

  const file = await stat(clipSource);
  if (clip.lastExternalRenderTime && file.mtime.getTime() >= clip.lastExternalRenderTime) return;

  if (clip.source.endsWith('.comp')) {
    clip.lastExternalRenderTime = file.mtime.getTime();

    await renderFusionFile(clipSource);
  }
}

export async function sequence_renderAllClips(state: AppState, sqId: string) {
  const sq = state.resources[sqId] as Sequence;

  for (const clipId of Object.keys(sq.clips)) {
    await sequence_renderClip(state, clipId);
  }
}

export async function sequence_syncClip(state: AppState, clipId: string) {
  const clip = state.resources[clipId] as SequenceClip;
  const sq = state.resources[clip.parent] as Sequence;

  if (clip.isMedia) {
    return;
  }

  const clipSource = path.resolve(path.dirname(sq.path), clip.source);

  if (clip.source.endsWith('.comp')) {
    const compText = (await readFile(clipSource)).toString();
    const comp = new FComposition(compText);
    comp.RenderRangeStart = clip.offset;
    comp.RenderRangeEnd = clip.offset + clip.trimEnd;
    comp.GlobalRange = comp.RenderRange;
    comp.CurrentTime = comp.RenderRangeStart;
    comp.AudioFilename = path.join(CACHE_PATH, `${clip.id}.wav`);
    await writeFile(clipSource, comp.toString());
  }
}

export async function sequence_syncAllClips(state: AppState, sqId: string) {
  const sq = state.resources[sqId] as Sequence;

  for (const clipId of Object.keys(sq.clips)) {
    await sequence_syncClip(state, clipId);
  }
}

export async function sequence_runAudioRender(state: AppState, sqId: string) {
  const sq = state.resources[sqId] as Sequence;

  // TODO: replace true with a check if the sequence has any audio files newer than the last render time
  if (sq.lastAudioRenderTime && true) {
    return;
  }

  const audioClips = Object.values(sq.clips).filter((c) => c.trackType === 'audio');
  const outputFile = path.join(CACHE_PATH, `${sq.id}.wav`);

  for (const clip of audioClips) {
    await sequence_renderClip(state, clip.id);
  }

  await combineAudio(audioClips, outputFile);

  sq.lastAudioRenderTime = Date.now();
}
