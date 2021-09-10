// Creative Toolkit - by dave caruso
// State and Action Dispatcher

import * as ACTIONS from './actions/_all';
import { addResource, fetchResource, updateResource } from './resource';

export interface ActionEvent {
  fetchResource: typeof fetchResource;
  updateResource: typeof updateResource;
  addResource: typeof addResource;
}

export type ActionObject = typeof ACTIONS;

export type ActionName = `${string}_${string}`;

export type ActionFunction = (event: ActionEvent, ...args: never[]) => Promise<unknown> | unknown;
export type ActionParameters<F extends ActionFunction> = F extends (
  event: ActionEvent,
  ...args: infer args
) => Promise<unknown>
  ? args extends unknown[]
    ? [...args]
    : [args[0]]
  : [];
export type ActionReturn<F extends ActionFunction> = F extends (
  event: ActionEvent,
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : void;

export type GetGroup<S> = S extends `${infer A}_${string}` ? A : never;
export type GetAction<S> = S extends `${string}_${infer A}` ? A : never;

// make function always async and remove the first arg
export type MapToFrontendAction<F extends ActionFunction> = F extends (
  event: ActionEvent,
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

export async function dispatch<A extends keyof ActionObject>(
  action: A,
  args: ActionParameters<ActionObject[A]>
): Promise<ActionReturn<ActionObject[A]>> {
  const event: ActionEvent = {
    fetchResource,
    updateResource,
    addResource,
  };

  console.log(args);

  const start = Date.now();

  const actionFunction = ACTIONS[action] as ActionObject[A];

  // @ts-expect-error A spread argument must either have a tuple type or be passed to a rest parameter.
  const x = (await actionFunction(event, ...args)) as ActionReturn<ActionObject[A]>;

  const end = Date.now();
  console.log(`${action} took ${end - start}ms`);

  return x;
}
