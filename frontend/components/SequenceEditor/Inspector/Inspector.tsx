import { ResourceViewerProps } from '../ResourceViewerProps';

import c from '../SequenceEditor.module.scss';

export function Inspector({ id }: ResourceViewerProps) {
  function $save() {}
  function $play() {}
  function $stop() {}
  function $insertRawMedia() {}
  function $insertFusionClip() {}

  return (
    <div className={c.inspector}>
      <button onClick={$save}>save resource</button> <br />
      <button onClick={$play} disabled={false}>
        play
      </button>
      <button onClick={$stop} disabled={true}>
        stop playback
      </button>
      <br />
      <button onClick={$insertRawMedia}>raw media</button>
      <button onClick={$insertFusionClip}>fusion</button>
    </div>
  );
}
