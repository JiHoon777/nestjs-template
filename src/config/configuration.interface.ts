interface DatabaseConfig {
  host: string
  name: string
  port: number
  username: string
  password: string
}

interface JwtConfig {
  secretKey: string
  secretExpiration: string
  refreshSecretKey: string
  refreshSecretExpiration: string
}

interface RedisConfig {
  host: string
  port: number
  password: string
}

export interface IConfiguration {
  port: number
  env: string
  database: DatabaseConfig
  jwt: JwtConfig
  redis: RedisConfig
}
