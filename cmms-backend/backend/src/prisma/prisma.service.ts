import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/** Neon serverless databases go idle between requests.
 *  This service retries both the initial connection AND
 *  any query that fails mid-request with P1001 (unreachable host). */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [],
    });

    // Middleware: retry any query that hits a P1001 "can't reach database" error.
    // Neon autosuspend can drop the connection between requests even after a
    // successful $connect(), so we need per-query resilience as well.
    this.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => {
      const MAX_QUERY_RETRIES = 3;
      let lastError: unknown;

      for (let attempt = 1; attempt <= MAX_QUERY_RETRIES; attempt++) {
        try {
          return await next(params);
        } catch (error: unknown) {
          lastError = error;

          const isConnectionError =
            error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001';

          if (!isConnectionError || attempt === MAX_QUERY_RETRIES) {
            throw error;
          }

          const delay = attempt * 1500; // 1.5 s, 3 s, 4.5 s
          this.logger.warn(
            `Query P1001 on ${params.model}.${params.action} (attempt ${attempt}/${MAX_QUERY_RETRIES}). Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Reconnect before the next attempt
          try {
            await this.$connect();
          } catch {
            // ignore reconnect errors; next() will surface them if still failing
          }
        }
      }

      throw lastError;
    });
  }

  async onModuleInit() {
    const maxRetries = 5;
    let delay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Connecting to database (Attempt ${attempt}/${maxRetries})...`);
        await this.$connect();
        this.logger.log('Successfully connected to database.');
        return;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Database connection failed on attempt ${attempt}: ${errMsg}`);
        if (attempt === maxRetries) {
          throw error;
        }
        this.logger.log(`Retrying database connection in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 10000);
      }
    }
  }
}