import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController(new AppService());
  });

  it('returns the greeting', () => {
    expect(controller.getHello()).toBe('Hello World!');
  });
});
