import { useEffect, useRef } from 'react';

/** Returns a handle to an audio element, which is cleared once the hook is unloaded. */
export function useAudioTag(src: string): HTMLAudioElement {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
  }

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    document.body.appendChild(audioRef.current);
    audioRef.current.src = src;
    audioRef.current.preload = 'auto';
    audioRef.current.load();
    return () => {
      audioRef.current!.remove();
      audioRef.current = null;
    };
  }, [src]);

  return audioRef.current;
}
