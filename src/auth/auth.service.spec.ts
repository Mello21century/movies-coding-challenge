import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/client';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt') };
    config = { get: jest.fn().mockReturnValue('admin@kib.dev') };
    service = new AuthService(
      prisma as never,
      jwt as never,
      config as unknown as ConfigService,
    );
  });

  describe('register', () => {
    it('rejects an existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      await expect(
        service.register({ email: 'a@b.c', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a USER and returns a token with the role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 5,
        email: 'a@b.c',
        role: Role.USER,
      });
      const res = await service.register({
        email: 'a@b.c',
        password: 'password123',
        name: 'A',
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'a@b.c',
          passwordHash: 'hashed',
          name: 'A',
          role: Role.USER,
        },
      });
      expect(res).toEqual({
        accessToken: 'signed.jwt',
        user: { id: 5, email: 'a@b.c', role: Role.USER },
      });
    });

    it('assigns ADMIN when the email is in ADMIN_EMAILS', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'admin@kib.dev',
        role: Role.ADMIN,
      });
      await service.register({
        email: 'admin@kib.dev',
        password: 'password123',
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@kib.dev',
          passwordHash: 'hashed',
          name: null,
          role: Role.ADMIN,
        },
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
        role: Role.USER,
      });
      bcryptMock.compare.mockResolvedValue(false as never);
      await expect(
        service.login({ email: 'a@b.c', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns a token with the user role', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@b.c',
        passwordHash: 'h',
        role: Role.ADMIN,
      });
      bcryptMock.compare.mockResolvedValue(true as never);
      const res = await service.login({ email: 'a@b.c', password: 'good' });
      expect(res.user).toEqual({ id: 1, email: 'a@b.c', role: Role.ADMIN });
    });
  });
});
