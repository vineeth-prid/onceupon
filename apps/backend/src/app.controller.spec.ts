import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('health check', () => {
    it('should return status ok', () => {
      const result = controller.healthCheck();
      expect(result).toEqual({ status: 'ok' });
    });
  });
});
