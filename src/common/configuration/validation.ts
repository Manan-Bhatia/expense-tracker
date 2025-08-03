import Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

export const validateEnvironmentVariables = (config: Record<string, any>) => {
  const { error, value } = validationSchema.validate(config, {
    abortEarly: true,
    allowUnknown: true,
  });
  if (error) {
    throw new Error(`Environment variable validation error: ${error.message}`);
  }
  return value;
};
