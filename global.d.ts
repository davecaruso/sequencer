import { PluginOption } from 'vite';
import { CTKGlobal } from './backend/preload';

declare global {
  const CTK: CTKGlobal;
  const __DEV__: boolean;
}

declare module 'csstype' {
  interface Properties {
    '--pixels-per-frame'?: number;
    '--track-height'?: number;
    '--playhead'?: number;
    '--offset'?: number;
    '--duration'?: number;
    '--track'?: number;
  }
}

declare module 'vite-react-jsx' {
  export default function reactJsx(): PluginOption;
}
