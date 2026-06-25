import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: jest.Mock; login: jest.Mock };

  beforeEach(() => {
    service = {
      register: jest.fn().mockReturnValue('registered'),
      login: jest.fn().mockReturnValue('loggedin'),
    };
    controller = new AuthController(service as unknown as AuthService);
  });

  it('delegates register', () => {
    const dto = { email: 'a@b.c', password: 'password123' };
    expect(controller.register(dto)).toBe('registered');
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login', () => {
    const dto = { email: 'a@b.c', password: 'password123' };
    expect(controller.login(dto)).toBe('loggedin');
    expect(service.login).toHaveBeenCalledWith(dto);
  });
});
