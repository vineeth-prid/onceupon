import type { StoryOutputInput } from '@bookmagic/shared';
import { getDinosaurStory } from './dinosaur';
import { getToothFairyStory } from './tooth-fairy';
import { getMoonPrincessStory } from './moon-princess';
import { getDragonFriendStory } from './dragon-friend';
import { getFamilyParkAdventureStory } from './family-park-adventure';

const staticStoryBuilders: Record<string, (childName: string, childAge: number, childGender: string) => StoryOutputInput> = {
  // Legacy stories (backward compat for existing orders)
  'dinosaur': getDinosaurStory,
  'tooth-fairy': getToothFairyStory,
  'moon-princess': getMoonPrincessStory,
  // Pre-made book templates
  'dragon-friend': getDragonFriendStory,
  'family-park-adventure': getFamilyParkAdventureStory,
};

export function getStaticStory(theme: string, childName: string, childAge: number, childGender: string): StoryOutputInput | null {
  const builder = staticStoryBuilders[theme];
  if (!builder) return null;
  return builder(childName, childAge, childGender);
}
