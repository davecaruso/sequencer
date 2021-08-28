// Creative Toolkit - by dave caruso
// State and Action Dispatcher

import { createDraft, Draft, finishDraft } from 'immer';
import { AppState, ChildResource, Resource } from '../shared/types';
import * as ACTIONS from './actions/_all';
import { sendUpdateToAllWindows } from './window';

export type ActionObject = typeof ACTIONS;

export type ActionName = `${string}_${string}`;

export type ActionFunction = (state: AppState, ...args: never[]) => Promise<unknown> | unknown;
export type ActionParameters<F extends ActionFunction> = F extends (
  state: AppState,
  ...args: infer args
) => Promise<unknown>
  ? args extends unknown[]
    ? [...args]
    : [args[0]]
  : [];

export type GetGroup<S> = S extends `${infer A}_${string}` ? A : never;
export type GetAction<S> = S extends `${string}_${infer A}` ? A : never;

// make function always async and remove the first arg
export type MapToFrontendAction<F extends ActionFunction> = F extends (
  state: AppState,
  ...args: infer A
) => infer R
  ? (...args: A) => R extends Promise<unknown> ? R : Promise<R>
  : (...args: never[]) => Promise<unknown>;

export type FrontendActionObject = {
  [K in keyof ActionObject as GetGroup<K>]: InnerFrontendActionObject<GetGroup<K>>;
};

type InnerFrontendActionObject<Group extends string> = {
  [K in keyof ActionObject as K extends `${Group}_${string}`
    ? GetAction<K>
    : never]: K extends `${Group}_${string}` ? MapToFrontendAction<ActionObject[K]> : never;
};

/** Application state */
const state: AppState = {
  resources: {},
  config: {
    path: {},
  },
};

// Not using immer due to reference bugs
let draft: Draft<AppState> | null = null;
export async function updateState(cb: ActionFunction) {
  if (draft) {
    return cb(draft);
  }
  draft = state;
  // draft = createDraft(state);
  const result = await cb(draft);
  // const newState = finishDraft(draft);
  // state = newState;
  draft = null;
  sendUpdateToAllWindows();
  return result;
}

/* Runs an action by id and returns a promise with the result */
export async function dispatch<A extends keyof ActionObject>(
  actionId: A,
  options: ActionParameters<ActionObject[A]>
) {
  const start = Date.now();
  try {
    const result = await updateState(async (draft) => {
      const action = ACTIONS[actionId] as typeof ACTIONS[A];
      // @ts-expect-error Spread does not work because the type is too broad
      return await action(draft, ...options);
    });
    const end = Date.now();
    console.log(`${actionId} took ${end - start}ms`);
    return result;
  } catch (error) {
    const end = Date.now();
    console.log(`${actionId} failed; took ${end - start}ms`);
    throw error;
  }
}

async function traverseAndAdd(obj: Record<never, unknown>, parent: Resource) {
  await Promise.all(
    Object.entries(obj).map(async ([key, value]) => {
      if (value && typeof value === 'object') {
        const object = value as Record<string, unknown>;
        if (object.id === key && object.type) {
          return addResource({
            ...value,
            parent: parent.id,
          } as ChildResource);
        } else {
          return traverseAndAdd(value, parent);
        }
      }
    })
  );
}

export async function addResource<T extends Resource>(resource: T) {
  await updateState((state) => {
    state.resources[resource.id] = resource;
    traverseAndAdd(resource, resource);
  });
}

export async function removeResource(resource: Resource) {
  await updateState((state) => {
    delete state.resources[resource.id];
  });
}

export function getState(): AppState {
  return state;
}
