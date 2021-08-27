import React from 'react';
import { v4 } from 'uuid';
import { Sequence } from '../shared/types';
import { Actions } from './actions';
import { $$numberDialog, $$stringDialog } from './frontend_utils';

interface SequenceEditorProps {
  resource: Sequence;
}

export function SequenceEditor({ resource: sq }: SequenceEditorProps) {
  return (
    <div>
      <h1>
        SequenceEditor {sq.id} aka {sq.path}
      </h1>
      <pre>
        <code>{JSON.stringify({ ...sq, clips: undefined }, null, 2)}</code>
      </pre>
      <h2>actions</h2>
      <button
        onClick={async () => {
          const source = await $$stringDialog('source');
          const offset = await $$numberDialog('offset');
          const duration = await $$numberDialog('duration');
          const track = await $$numberDialog('track');

          const id = v4();
          Actions.sequence.addClip(sq.id, {
            id,
            type: 'sequence-clip',
            source,
            lastExternalRenderTime: 0,
            trackType: 'video',
            isMedia: false,
            isDisabled: false,
            description: '',
            parent: sq.id,
            offset,
            trimStart: 0,
            trimEnd: duration,
            track,
          });
        }}
      >
        add fusion clip
      </button>
      <button
        onClick={async () => {
          const source = await $$stringDialog('file path of source');
          const offset = await $$numberDialog('offset');
          const trim_in = await $$numberDialog('trim_in');
          const trim_out = await $$numberDialog('trim_out');
          const track = await $$numberDialog('track');

          const id = v4();
          Actions.sequence.addClip(sq.id, {
            id,
            type: 'sequence-clip',
            source,
            lastExternalRenderTime: 0,
            trackType: 'audio',
            isMedia: true,
            isDisabled: false,
            description: '',
            parent: sq.id,
            offset,
            trimStart: trim_in,
            trimEnd: trim_out,
            track,
          });
        }}
      >
        add audio clip
      </button>
      <br />
      <button
        onClick={async () => {
          const dest = await $$stringDialog('where save');
        }}
      >
        render final video
      </button>
      <button onClick={() => {}}>run async across all</button>
      <button onClick={() => {}}>render audio only</button>
      <button onClick={() => {}}>render all video</button>
      <h2>contents</h2>
      {Object.values(sq.clips).map((clip) => {
        return (
          <div key={clip.id}>
            <h3>{clip.id}</h3>
            <pre>
              <code>{JSON.stringify(clip, null, 2)}</code>
            </pre>
            <button
              onClick={() => {
                Actions.sequence.deleteClip(clip.id);
              }}
            >
              delete this
            </button>
            <button
              onClick={async () => {
                const newValue = await $$stringDialog(`.source = ${clip.source}`);
                Actions.sequence.editClipProp(clip.id, 'source', newValue);
              }}
            >
              .source
            </button>
            <button
              onClick={async () => {
                const newValue = await $$stringDialog(`.description = ${clip.description}`);
                Actions.sequence.editClipProp(clip.id, 'description', newValue);
              }}
            >
              .description
            </button>
            <button
              onClick={async () => {
                const newValue = await $$numberDialog(`.offset = ${clip.offset}`);
                Actions.sequence.editClipProp(clip.id, 'offset', newValue);
              }}
            >
              .offset
            </button>
            <button
              onClick={async () => {
                const newValue = await $$numberDialog(`.trimStart = ${clip.trimStart}`);
                Actions.sequence.editClipProp(clip.id, 'trimStart', newValue);
              }}
            >
              .trimStart
            </button>
            <button
              onClick={async () => {
                const newValue = await $$numberDialog(`.trimEnd = ${clip.trimEnd}`);
                Actions.sequence.editClipProp(clip.id, 'trimEnd', newValue);
              }}
            >
              .trimEnd
            </button>
            <button
              onClick={async () => {
                const newValue = await $$numberDialog(`.track = ${clip.track}`);
                Actions.sequence.editClipProp(clip.id, 'track', newValue);
              }}
            >
              .track
            </button>
            <button
              onClick={async () => {
                // TODO:
              }}
            >
              render clip (!isMedia)
            </button>
            <button
              onClick={async () => {
                //
              }}
            >
              update composition (provider=fusion)
            </button>
          </div>
        );
      })}
    </div>
  );
}
