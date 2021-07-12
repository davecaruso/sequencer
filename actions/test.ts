import { AppState } from '../shared/types';

export function helloWorldTestAction(state: AppState) {
  state.project.number++;
}
