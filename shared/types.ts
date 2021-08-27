export interface AppState {
  resources: Record<string, Resource>;
  config: CTKConfig;
}

export interface CTKConfig {
  path: {
    /** Path to where ffmpeg.exe is located. Empty string or unset to use auto-detection */
    ffmpeg?: string;
    /** Path to where melt.exe is located. Empty string or unset to use auto-detection */
    melt?: string;
    /** Path to where fusion.exe is located. Empty string or unset to use auto-detection */
    fusion?: string;
  };
}

export interface Resource {
  id: string;
  type: string;
}

export interface ChildResource extends Resource {
  parent: string;
}

/* A resource that exists as a file on disk. */
export interface DiskResource extends Resource {
  path: string;
}

export interface Sequence extends DiskResource {
  type: 'sequence';
  description: string;
  clips: Record<string, SequenceClip>;
  lastAudioRenderTime: number;
}

export interface SequenceClip extends ChildResource {
  type: 'sequence-clip';
  isMedia: boolean;
  source: string;
  description: string;
  // TODO: multitrack support. this interface just shows a single track for now.
  track: number;
  offset: number;
  trimStart: number;
  trimEnd: number;
  isDisabled: boolean;
  trackType: 'audio' | 'video' | 'data';
  lastExternalRenderTime: number;
}
