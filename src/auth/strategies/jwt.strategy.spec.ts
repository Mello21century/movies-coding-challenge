import { ConfigService } from '@nestjs/config';
import { Role } from '../../generated/prisma/client';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const config = { get: jest.fn().mockReturnValue('test-secret') };
    strategy = new JwtStrategy(config as unknown as ConfigService);
  });

  it('maps the payload to the auth user (with role)', () => {
    expect(
      strategy.validate({ sub: 7, email: 'a@b.c', role: Role.ADMIN }),
    ).toEqual({
      userId: 7,
      email: 'a@b.c',
      role: Role.ADMIN,
    });
  });

  it('falls back to a default secret when none configured', () => {
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const fallback = new JwtStrategy(config as unknown as ConfigService);
    expect(
      fallback.validate({ sub: 1, email: 'x@y.z', role: Role.USER }),
    ).toEqual({
      userId: 1,
      email: 'x@y.z',
      role: Role.USER,
    });
  });
});
