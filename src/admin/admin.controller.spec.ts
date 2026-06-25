import { AdminController } from './admin.controller';
import { SyncService } from '../tmdb/sync.service';

describe('AdminController', () => {
  let controller: AdminController;
  let sync: { syncAll: jest.Mock };

  beforeEach(() => {
    sync = { syncAll: jest.fn().mockResolvedValue(undefined) };
    controller = new AdminController(sync as unknown as SyncService);
  });

  it('triggers a full sync', async () => {
    await expect(controller.triggerSync()).resolves.toEqual({
      status: 'sync completed',
    });
    expect(sync.syncAll).toHaveBeenCalledTimes(1);
  });
});
