import { writeFile, remove, readFile } from 'fs-extra';
import { AppState } from '../shared/types';

const root = 'C:\\Code\\creative-toolkit\\sample'

export async function Project_Save(state: AppState) {
    writeFile(`${root}\\project.ctk`, JSON.stringify(state.project, null, 2));
}

export async function Project_Load(state: AppState) {
    const project = JSON.parse((await readFile(`${root}\\project.json`)).toString());
    state.project = project;
}
