import path from 'path';
import { useEffect, useRef } from 'react';
import { useResource } from '../../../frontend-state';
import { ViewerBaseProps } from './ClipViewer';

export function MediaViewer({ id, playhead, isPlaying }: ViewerBaseProps) {
  const clip = useResource('sequence-clip', id);
  const sq = useResource('sequence', `C:\\Code\\creative-toolkit\\sample\\test.sq`);

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoRef.current]);

  return (
    <video
      ref={videoRef}
      muted
      // TODO: Remove hardcoded
      src={path.join(`C:\\Code\\creative-toolkit\\sample`, clip.source)}
    />
  );
}
