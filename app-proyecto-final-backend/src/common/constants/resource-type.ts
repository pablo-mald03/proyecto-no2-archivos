//Constatns for modules
export const ResourceType = { FILE: 'FILE', FOLDER: 'FOLDER', USER: 'USER', SETTING: 'SETTING' } as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];