import { RedisModule } from '@liaoliaots/nestjs-redis'
import { AuthModule } from '@modules/auth/auth.module'
import { User, UserModule } from '@modules/user'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerMiddleware } from '@shared/middleware'

import {
  configuration,
  IConfiguration,
  validationConfigSchema as validationSchema,
} from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<IConfiguration>) => {
        const appConfig = configService.get('env')
        const databaseConfig = configService.get('database', { infer: true })

        return {
          type: 'mysql',
          host: databaseConfig.host,
          port: databaseConfig.port,
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.name,
          synchronize: appConfig === 'local',
          entities: [User],
        }
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService<IConfiguration>) => {
        const redisConfig = configService.get('redis', { infer: true })

        return {
          config: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
          },
        }
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
