import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: { findAll: jest.Mock; findOne: jest.Mock };

  beforeEach(() => {
    service = { findAll: jest.fn(), findOne: jest.fn() };
    controller = new MoviesController(service as unknown as MoviesService);
  });

  it('delegates findAll', () => {
    const query = { page: 1, limit: 10 };
    service.findAll.mockReturnValue('list');
    expect(controller.findAll(query)).toBe('list');
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates findOne', () => {
    service.findOne.mockReturnValue('one');
    expect(controller.findOne(5)).toBe('one');
    expect(service.findOne).toHaveBeenCalledWith(5);
  });
});
