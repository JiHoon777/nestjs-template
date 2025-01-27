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

export interface IConfiguration {
  port: number
  env: string
  database: DatabaseConfig
  jwt: JwtConfig
}
