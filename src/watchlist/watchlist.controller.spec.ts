import { WatchlistType } from '../generated/prisma/client';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

describe('WatchlistController', () => {
  let controller: WatchlistController;
  let service: { add: jest.Mock; list: jest.Mock; remove: jest.Mock };
  const user = { userId: 3, email: 'a@b.c' };

  beforeEach(() => {
    service = {
      add: jest.fn().mockReturnValue('added'),
      list: jest.fn().mockReturnValue('listed'),
      remove: jest.fn().mockReturnValue('removed'),
    };
    controller = new WatchlistController(
      service as unknown as WatchlistService,
    );
  });

  it('delegates add with user id', () => {
    const dto = { movieId: 1, type: WatchlistType.WATCHLIST };
    expect(controller.add(user, dto)).toBe('added');
    expect(service.add).toHaveBeenCalledWith(3, dto);
  });

  it('delegates list with user id and type', () => {
    expect(controller.list(user, { type: WatchlistType.FAVORITE })).toBe(
      'listed',
    );
    expect(service.list).toHaveBeenCalledWith(3, WatchlistType.FAVORITE);
  });

  it('delegates remove with user id', () => {
    expect(controller.remove(user, 5)).toBe('removed');
    expect(service.remove).toHaveBeenCalledWith(5, 3);
  });
});
