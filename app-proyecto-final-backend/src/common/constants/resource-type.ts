//Constatns for modules
export const ResourceType = { FILE: 'FILE', FOLDER: 'FOLDER', USER: 'USER' } as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];