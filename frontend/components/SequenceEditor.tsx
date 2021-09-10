import path from 'path';
import React from 'react';
import { v4 } from 'uuid';
import { Actions, useResource } from '../frontend-state';
import { $$numberDialog, $$stringDialog } from '../frontend_utils';

interface SequenceEditorProps {
  id: string;
}

export function SequenceEditor({ id }: SequenceEditorProps) {
  const [sq, ui] = useResource('sequence', id);

  return (
    <div>
      <h1>SequenceEditor {sq.id}</h1>
      <pre>
        <code>{JSON.stringify(sq, null, 2)}</code>
      </pre>
      <h2>actions</h2>
      <button
        onClick={() => {
          Actions.system.openPath(path.dirname(sq.id));
        }}
      >
        reveal self
      </button>
      <button
        onClick={() => {
          Actions.resource.save(sq);
        }}
      >
        save file@no-op
      </button>
      <button
        onClick={async () => {
          const source = await $$stringDialog('source');
          const offset = await $$numberDialog('offset');
          const duration = await $$numberDialog('duration');
          const track = await $$numberDialog('track');

          const id = v4();
          Actions.sequence.addClip(sq.id, {
            type: 'sequence-clip',
            source,
            lastExternalRenderTime: 0,
            trackType: 'video',
            isMedia: false,
            isDisabled: false,
            description: '',
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
            type: 'sequence-clip',
            source,
            lastExternalRenderTime: 0,
            trackType: 'audio',
            isMedia: true,
            isDisabled: false,
            description: '',
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
          Actions.sequence.exportSequence(sq.id, { filePath: dest });
        }}
      >
        render final video@no-op
      </button>
      <button
        onClick={() => {
          Actions.sequence.syncAllClips(sq.id);
        }}
      >
        run sync across all clips@no-op
      </button>
      <button
        onClick={() => {
          Actions.sequence.runAudioRender(sq.id);
        }}
      >
        render audio only@no-op
      </button>
      <button
        onClick={() => {
          Actions.sequence.renderAllClips(sq.id);
        }}
      >
        render all video
      </button>
      <h2>contents</h2>
      {/* {Object.values(sq.clips).map((clip) => {
        return (
          <div key={clip.id}>
            <h3>{clip.id}</h3>
            <pre>
              <code>{JSON.stringify(clip, null, 2)}</code>
            </pre>
            <button
              onClick={() => {
                Actions.system.openPath(path.resolve(path.dirname(sq.id), clip.source));
              }}
            >
              open
            </button>
            <button
              onClick={() => {
                Actions.system.showItemInFolder(path.resolve(path.dirname(sq.id), clip.source));
              }}
            >
              show in folder
            </button>
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
                Actions.sequence.renderClip(clip.id);
              }}
            >
              render clip (!isMedia)
            </button>
            <button
              onClick={async () => {
                Actions.sequence.syncClip(clip.id);
              }}
            >
              update composition (provider=fusion)
            </button>
          </div>
        );
      })} */}
    </div>
  );
}
