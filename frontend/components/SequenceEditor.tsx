import path from 'path';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SequenceClip } from '../../backend/resources/_all';
import { Actions, useAllResources, useProject, useResource } from '../frontend-state';
import { useAudioTag } from '../useAudioTag';
import { useBuffer } from '../useBuffer';
import { AspectRatioFrame } from './AspectRatioFrame';
import c from './SequenceEditor.module.scss';

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

  const allClipsResolved = useAllResources('sequence-clip', sq.clips);

  function $save() {}

  function $playheadDrag(ev: React.MouseEvent) {
    if (playStopHandler) return;

    const startX = ev.clientX;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setPlayhead(Math.round(playhead + delta / pixelsPerFrame));
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
      setPlayhead(Math.round(audio.currentTime * sq.fps));

      if (playing) {
        requestAnimationFrame(render);
      }
    }
    requestAnimationFrame(render);

    setPlayStopHandler({
      stop: () => {
        playing = false;
        audio.pause();
        setPlayhead(Math.round(audio.currentTime * sq.fps));
        setPlayStopHandler(null);
      },
    });

    audio.currentTime = playhead / sq.fps;
    audio.play();
  }

  function $insertRawMedia() {}

  function $insertFusionClip() {}

  const clipsAtCurrentTime = allClipsResolved
    .filter((clip) => clip.offset <= playhead && clip.offset + clip.duration > playhead)
    .sort((a, b) => a.track - b.track);

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
          <AspectRatioFrame aspectRatio={sq.height / sq.width}>
            <div className={c.viewerInner}>
              {clipsAtCurrentTime.map((clip) => {
                return (
                  <ViewerClip
                    key={clip.id}
                    id={clip.id}
                    playhead={playhead}
                    isPlaying={!!playStopHandler?.stop}
                  />
                );
              })}
            </div>
          </AspectRatioFrame>
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

interface ViewerClipProps {
  id: string;
  playhead: number;
  isPlaying: boolean;
}

export function ViewerClip({ id, playhead, isPlaying }: ViewerClipProps) {
  const [clip] = useResource('sequence-clip', id);
  const [sq] = useResource('sequence', `C:\\Code\\creative-toolkit\\sample\\test.sq`);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = (playhead - clip.offset + clip.trimStart) / sq.fps;
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying ? true : playhead, videoRef.current]);

  return (
    <video
      ref={videoRef}
      muted
      src={path.join(`C:\\Code\\creative-toolkit\\sample`, clip.source)}
    />
  );
}
