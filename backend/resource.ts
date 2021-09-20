import * as resourceTypes from './resources/_all';

const subscriptions: Map<string, string[]> = new Map();

export interface Resource {
  id: string;
  type: string;
}

export interface ChildResource<Parent extends Resource> extends Resource {
  parent: Parent;
}

export interface ResourceEvent<Type extends Resource> {
  loadChild(resource: Omit<ChildResource<Type>, 'parent'>): void;
  getChild<Child extends ChildResource<Type>>(id: string): Child;
}

export interface CreateResourceFileType<Type extends Resource, NoID = Omit<Type, 'id'>> {
  type: Type['type'];
  parent?: string;
  ui: any;
  load?: (filepath: string, event: ResourceEvent<Type>) => Promise<NoID>;
  save?: (filepath: string, resource: NoID, event: ResourceEvent<Type>) => Promise<void>;
  default?: () => Promise<NoID>;
}

type RT = typeof resourceTypes;
export type ResourceTypes = {
  [key in keyof RT as RT[key] extends CreateResourceFileType<infer Type>
    ? Type['type']
    : never]: RT[key] extends CreateResourceFileType<infer Type> ? Type : never;
};

export type ResourceType = keyof ResourceTypes;

const resources = new Map<string, Resource>();
const childResources = new Map<string, string[]>();

export function createResourceType<Type extends Resource>(options: CreateResourceFileType<Type>) {
  return options;
}

export async function fetchResource<T extends ResourceType>(
  type: T,
  id: string
): Promise<ResourceTypes[T]> {
  const key = `${type}://${id}`;
  const existing = resources.get(key) as ResourceTypes[T] | undefined;
  if (existing) {
    return existing;
  }
  const resourceMeta = Object.values(resourceTypes).find((meta) => meta && meta.type === type);
  if (!resourceMeta) {
    throw new Error(`Unknown resource type ${type}`);
  }
  // TODO: Un-fuck this shit so there aren't more type errors than nukes in the us military
  if (resourceMeta.load) {
    const resource = await resourceMeta.load(id, {
      loadChild: (child) => {
        // TODO: Track child resources
        resources.set(`${child.type}://${child.id}`, child);
      },
      getChild: (childId) => {
        return resources.get(`${'sequence-clip'}://${childId}`) as any;
      },
    });
    const withId = { ...resource, id, type };
    resources.set(key, withId);
    return withId as any;
  }
  throw new Error(`Resource type ${type} is not loaded and cannot be fetched`);
}

export async function updateResource<T extends ResourceType>(
  type: T,
  id: string,
  update: (resource: ResourceTypes[T]) => Promise<ResourceTypes[T]> | ResourceTypes[T]
): Promise<ResourceTypes[T]> {
  const key = `${type}://${id}`;
  const existing = resources.get(key) as ResourceTypes[T] | undefined;
  if (!existing) {
    throw new Error(`Unknown resource type ${type}`);
  }
  const updated = await update(existing);
  resources.set(key, updated as any);
  const windows = subscriptions.get(key);
  if (windows) {
    windows.forEach((window) => {
      fetchResource('window', window).then((w) => {
        const trimmed = { ...update };
        if ('__window' in trimmed) delete (trimmed as Record<string, string>).__window;
        w.__window!.webContents.send('resource', { ...updated, __window: undefined });
      });
    });
  }
  return updated;
}

export function subscribeResource<T extends ResourceType>(type: T, id: string, windowId: string) {
  const key = `${type}://${id}`;
  const arr = subscriptions.get(key) || [];
  arr.push(windowId);
  subscriptions.set(key, arr);
}

export function unsubscribeResource<T extends ResourceType>(type: T, id: string, windowId: string) {
  const key = `${type}://${id}`;
  const arr = subscriptions.get(key) || [];
  const index = arr.indexOf(windowId);
  if (index >= 0) {
    arr.splice(index, 1);
  }
  if (arr.length === 0) {
    subscriptions.delete(key);
  } else {
    subscriptions.set(key, arr);
  }
}

export function addResource<T extends ResourceType>(resource: ResourceTypes[T]) {
  const key = `${resource.type}://${resource.id}`;
  resources.set(key, resource as any);
}
