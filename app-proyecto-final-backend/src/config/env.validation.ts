import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3000),
    MONGODB_URI: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).required(),
    JWT_EXPIRES_IN_SECONDS: Joi.number().integer().positive().default(900),
    COOKIE_NAME: Joi.string().default('access_token'),
    CORS_ORIGIN: Joi.string().required(),
    DEFAULT_QUOTA_BYTES: Joi.number().integer().positive().default(1073741824),
});