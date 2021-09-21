import { useCallback } from 'react';
import { SequenceClip } from '../../../../backend/resources/sequence';
import { Actions, useResource } from '../../../frontend-state';
import { useBuffer } from '../../../useBuffer';
import { ResourceViewerProps } from '../ResourceViewerProps';

import c from '../SequenceEditor.module.scss';
import { pixelsPerFrame, trackHeight } from '../ui-config';

function useClipProperty<K extends keyof SequenceClip>(clip: SequenceClip, prop: K) {
  return {
    ...useBuffer(clip[prop]),
    setActual: useCallback(
      (value: SequenceClip[K]) => {
        Actions.sequence.setClipProperty(clip.id, prop, value);
      },
      [clip, prop]
    ),
  };
}

export function TimelineClip({ id }: ResourceViewerProps) {
  const clip = useResource('sequence-clip', id);
  // const sqUi = useUIState('sequence', clip.parent);

  const offset = useClipProperty(clip, 'offset');
  const duration = useClipProperty(clip, 'duration');
  const track = useClipProperty(clip, 'track');
  const trimStart = useClipProperty(clip, 'trimStart');

  // this drag handler is a huge hack, but it works
  function $startDrag(ev: React.MouseEvent) {
    const target = ev.target as HTMLElement;

    let dragType = offset;

    if (target.classList.contains(c.handleRight)) {
      dragType = duration;
    } else if (target.classList.contains(c.handleLeft)) {
      // TODO: Handle the case for when there is no trimStart (fusion and code clips)
      const startTrimIn = trimStart.value;
      const startDuration = duration.value;
      const startOffset = offset.value;
      dragType = {
        value: trimStart.value,
        dirty: true,
        setActual(v) {
          const normalizedV = Math.min(
            startDuration + startTrimIn - 1,
            Math.max(0, startOffset - startTrimIn + v) - startOffset + startTrimIn
          );
          duration.setActual(startDuration + startTrimIn - normalizedV);
          offset.setActual(startOffset - startTrimIn + normalizedV);
          trimStart.setActual(normalizedV);
        },
        setValue(v) {
          const normalizedV = Math.min(
            startDuration + startTrimIn - 1,
            Math.max(0, startOffset - startTrimIn + v) - startOffset + startTrimIn
          );
          duration.setValue(startDuration + startTrimIn - normalizedV);
          offset.setValue(startOffset - startTrimIn + normalizedV);
          trimStart.setValue(normalizedV);
        },
        reset() {
          duration.reset();
          offset.reset();
          trimStart.reset();
        },
      };
    }

    const startValue = dragType.value;
    const startX = ev.clientX;
    const offsetY = ev.currentTarget.getBoundingClientRect().top;
    const startTrack = track.value;

    const minValue = dragType === duration ? 1 : 0;

    function $move(ev: MouseEvent) {
      const delta = ev.clientX - startX;
      dragType.setValue(Math.max(minValue, Math.round(startValue + delta / pixelsPerFrame)));
      if (dragType === offset) {
        track.setValue(Math.max(0, Math.floor((ev.clientY - offsetY) / trackHeight + startTrack)));
      }
    }

    function $up(ev: MouseEvent) {
      const delta = ev.clientX - startX;
      dragType.setActual(Math.max(minValue, Math.round(startValue + delta / pixelsPerFrame)));

      if (dragType === offset) {
        track.setActual(Math.max(0, Math.floor((ev.clientY - offsetY) / trackHeight + startTrack)));
      }

      document.removeEventListener('mousemove', $move);
      document.removeEventListener('mouseup', $up);
    }

    document.addEventListener('mousemove', $move);
    document.addEventListener('mouseup', $up);
  }

  return (
    <div
      className={c.clip}
      style={{
        '--offset': offset.value,
        '--duration': duration.value,
        '--track': track.value,
      }}
      onMouseDown={$startDrag}
    >
      <div className={c.handleLeft} />
      <div className={c.handleRight} />

      <div className={c.clipTitle}>
        {clip.clipType}:{clip.source}
      </div>
      <div>
        #{track.value},{duration.value},{offset.value}
      </div>
      <div>{String(trimStart.value)}</div>
    </div>
  );
}
