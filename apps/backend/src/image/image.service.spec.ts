import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImageService } from './image.service';
import { IMAGE_GEN_CONFIG, NEGATIVE_PROMPT, STYLE_SUFFIX } from '@bookmagic/shared';

// Mock replicate
jest.mock('replicate', () => {
  const mockRun = jest.fn();
  return jest.fn().mockImplementation(() => ({
    run: mockRun,
  }));
});

// Mock fs operations
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

// Mock fetch for image download
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
}) as any;

const Replicate = require('replicate');

describe('ImageService', () => {
  let service: ImageService;
  let mockRun: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-replicate-token'),
          },
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    mockRun = Replicate.mock.results[Replicate.mock.results.length - 1].value.run;
    jest.clearAllMocks();
    mockRun.mockResolvedValue('https://replicate.delivery/output/image.png');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    });
  });

  describe('generateReferenceSheet', () => {
    it('should call replicate with correct model and config', async () => {
      await service.generateReferenceSheet('https://example.com/photo.jpg', 'order-1');

      expect(mockRun).toHaveBeenCalledWith(
        IMAGE_GEN_CONFIG.model,
        expect.objectContaining({
          input: expect.objectContaining({
            main_face_image: 'https://example.com/photo.jpg',
            id_weight: IMAGE_GEN_CONFIG.idWeight,
            start_step: IMAGE_GEN_CONFIG.startStep,
            num_steps: IMAGE_GEN_CONFIG.numSteps,
            negative_prompt: NEGATIVE_PROMPT,
          }),
        }),
      );
    });

    it('should return local upload URL', async () => {
      const result = await service.generateReferenceSheet('https://example.com/photo.jpg', 'order-1');
      expect(result).toBe('/uploads/ref-order-1.png');
    });
  });

  describe('generatePageImage', () => {
    it('should append STYLE_SUFFIX if not already present', async () => {
      await service.generatePageImage(
        'https://example.com/photo.jpg',
        'A child in a forest',
        'order-1',
        1,
      );

      const callInput = mockRun.mock.calls[0][1].input;
      expect(callInput.prompt).toContain(STYLE_SUFFIX);
    });

    it('should not double-append STYLE_SUFFIX', async () => {
      const promptWithSuffix = `A child in a forest, ${STYLE_SUFFIX}`;
      await service.generatePageImage(
        'https://example.com/photo.jpg',
        promptWithSuffix,
        'order-1',
        1,
      );

      const callInput = mockRun.mock.calls[0][1].input;
      const occurrences = callInput.prompt.split(STYLE_SUFFIX).length - 1;
      expect(occurrences).toBe(1);
    });

    it('should save with correct filename pattern', async () => {
      const result = await service.generatePageImage(
        'https://example.com/photo.jpg',
        'prompt',
        'order-1',
        5,
      );
      expect(result).toBe('/uploads/order-1-page-5.png');
    });
  });
});
