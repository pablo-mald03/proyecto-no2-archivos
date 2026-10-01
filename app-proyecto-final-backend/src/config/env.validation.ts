import * as Joi from 'joi';

//Environment variables for the API
export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3000),
    MONGODB_URI: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).required(),
    JWT_EXPIRES_IN_SECONDS: Joi.number().integer().positive().default(900),
    COOKIE_NAME: Joi.string().default('access_token'),
    CORS_ORIGIN: Joi.string().required(),
    DEFAULT_QUOTA_BYTES: Joi.number().integer().positive().default(1073741824),
    ARGON2_MEMORY_KIB: Joi.number().integer().min(8192).default(19456),
    ARGON2_TIME_COST: Joi.number().integer().min(1).default(2),
    ARGON2_PARALLELISM: Joi.number().integer().min(1).default(1),
});