import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class NotFoundExceptionFilter implements ExceptionFilter {
  public catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.code === 'P2025') {
      return response
        .status(404)
        .json({ statusCode: 404, message: 'Not Found' });
    }

    console.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exception.message,
    });

    return response
      .status(500)
      .json({ statusCode: 500, message: exception.message });
  }
}
