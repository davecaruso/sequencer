import { ResourceViewerProps } from '../ResourceViewerProps';

import c from '../SequenceEditor.module.scss';

export function Inspector({ id }: ResourceViewerProps) {
  function $save() {}
  function $play() {}
  function $stop() {}

  return (
    <div className={c.inspector}>
      <button onClick={$save}>save resource</button>
      <button style={{ color: 'red' }}>render video</button>
      <button style={{ color: 'red' }}>render all clips</button> <br />
      <button onClick={$play} disabled={false}>
        play
      </button>
      <button onClick={$stop} disabled={true}>
        stop playback
      </button>
      <br />
      <br />
      <button style={{ color: 'red' }}>use media</button>
      <button style={{ color: 'red' }}>fusion</button>
      <button style={{ color: 'red' }}>afx</button>
      <button style={{ color: 'red' }}>blend</button>
      <button style={{ color: 'red' }}>subsequence</button>
      <button style={{ color: 'red' }}>placeholder</button>
      <button style={{ color: 'red' }}>lgrad</button>
      <button style={{ color: 'red' }}>rgrad</button>
      <button style={{ color: 'red' }}>title</button>
      <button style={{ color: 'red' }}>fill</button>
      <button style={{ color: 'red' }}>canvas</button>
      <button style={{ color: 'red' }}>three</button>
      <button style={{ color: 'red' }}>fabric</button>
      <button style={{ color: 'red' }}>gl</button>
      <button style={{ color: 'red' }}>react</button>
      <button style={{ color: 'red' }}>svelte</button>
      <button style={{ color: 'red' }}>html</button>
      <button style={{ color: 'red' }}>css</button>
      <button style={{ color: 'red' }}>advanced web animation</button>
      <br />
      <br />
      <span>any</span>
      <button style={{ color: 'red' }}>delete</button>
      <br />
      <br />
      <span>fusion</span>
      <button style={{ color: 'red' }}>open</button>
      <button style={{ color: 'red' }}>duplicate</button>
      <button style={{ color: 'red' }}>clean</button>
      <button style={{ color: 'red' }}>render this</button>
      <br />
      <br />
      <span>code</span>
      <button style={{ color: 'red' }}>edit</button>
      <button style={{ color: 'red' }}>lint</button>
      <button style={{ color: 'red' }}>render this</button>
      <br />
      <br />
      <span>ui controls</span>
      <button style={{ color: 'red' }}>edit</button>
    </div>
  );
}
