import { writeFile, readFile } from 'fs-extra';
import { AppState } from '../shared/types';

export async function Project_Save(state: AppState) {
    writeFile(state.projectFilepath, JSON.stringify(state.project, null, 2));
}

export async function Project_Load(state: AppState) {
    const project = JSON.parse((await readFile(state.projectFilepath)).toString());
    state.project = project;
}
