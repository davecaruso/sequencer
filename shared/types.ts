export interface AppState {
  project: Project;
  fileTree: Record<string, FileTreeItem>;
  layout: any;
}

export interface Project {
  number: number;
  resources: Record<string, Resource>;
}

export interface FileTreeItem {
  name: string;
  fullPath: string;
  type: "directory" | "file";
  contents?: string[];
}

type Resource = Sequence;

export interface Sequence {
  type: "sequence";
  name: string;
  fusion: Record<string, SequenceFusionClip>;
  audioClips: Record<string, SequenceAudioClip>;
  audioDirty: boolean;
}

export interface SequenceFusionClip {
  source: string;
  offset: number;
  duration: number;
  dirty?: boolean;
}

export interface SequenceAudioClip {
  source: string;
  track: number;
  offset: number;
  trim_in: number;
  trim_out: number;
}