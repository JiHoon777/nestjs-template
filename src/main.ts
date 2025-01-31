import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AllExceptionsFilter } from '@shared/filters'
import { TransformInterceptor } from '@shared/interceptors'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose'])
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
  })

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
