import * as Joi from 'joi'

export const validationConfigSchema = Joi.object({
  NODE_ENV: Joi.string().valid('local').required(),
  PORT: Joi.number().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET_KEY: Joi.string().required(),
  JWT_SECRET_EXPIRATION: Joi.string().required(),
  JWT_REFRESH_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_SECRET_EXPIRATION: Joi.string().required(),
})
