//Principal field limit constants for 
export const FieldLimits = {
    USERNAME: { min: 3, max: 60 },
    EMAIL: { max: 254 },
    PERSON_NAME: { min: 1, max: 60 },
    PASSWORD: { min: 8, max: 128 },
    ROLE_CODE: { min: 2, max: 50 },
    ROLE_NAME: { min: 3, max: 50 },
    PERMISSION_CODE: { min: 2, max: 60 },
    PERMISSION_MODULE: { min: 2, max: 60 },
    PERMISSION_NAME: { min: 3, max: 150 },
    DESCRIPTION: { max: 255 },
    RESOURCE_NAME: { min: 1, max: 255 },
    ACCESS: { max: 40 },
    ACTOR_USERNAME: { min: 3, max: 60 },
    ACTOR_EMAIL: { min: 5, max: 254 },
    TARGET_EMAIL: { min: 5, max: 254 },

} as const;