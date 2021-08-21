import React from 'react';
import { SQ_AddFusionClip } from '../actions/sequence';
import { Sequence, SequenceFusionClip } from "../shared/types";
import { $$numberDialog, $$stringDialog } from './frontend_utils';
import { dispatchAction, useAppState } from "./state";

export interface SequenceEditorProps {
  id: string;
}
export function SequenceEditor({ id }: SequenceEditorProps) {
  const app = useAppState();
  const sq = app.project.resources[id] as Sequence;
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
        dispatchAction(SQ_AddFusionClip, { id, clip});
      }}>add fusion clip</button>
      <div>
        {Object.entries(fusion).map(([id, clip]) => (
          <div key={id}>
            {id} - <code>{JSON.stringify(clip)}</code>
            <button>delete this</button>
            <button>run audio sync magic</button>
            <button>set clip position</button>
            <button>set clip duration</button>
            <button>set clip in position</button>
            <button>set clip out position</button>
          </div>
        ))}
      </div>
    </div>
  );
}