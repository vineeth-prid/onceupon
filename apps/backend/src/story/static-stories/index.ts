import type { StoryOutputInput } from '@bookmagic/shared';
import { getDinosaurStory } from './dinosaur';
import { getToothFairyStory } from './tooth-fairy';
import { getMoonPrincessStory } from './moon-princess';

const staticStoryBuilders: Record<string, (childName: string, childAge: number, childGender: string) => StoryOutputInput> = {
  'dinosaur': getDinosaurStory,
  'tooth-fairy': getToothFairyStory,
  'moon-princess': getMoonPrincessStory,
};

export function getStaticStory(theme: string, childName: string, childAge: number, childGender: string): StoryOutputInput | null {
  const builder = staticStoryBuilders[theme];
  if (!builder) return null;
  return builder(childName, childAge, childGender);
}
