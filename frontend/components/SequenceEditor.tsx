import React, { useCallback, useState } from 'react';
import { SequenceClip } from '../../backend/resources/_all';
import { Actions, useProject, useResource } from '../frontend-state';
import { useAudioTag } from '../useAudioTag';
import { useBuffer } from '../useBuffer';
import c from './SequenceEditor.module.scss';

const SQ_FPS = 30; // TODO: make this configurable

interface ResourceViewerProps {
  id: string;
}

const pixelsPerFrame = 2;
const trackHeight = 70;

export function SequenceEditor({ id }: ResourceViewerProps) {
  const [sq, ui] = useResource('sequence', id);
  const project = useProject(sq);
  const audio = useAudioTag(project.audioFile);

  const [playhead, setPlayhead] = useState(20);
  const [playStopHandler, setPlayStopHandler] = useState<null | { stop: () => void }>(null);

  function $save() {}

  function $playheadDrag(ev: React.MouseEvent) {
    if (playStopHandler) return;

    const startX = ev.clientX;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setPlayhead(playhead + delta / pixelsPerFrame);
    };

    const onMouseUp = (ev: MouseEvent) => {
      onMouseMove(ev);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function $play() {
    if (playStopHandler) return;

    let playing = true;
    function render() {
      setPlayhead(Math.round(audio.currentTime * SQ_FPS));

      if (playing) {
        requestAnimationFrame(render);
      }
    }
    requestAnimationFrame(render);

    setPlayStopHandler({
      stop: () => {
        playing = false;
        audio.pause();
        setPlayhead(Math.round(audio.currentTime * SQ_FPS));
        setPlayStopHandler(null);
      },
    });

    audio.currentTime = playhead / SQ_FPS;
    audio.play();
  }

  function $insertRawMedia() {}

  function $insertFusionClip() {}

  return (
    <div
      className={c.root}
      style={{
        '--pixels-per-frame': pixelsPerFrame,
        '--track-height': trackHeight,
      }}
    >
      <div className={c.hSplit}>
        <div className={c.inspector}>
          <button onClick={$save}>save resource</button> <br />
          <button onClick={$play} disabled={!!playStopHandler}>
            play
          </button>
          <button onClick={playStopHandler?.stop} disabled={!playStopHandler}>
            stop playback
          </button>
          <br />
          <button onClick={$insertRawMedia}>raw media</button>
          <button onClick={$insertFusionClip}>fusion</button>
        </div>
        <div className={c.viewer}>
          <div>VIEWER</div>
        </div>
      </div>
      <div className={c.timeline}>
        <div
          className={c.playhead}
          style={{
            '--playhead': playhead,
          }}
          onMouseDown={$playheadDrag}
        >
          <div className={c.playheadLine} />
        </div>
        {sq.clips.map((clip, i) => {
          return <ClipUI key={i} id={clip} />;
        })}
      </div>
    </div>
  );
}

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

function ClipUI({ id }: ResourceViewerProps) {
  const [clip, ui] = useResource('sequence-clip', id);
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
