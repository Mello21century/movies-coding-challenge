import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt') };
    service = new AuthService(prisma as never, jwt as never);
  });

  describe('register', () => {
    it('rejects an existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      await expect(
        service.register({ email: 'a@b.c', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password, creates the user and returns a token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({ id: 5, email: 'a@b.c' });
      const res = await service.register({
        email: 'a@b.c',
        password: 'password123',
        name: 'A',
      });
      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 10);
      expect(res).toEqual({
        accessToken: 'signed.jwt',
        user: { id: 5, email: 'a@b.c' },
      });
    });

    it('defaults name to null when omitted', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({ id: 6, email: 'c@d.e' });
      await service.register({ email: 'c@d.e', password: 'password123' });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'c@d.e', passwordHash: 'hashed', name: null },
      });
    });
  });

  describe('login', () => {
    it('rejects unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.z', password: 'p' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@b.c',
        passwordHash: 'h',
      });
      bcryptMock.compare.mockResolvedValue(false as never);
      await expect(
        service.login({ email: 'a@b.c', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns a token for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@b.c',
        passwordHash: 'h',
      });
      bcryptMock.compare.mockResolvedValue(true as never);
      const res = await service.login({ email: 'a@b.c', password: 'good' });
      expect(res.accessToken).toBe('signed.jwt');
      expect(res.user).toEqual({ id: 1, email: 'a@b.c' });
    });
  });
});
