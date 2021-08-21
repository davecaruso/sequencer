import React from 'react';
import { SQ_AddFusionClip } from '../actions/sequence';
import { Sequence, SequenceFusionClip } from "../shared/types";
import { $$numberDialog, $$stringDialog } from './frontend_utils';
import { dispatchAction, useAppState } from "./state";

export interface SequenceEditorProps {
  id: string;
}
export function SequenceEditor({ id: sqId }: SequenceEditorProps) {
  const app = useAppState();
  const sq = app.project.resources[sqId] as Sequence;
  const { name, fusion, audioClips } = sq;
  
  return (
    <div>
      <h1>{name}</h1>
      <button onClick={async() => {
        const source = await $$stringDialog('.source');
        const offset = await $$numberDialog('.offset');
        const duration = await $$numberDialog('.duration');
        const clip: SequenceFusionClip = {
          source,
          offset,
          trim_in: offset,
          trim_out: offset + duration,
        };
        dispatchAction('SQ_AddFusionClip', { sqId, clip});
      }}>add fusion clip</button>
      <button>
        render final video
      </button>
      <button>
        run audio sync on all
      </button>
      <div>
        {Object.entries(fusion).map(([id, clip]) => (
          <div key={id}>
            {id} - <code>{JSON.stringify(clip)}</code>
            <button onClick={() => {
              dispatchAction('General_Open', clip.source);
            }}>open this</button>
            <button onClick={() => {
              dispatchAction('SQ_RemoveFusionClip', { sqId, clipId: clip.source });
            }}>delete this</button>
            <button onClick={() => {
              dispatchAction('SQ_RunAudioSync', { sqId, clipId: clip.source });
            }}>run audio sync magic</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} offset=${clip.offset}`);
              dispatchAction('SQ_SetClipProp', { sqId, clipId: clip.source, prop: 'offset', value: newValue });
            }}>set clip position</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} trim_in=${clip.offset}`);
              dispatchAction('SQ_SetClipProp', { sqId, clipId: clip.source, prop: 'trim_in', value: newValue });
            }}>set clip trim_in</button>
            <button onClick={async() => {
              const newValue = await $$numberDialog(`${id} trim_out=${clip.offset}`);
              dispatchAction('SQ_SetClipProp', { sqId, clipId: clip.source, prop: 'trim_out', value: newValue });
            }}>set clip trim_out</button>
          </div>
        ))}
      </div>
    </div>
  );
}