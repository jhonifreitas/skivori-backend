import { ArgumentsHost } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';

import { NotFoundExceptionFilter } from './not-found.filter';

describe('NotFoundExceptionFilter', () => {
  let filter: NotFoundExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;

  const createHost = (): ArgumentsHost => {
    json = jest.fn();
    status = jest.fn(() => ({ json }));

    return {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/games/123' }),
      }),
    } as unknown as ArgumentsHost;
  };

  beforeEach(() => {
    filter = new NotFoundExceptionFilter();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should respond with 404 when the Prisma error code is P2025', () => {
    const host = createHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Not Found',
    });
  });

  it('should respond with 500 for other Prisma error codes', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const host = createHost();
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unexpected error',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Unexpected error',
    });
  });
});
