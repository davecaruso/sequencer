import { BrowserWindow } from "electron";

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
}

export interface SequenceFusionClip {
  source: string;
  trim_in: number;
  trim_out: number;
  duration: number;
}

export interface SequenceAudioClip {
  source: string;
  track: number;
  trim_in: number;
  trim_out: number;
  duration: number;
}