import React from 'react';
import { Sequence, SequenceAudioClip, SequenceFusionClip } from "../shared/types";
import { $$numberDialog, $$stringDialog } from './frontend_utils';
import { dispatchAction, useAppState } from "./state";

export interface SequenceEditorProps {
  id: string;
}

export function SequenceEditor({ id: sqId }: SequenceEditorProps) {
  const app = useAppState();
  const sq = app.project.resources[sqId] as Sequence;

  if (!sq) {
    return null;
  }
  const { name, fusion, audioClips } = sq;
  
  return (
    <div>
      <h1>{sqId} "{name}"</h1>
      {JSON.stringify(sq)}
      <br />
      <button onClick={async() => {
        const source = await $$stringDialog('.source');
        const offset = await $$numberDialog('.offset');
        const duration = await $$numberDialog('.duration');
        const clip: SequenceFusionClip = {
          source,
          offset,
          duration,
        };
        dispatchAction('SQ_AddFusionClip', { sqId, clip});
      }}>add fusion clip</button>
      <button onClick={async() => {
        const source = await $$stringDialog('file path of source');
        const offset = await $$numberDialog('.offset');
        const trim_in = await $$numberDialog('.trim_in');
        const trim_out = await $$numberDialog('.trim_out');
        const track = await $$numberDialog('.track');
        const clip: SequenceAudioClip = {
          source,
          offset,
          trim_in,
          trim_out,
          track
        };
        dispatchAction('SQ_AddAudioClip', { sqId, clip});
      }}>add audio clip</button>
      <button onClick={async() => {
        const dest = await $$stringDialog('where save');
        dispatchAction('SQ_Render', { sqId, exportLocation: dest });
      }}>
        render final video
      </button>
      <button onClick={() => {
        dispatchAction('SQ_RenderAudio', { sqId });
      }}>
        render audio only
      </button>
      <button onClick={() => {
        dispatchAction('SQ_UpdateAllCompositions', { sqId });
      }}>
        sync clean all
      </button>
      <div>
        {Object.entries(fusion).map(([id, clip]) => (
          <div key={id}>
            {id} - <code>{JSON.stringify(clip)}</code>
            <button onClick={() => {
              dispatchAction('General_Open', clip.source);
            }}>open this</button>
            <button onClick={() => {
              dispatchAction('SQ_RemoveFusionClip', { sqId, clipId: id });
            }}>delete this</button>
            <button onClick={() => {
              dispatchAction('SQ_RenderSingleClip', { sqId, clipId: id });
            }}>render</button>
            <button onClick={() => {
              dispatchAction('SQ_UpdateComposition', { sqId, clipId: id });
            }}>SQ_UpdateComposition</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} offset=${clip.offset}`);
              dispatchAction('SQ_SetFusionClipProp', { sqId, clipId: id, prop: 'offset', value: newValue });
            }}>set clip offset</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} duration=${clip.duration}`);
              dispatchAction('SQ_SetFusionClipProp', { sqId, clipId: id, prop: 'duration', value: newValue });
            }}>set clip duration</button>
          </div>
        ))}
      </div>
      <hr />
      <div>
        {Object.entries(audioClips).map(([id, clip]) => (
          <div key={id}>
            {id} - <code>{JSON.stringify(clip)}</code>
            <button onClick={() => {
              dispatchAction('SQ_RemoveAudioClip', { sqId, clipId: id });
            }}>delete this</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} offset=${clip.offset}`);
              dispatchAction('SQ_SetAudioClipProp', { sqId, clipId: id, prop: 'offset', value: newValue });
            }}>set clip offset</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} trim_in=${clip.trim_in}`);
              dispatchAction('SQ_SetAudioClipProp', { sqId, clipId: id, prop: 'trim_in', value: newValue });
            }}>set clip duration</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} trim_out=${clip.trim_out}`);
              dispatchAction('SQ_SetAudioClipProp', { sqId, clipId: id, prop: 'trim_out', value: newValue });
            }}>set clip duration</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} track=${clip.track}`);
              dispatchAction('SQ_SetAudioClipProp', { sqId, clipId: id, prop: 'track', value: newValue });
            }}>set clip track</button>
            <button onClick={async() => {
              const newValue = await $$stringDialog(`${id} replace file ${clip.source}`);
              dispatchAction('SQ_SetAudioClipProp', { sqId, clipId: id, prop: 'source', value: newValue });
            }}>replace file</button>
          </div>
        ))}
      </div>
    </div>
  );
}