//Constatns for modules
export const ResourceType = { FILE: 'FILE', FOLDER: 'FOLDER' } as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];