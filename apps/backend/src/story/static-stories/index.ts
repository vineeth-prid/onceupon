import type { StoryOutputInput } from '@bookmagic/shared';
import { getDinosaurStory } from './dinosaur';
import { getToothFairyStory } from './tooth-fairy';
import { getMoonPrincessStory } from './moon-princess';
import { getPortugalsLegendStory } from './portugals-legend';
import { getArcticRescueStory } from './arctic-rescue';
import { getVroomVroomRaceStory } from './vroom-vroom-race';
import { getSuperDragonStory } from './super-dragon';
import { getLostFairyWingsStory } from './lost-fairy-wings';
import { getCosmicJourneyStory } from './cosmic-journey';
import { getZooAdventureBoyStory } from './zoo-adventure-boy';
import { getZooAdventureGirlStory } from './zoo-adventure-girl';
import { getTalkToAnimalsStory } from './talk-to-animals';
import { getFamilyParkAdventureStory } from './family-park-adventure';

const staticStoryBuilders: Record<string, (childName: string, childAge: number, childGender: string) => StoryOutputInput> = {
  // Legacy stories (backward compat for existing orders)
  'dinosaur': getDinosaurStory,
  'tooth-fairy': getToothFairyStory,
  'moon-princess': getMoonPrincessStory,
  // Pre-made book templates
  'portugals-legend': getPortugalsLegendStory,
  'arctic-rescue': getArcticRescueStory,
  'vroom-vroom-race': getVroomVroomRaceStory,
  'super-dragon': getSuperDragonStory,
  'lost-fairy-wings': getLostFairyWingsStory,
  'cosmic-journey': getCosmicJourneyStory,
  'zoo-adventure-boy': getZooAdventureBoyStory,
  'zoo-adventure-girl': getZooAdventureGirlStory,
  'talk-to-animals': getTalkToAnimalsStory,
  'family-park-adventure': getFamilyParkAdventureStory,
};

export function getStaticStory(theme: string, childName: string, childAge: number, childGender: string): StoryOutputInput | null {
  const builder = staticStoryBuilders[theme];
  if (!builder) return null;
  return builder(childName, childAge, childGender);
}
