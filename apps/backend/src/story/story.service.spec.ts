import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StoryService } from './story.service';

// Mock the GoogleGenAI module
jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
    __mockGenerateContent: mockGenerateContent,
  };
});

const { __mockGenerateContent: mockGenerateContent } = jest.requireMock('@google/genai');

const LAYOUTS = [
  'chapter-title', 'full-bleed-text-bottom', 'image-left-text-right', 'full-bleed-text-center',
  'image-right-text-left', 'full-bleed-text-bottom', 'text-heavy-vignette', 'full-bleed-text-top',
  'image-left-text-right', 'full-bleed-text-bottom', 'full-bleed-text-center', 'dramatic-image-only',
  'image-right-text-left', 'full-bleed-text-bottom', 'text-heavy-vignette', 'full-bleed-text-center',
];

const validStoryResponse = {
  title: 'The Tooth Fairy Adventure',
  pages: Array.from({ length: 16 }, (_, i) => ({
    pageNumber: i + 1,
    text: `Page ${i + 1} text`,
    imagePrompt: `Scene for page ${i + 1}`,
    sceneDescription: `Description for page ${i + 1}`,
    layout: LAYOUTS[i],
    imageComposition: `Composition hint for page ${i + 1}`,
  })),
};

describe('StoryService', () => {
  let service: StoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoryService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<StoryService>(StoryService);
    jest.clearAllMocks();
  });

  it('should generate a valid 16-page story', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(validStoryResponse),
    });

    const result = await service.generateStory('Aarav', 5, 'boy', 'tooth-fairy');

    expect(result.title).toBe('The Tooth Fairy Adventure');
    expect(result.pages).toHaveLength(16);
    expect(result.pages[0].pageNumber).toBe(1);
  });

  it('should call Gemini with correct model', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(validStoryResponse),
    });

    await service.generateStory('Priya', 4, 'girl', 'dinosaur');

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
      }),
    );
  });

  it('should retry on malformed JSON and succeed', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'not json' })
      .mockResolvedValueOnce({ text: JSON.stringify(validStoryResponse) });

    const result = await service.generateStory('Aarav', 5, 'boy', 'moon-princess');
    expect(result.pages).toHaveLength(16);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('should throw after 3 failed attempts', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'invalid' });

    await expect(
      service.generateStory('Aarav', 5, 'boy', 'tooth-fairy'),
    ).rejects.toThrow('Story generation failed after 3 attempts');

    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it('should include child name in the prompt', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(validStoryResponse),
    });

    await service.generateStory('Luna', 3, 'girl', 'tooth-fairy');

    const call = mockGenerateContent.mock.calls[0][0];
    const promptText = call.contents[0].parts[0].text;
    expect(promptText).toContain('Luna');
  });
});
