import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

/**
 * ADR-0005: NestJS on the Fastify adapter. Roughly 45k vs 28k req/s against
 * Express for a one-line change, and @nestjs/swagger works with both.
 *
 * ADR-0033: single domain, no CORS. The API is served under /api behind Caddy,
 * same origin as the static frontend bundle, so no CORS configuration exists —
 * an absent CORS policy cannot be misconfigured.
 */
export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: ['error', 'warn'] },
  );

  app.setGlobalPrefix('api');

  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Engipro ERP API')
      .setDescription('Abak/Engipro ERP. Contracts are generated from Zod (ADR-0010).')
      .setVersion('0.0.0')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, doc);

  return app;
}

/* c8 ignore start -- bootstrap path, exercised by the smoke test via createApp */
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '')) {
  const app = await createApp();
  // 0.0.0.0 because the process runs in a container (ADR-0032); binding to
  // localhost would be unreachable from outside it.
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
}
/* c8 ignore stop */
