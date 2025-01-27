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
          entities: [],
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
