//Constatns for modules
export const ResourceType = { FILE: 'FILE', FOLDER: 'FOLDER', USER: 'USER', SETTING: 'SETTING', ROLE: 'ROLE' } as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];