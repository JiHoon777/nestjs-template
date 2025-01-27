import type { IConfiguration } from './configuration.interface'

export const configuration = (): IConfiguration => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
    secretExpiration: process.env.JWT_SECRET_EXPIRATION,
    refreshSecretKey: process.env.JWT_REFRESH_SECRET_KEY,
    refreshSecretExpiration: process.env.JWT_REFRESH_SECRET_EXPIRATION,
  },
})
