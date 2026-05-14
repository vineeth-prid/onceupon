import type { StoryOutputInput } from '@bookmagic/shared';
import { getDinosaurStory } from './dinosaur';
import { getToothFairyStory } from './tooth-fairy';
import { getMoonPrincessStory } from './moon-princess';
import { getDragonFriendStory } from './dragon-friend';
import { getFamilyParkAdventureStory } from './family-park-adventure';
import { getCountingFunStory } from './counting-fun';
import { getAlphabetsStory } from './alphabets';
import { getSpaceMissionStory } from './space-mission';
import { getZooVisitStory } from './zoo-visit';
import { getSpiderManDayStory } from './spider-man-day';
import { getSupermanDayStory } from './superman-day';
import { getBatmanDayStory } from './batman-day';

const staticStoryBuilders: Record<string, (childName: string, childAge: number, childGender: string) => StoryOutputInput> = {
  // Legacy stories (backward compat for existing orders)
  'dinosaur': getDinosaurStory,
  'tooth-fairy': getToothFairyStory,
  'moon-princess': getMoonPrincessStory,
  // Pre-made book templates
  'dragon-friend': getDragonFriendStory,
  'family-park-adventure': getFamilyParkAdventureStory,
  // New pre-made book templates
  'counting-fun': getCountingFunStory,
  'alphabets': getAlphabetsStory,
  'space-mission': getSpaceMissionStory,
  'zoo-visit': getZooVisitStory,
  'spider-man-day': getSpiderManDayStory,
  'superman-day': getSupermanDayStory,
  'batman-day': getBatmanDayStory,
};

export function getStaticStory(theme: string, childName: string, childAge: number, childGender: string): StoryOutputInput | null {
  const builder = staticStoryBuilders[theme];
  if (!builder) return null;
  return builder(childName, childAge, childGender);
}
