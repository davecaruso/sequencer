// Creative Toolkit - by dave caruso
// Sequence Actions

import { pathExists, readFile, stat, writeFile } from 'fs-extra';
import path from 'path';
import { v4 } from 'uuid';
import { FComposition } from '../../shared/fcomposition';
import { FTool } from '../../shared/ftool';
import { ActionEvent } from '../backend-state';
import { combineAudio } from '../lib/ffmpeg-audio';
import { renderFusionFile } from '../lib/fusion-automated';
import { renderSequence } from '../lib/renderSequence';
import { CACHE_PATH } from '../paths';
import { Sequence, SequenceClip, SequenceClipPartial } from '../resources/sequence';

export async function sequence_addClip(
  event: ActionEvent,
  sqId: string,
  clip: SequenceClipPartial
) {
  const sq = await event.fetchResource('sequence', sqId);

  const id = v4();

  event.updateResource('sequence', sqId, (s) => {
    s.clips.push(id);
    return s;
  });

  await event.addResource({
    id,
    parent: sq,
    ...clip,
  } as SequenceClip);

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
      .set('Filename', path.join(CACHE_PATH, `${id}.mp4`));

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

    comp.Tools.set('Background0', background);
    comp.Tools.set('CTK_Output', saver);

    const compPath = path.resolve(path.dirname(sq.id), clip.source);
    await writeFile(compPath, comp.toString());
  }
}

// export async function sequence_deleteClip(event: ActionEvent, clipId: string) {
//   const resources = state.resources;
//   const clip = resources[clipId] as SequenceClip;
//   const sq = state.resources[clip.parent] as Sequence;

//   // remove clip from sequence
//   delete sq.clips[clip.id];

//   // remove clip from resources
//   delete state.resources[clipId];

//   if (clip.trackType === 'audio') {
//     sq.lastAudioRenderTime = 0;
//   }
// }

// export async function sequence_editClipProp<K extends keyof SequenceClip>(
//   event: ActionEvent,
//   clipId: string,
//   prop: K,
//   value: SequenceClip[K]
// ) {
//   const clip = state.resources[clipId] as SequenceClip;
//   clip[prop] = value;
// }

// export interface SequenceExportOptions {
//   filePath: string;
// }

// export async function sequence_exportSequence(
//   event: ActionEvent,
//   sqId: string,
//   options: SequenceExportOptions
// ) {
//   const sq = state.resources[sqId] as Sequence;
//   const { filePath } = options;

//   const resolvedFilePath = path.resolve(path.dirname(sq.id), filePath);

//   await sequence_renderAllClips(state, sqId);

//   await renderSequence(sq.id, sq, resolvedFilePath);
// }

// export async function sequence_renderClip(event: ActionEvent, clipId: string) {
//   const clip = state.resources[clipId] as SequenceClip;
//   const sq = state.resources[clip.parent] as Sequence;

//   if (clip.isMedia) {
//     return;
//   }

//   const clipSource = path.resolve(path.dirname(sq.id), clip.source);

//   const file = await stat(clipSource);
//   if (clip.lastExternalRenderTime && file.mtime.getTime() >= clip.lastExternalRenderTime) return;

//   if (clip.source.endsWith('.comp')) {
//     clip.lastExternalRenderTime = file.mtime.getTime();

//     await renderFusionFile(clipSource);
//   }
// }

// export async function sequence_renderAllClips(event: ActionEvent, sqId: string) {
//   const sq = state.resources[sqId] as Sequence;

//   for (const clipId of Object.keys(sq.clips)) {
//     await sequence_renderClip(state, clipId);
//   }
// }

// export async function sequence_syncClip(event: ActionEvent, clipId: string) {
//   const clip = state.resources[clipId] as SequenceClip;
//   const sq = state.resources[clip.parent] as Sequence;

//   if (clip.isMedia) {
//     return;
//   }

//   const clipSource = path.resolve(path.dirname(sq.id), clip.source);

//   if (clip.source.endsWith('.comp')) {
//     const compText = (await readFile(clipSource)).toString();
//     const comp = new FComposition(compText);
//     comp.RenderRangeStart = clip.offset;
//     comp.RenderRangeEnd = clip.offset + clip.trimEnd;
//     comp.GlobalRange = comp.RenderRange;
//     comp.CurrentTime = comp.RenderRangeStart;
//     comp.AudioFilename = path.join(CACHE_PATH, `${clip.id}.wav`);
//     await writeFile(clipSource, comp.toString());
//   }
// }

// export async function sequence_syncAllClips(event: ActionEvent, sqId: string) {
//   const sq = state.resources[sqId] as Sequence;

//   for (const clipId of Object.keys(sq.clips)) {
//     await sequence_syncClip(state, clipId);
//   }
// }

// export async function sequence_runAudioRender(event: ActionEvent, sqId: string) {
//   const sq = state.resources[sqId] as Sequence;

//   // TODO: replace true with a check if the sequence has any audio files newer than the last render time
//   if (sq.lastAudioRenderTime && true) {
//     return;
//   }

//   const audioClips = Object.values(sq.clips).filter((c) => c.trackType === 'audio');
//   const outputFile = path.join(CACHE_PATH, `${sq.id}.wav`);

//   for (const clip of audioClips) {
//     await sequence_renderClip(state, clip.id);
//   }

//   await combineAudio(audioClips, outputFile);

//   sq.lastAudioRenderTime = Date.now();
// }
