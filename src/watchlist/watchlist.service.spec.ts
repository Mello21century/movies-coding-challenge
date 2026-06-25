import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WatchlistType } from '../generated/prisma/client';
import { WatchlistService } from './watchlist.service';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let prisma: {
    movie: { findUnique: jest.Mock };
    watchlistItem: {
      upsert: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      movie: { findUnique: jest.fn() },
      watchlistItem: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new WatchlistService(prisma as never);
  });

  describe('add', () => {
    it('throws when movie missing', async () => {
      prisma.movie.findUnique.mockResolvedValue(null);
      await expect(
        service.add(1, { movieId: 2, type: WatchlistType.WATCHLIST }),
      ).rejects.toThrow(NotFoundException);
    });

    it('upserts the item', async () => {
      prisma.movie.findUnique.mockResolvedValue({ id: 2 });
      prisma.watchlistItem.upsert.mockResolvedValue({ id: 1 });
      const res = await service.add(1, {
        movieId: 2,
        type: WatchlistType.FAVORITE,
      });
      expect(res).toEqual({ id: 1 });
      expect(prisma.watchlistItem.upsert).toHaveBeenCalled();
    });
  });

  it('lists items for a user filtered by type', async () => {
    prisma.watchlistItem.findMany.mockResolvedValue([{ id: 1 }]);
    const res = await service.list(1, WatchlistType.WATCHLIST);
    expect(res).toEqual([{ id: 1 }]);
  });

  it('lists all items when no type filter', async () => {
    prisma.watchlistItem.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = await service.list(1);
    expect(res).toHaveLength(2);
    expect(prisma.watchlistItem.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: { createdAt: 'desc' },
      include: { movie: true },
    });
  });

  describe('remove', () => {
    it('throws when item missing', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue(null);
      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('forbids removing another user item', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('deletes own item', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prisma.watchlistItem.delete.mockResolvedValue({});
      await expect(service.remove(1, 1)).resolves.toEqual({
        deleted: true,
        id: 1,
      });
    });
  });
});
