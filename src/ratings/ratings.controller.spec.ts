import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

describe('RatingsController', () => {
  let controller: RatingsController;
  let service: { rateMovie: jest.Mock };

  beforeEach(() => {
    service = { rateMovie: jest.fn().mockReturnValue('ok') };
    controller = new RatingsController(service as unknown as RatingsService);
  });

  it('delegates rate with the authenticated user id', () => {
    const user = { userId: 9, email: 'a@b.c' };
    expect(controller.rate(1, user, { value: 8 })).toBe('ok');
    expect(service.rateMovie).toHaveBeenCalledWith(1, 9, { value: 8 });
  });
});
