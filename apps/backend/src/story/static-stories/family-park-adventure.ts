import type { StoryOutputInput } from '@bookmagic/shared';

/**
 * Family Park Adventure — A 3-member family story (child + mother + father).
 * Image prompts are crafted with explicit gender, age, and height descriptions
 * to ensure PhotoMaker + Easel face swap generates correct characters.
 *
 * Each imagePrompt follows these rules:
 * - "the child" = small girl/boy child (age 5-ish, short)
 * - "the mother" = tall adult woman (clearly feminine, taller than child)
 * - "the father" = tall adult man (clearly masculine, tallest)
 * - Height difference is always emphasized
 * - Gender words (man/woman/girl/boy) are explicit in every prompt
 */
export function getFamilyParkAdventureStory(
  childName: string,
  childAge: number,
  childGender: string,
): StoryOutputInput {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';
  const Pronoun = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);
  const genderWord = childGender === 'girl' ? 'girl' : childGender === 'boy' ? 'boy' : 'child';

  return {
    title: `${childName}'s Magical Family Day`,
    pages: [
      {
        pageNumber: 1,
        text: `${childName}'s Magical Family Day`,
        imagePrompt: 'A decorative storybook title page with a beautiful park entrance arch covered in colorful flowers and butterflies, golden sunlight streaming through, a winding path leading into a lush magical garden, warm and inviting atmosphere, whimsical storybook border design',
        sceneDescription: 'Title page with park-themed decorations',
        layout: 'chapter-title' as const,
        imageComposition: 'chapter-title: decorative border with flowers and park elements',
        charactersInScene: ['MAIN_CHILD'],
      },
      {
        pageNumber: 2,
        text: `It was a beautiful sunny morning. ${childName} woke up to the smell of pancakes. "Today is our family adventure day!" ${possessive} father announced with a big smile.`,
        imagePrompt: `A bright cozy kitchen filled with warm morning sunlight streaming through the window, a tall adult man (the father) with broad shoulders and masculine features standing at the stove flipping golden pancakes, a tall adult woman (the mother) with feminine features pouring orange juice at the table, a small ${genderWord} child sitting at the table looking excited, the father is much taller than the child, warm family breakfast scene, kitchen has colorful decorations and plants`,
        sceneDescription: `${childName}'s family prepares for an adventure day`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep main subjects in upper two-thirds, simpler background at bottom for text',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
      {
        pageNumber: 3,
        text: `The whole family walked to the Enchanted Park. ${childName} held ${possessive} mother's hand while ${possessive} father carried a big picnic basket. The park gates sparkled with golden light!`,
        imagePrompt: `A magnificent park entrance with tall ornate golden gates covered in climbing roses and ivy, a winding cobblestone path leading inside, a tall adult man (the father, much taller than the child) carrying a woven picnic basket in one hand, a tall adult woman (the mother) walking beside them holding the hand of a small ${genderWord} child who is much shorter than both adults, the man is the tallest figure, beautiful morning sunlight, lush green trees and colorful flowers on both sides of the path`,
        sceneDescription: 'The family arrives at the Enchanted Park',
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep main subjects in upper two-thirds, simpler background at bottom',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
      {
        pageNumber: 4,
        text: `Inside the park, they discovered a garden where the flowers could sing! Tiny roses hummed a sweet melody, and sunflowers swayed like dancers. ${childName} clapped ${possessive} hands with joy.`,
        imagePrompt: `A magical flower garden with oversized colorful singing roses and tall sunflowers swaying musically, visible musical notes and sparkles floating in the air, glowing pollen drifting like golden fireflies, a small ${genderWord} child clapping excitedly in the center of the garden, lush green hedges forming a circular clearing, warm golden sunlight filtering through flower petals, enchanting and whimsical atmosphere`,
        sceneDescription: `${childName} discovers the singing flower garden`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place subject on the LEFT side, leave right side as soft background',
        charactersInScene: ['MAIN_CHILD'],
      },
      {
        pageNumber: 5,
        text: `"Look at this!" ${possessive} father said, kneeling down beside a tiny pond. Inside, golden fish were jumping and making little splashes that turned into rainbows! ${childName} and ${possessive} mother watched in amazement.`,
        imagePrompt: `A small enchanted pond with crystal clear water and golden fish leaping out creating tiny rainbow splashes in the air, a tall adult man (the father) kneeling down at the water's edge pointing at the fish with wonder, a tall adult woman (the mother) standing next to them with one hand on the child's shoulder, a small ${genderWord} child crouching by the pond looking amazed, the adults are clearly taller than the child even when kneeling, lily pads with glowing flowers on the water, lush greenery surrounding the pond, magical sparkles in the air`,
        sceneDescription: `The family discovers a magical pond with rainbow fish`,
        layout: 'full-bleed-text-top' as const,
        imageComposition: 'keep main subjects in lower two-thirds, simpler background at top',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
      {
        pageNumber: 6,
        text: `They followed a winding trail through a tunnel of cherry blossom trees. Pink petals floated down like snow. ${childName} tried to catch them, spinning and laughing.`,
        imagePrompt: `A breathtaking tunnel of cherry blossom trees in full bloom with thousands of soft pink petals floating through the air like gentle snow, a small ${genderWord} child spinning with arms outstretched trying to catch petals, joyful laughter expression, dappled pink and gold sunlight filtering through the blossoms, petals scattered on the cobblestone path, dreamy magical atmosphere with soft pink glow everywhere`,
        sceneDescription: `${childName} plays in the cherry blossom tunnel`,
        layout: 'full-bleed-text-center' as const,
        imageComposition: 'place subjects at edges/sides, keep center softer for text readability',
        charactersInScene: ['MAIN_CHILD'],
      },
      {
        pageNumber: 7,
        text: `Deep in the park, they found a playground made entirely of clouds! Fluffy slides, bouncy trampolines, and cotton-candy swings floated in the air. It was the most amazing playground ever!`,
        imagePrompt: `A fantastical cloud playground floating slightly above the ground with fluffy white cloud slides, bouncy cotton candy trampolines in pink and blue, swings made of rainbow ropes hanging from cloud arches, sparkly mist surrounding everything, bright blue sky with golden sunshine, whimsical and dreamy floating playground structures, vibrant colors, no people, pure magical playground landscape`,
        sceneDescription: 'The family discovers a magical cloud playground',
        layout: 'dramatic-image-only' as const,
        imageComposition: 'full cinematic wide composition, playground as the main subject, no humans',
        charactersInScene: ['MAIN_CHILD'],
      },
      {
        pageNumber: 8,
        text: `${childName}'s father lifted ${pronoun} high up onto the biggest cloud slide. "Ready?" he asked. "Ready!" ${childName} shouted, and whoooosh — down ${pronoun} went, giggling all the way!`,
        imagePrompt: `A tall adult man (the father) with strong masculine build lifting a small ${genderWord} child high up in the air toward a fluffy white cloud slide, the man is much taller and bigger than the small child, warm smile on the father's face, the child has arms stretched up with a big excited grin, fluffy white cloud structures around them, golden sunshine and sparkles, joyful energetic family moment, clear height difference between the tall adult man and small child`,
        sceneDescription: `${childName}'s father helps ${pronoun} onto the cloud slide`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep main subjects in upper two-thirds, simpler background at bottom',
        charactersInScene: ['MAIN_CHILD', 'PARENT'],
      },
      {
        pageNumber: 9,
        text: `After playing, they found a cozy spot under a giant oak tree for their picnic. ${childName}'s mother unpacked sandwiches, fruit, and ${childName}'s favorite cookies.`,
        imagePrompt: `A peaceful picnic scene under a magnificent giant oak tree with spreading branches, a colorful checkered blanket spread on soft green grass, a tall adult woman (the mother) with feminine features sitting gracefully and unpacking food from a basket, a small ${genderWord} child sitting cross-legged on the blanket reaching for a cookie, plates of sandwiches and colorful fruits arranged neatly, dappled sunlight filtering through oak leaves, butterflies fluttering nearby, warm cozy atmosphere`,
        sceneDescription: `The family has a picnic under a big tree`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place subject on the RIGHT side, leave left side as soft background',
        charactersInScene: ['MAIN_CHILD', 'PARENT'],
      },
      {
        pageNumber: 10,
        text: `Suddenly, a friendly little bluebird landed on ${childName}'s finger! It chirped a tiny song, as if saying thank you for the breadcrumbs ${pronoun} had shared.`,
        imagePrompt: `A close-up magical moment with a small bright blue bluebird with shimmering feathers perched on a small child's outstretched finger, the bird is singing with tiny golden musical notes floating from its beak, the child looking at the bird with wonder and gentle eyes, soft bokeh background of green leaves and golden light, breadcrumbs scattered on the ground, intimate and tender moment, warm afternoon sunlight creating a gentle glow`,
        sceneDescription: `A bluebird befriends ${childName}`,
        layout: 'text-heavy-vignette' as const,
        imageComposition: 'tight portrait or close-up, circular-friendly framing',
        charactersInScene: ['MAIN_CHILD'],
      },
      {
        pageNumber: 11,
        text: `As the afternoon sun painted the sky orange, they discovered a hidden lake. The water was so clear they could see colorful pebbles at the bottom, glowing softly like jewels.`,
        imagePrompt: `A hidden lake surrounded by weeping willows and tall reeds, crystal clear water revealing colorful glowing pebbles on the bottom in blue green pink and gold, orange sunset light reflecting on the calm water surface, dragonflies with translucent wings hovering above the water, fireflies beginning to appear in the warm evening air, serene and magical atmosphere, no people, pure landscape scene`,
        sceneDescription: 'The family finds a magical hidden lake',
        layout: 'dramatic-image-only' as const,
        imageComposition: 'full cinematic wide composition, lake as the main subject, maximum visual impact',
        charactersInScene: ['MAIN_CHILD'],
      },
      {
        pageNumber: 12,
        text: `${childName}'s father skipped stones across the lake. One, two, three skips! ${childName} tried too, and ${possessive} stone skipped five times! "Champion!" ${possessive} mother cheered, clapping proudly.`,
        imagePrompt: `A lakeside scene at golden hour, a tall adult man (the father) in a throwing stance skipping a stone across calm water with visible ripples, a small ${genderWord} child next to him also throwing a stone with big effort, a tall adult woman (the mother) standing behind them clapping and cheering with a proud smile, the man is the tallest figure and the child is the shortest, beautiful orange sunset reflected in the water, stone skipping creating circular ripples on the golden water surface, warm family bonding moment`,
        sceneDescription: `The family skips stones together at the lake`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep main subjects in upper two-thirds, simpler background at bottom',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
      {
        pageNumber: 13,
        text: `On their way back, they walked through a meadow full of fireflies. Thousands of tiny lights danced around them. ${childName} felt like ${pronoun} was walking through a sky full of stars.`,
        imagePrompt: `A breathtaking twilight meadow scene with thousands of glowing yellow-green fireflies filling the entire scene like floating stars, a tall adult man (the father, tallest figure) walking on the left, a small ${genderWord} child (shortest figure) in the middle with arms outstretched touching fireflies, a tall adult woman (the mother) on the right, all three silhouetted against a deep purple and indigo twilight sky, tall grass and wildflowers around their ankles, magical enchanting atmosphere, clear height difference — adults tower over the small child`,
        sceneDescription: 'The family walks through a firefly meadow at twilight',
        layout: 'full-bleed-text-center' as const,
        imageComposition: 'place subjects at edges/sides, keep center softer for text readability',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
      {
        pageNumber: 14,
        text: `A gentle firefly landed on ${childName}'s nose, making ${pronoun} giggle. ${possessive} father smiled and said, "Even the fireflies know you're special." ${childName} felt warm and happy inside.`,
        imagePrompt: `A tender close-up scene of a small ${genderWord} child with a single bright glowing firefly perched on the child's nose, the child looking cross-eyed at it with a big giggle, a tall adult man (the father) visible beside them looking down with a warm loving smile, his hand gently on the child's shoulder, soft golden firefly glow illuminating their faces, blurred fireflies like bokeh lights in the dark background, intimate and heartwarming father-child moment`,
        sceneDescription: `A firefly lands on ${childName}'s nose`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place subject on the LEFT side, leave right side as soft background',
        charactersInScene: ['MAIN_CHILD', 'PARENT'],
      },
      {
        pageNumber: 15,
        text: `${childName} started to feel sleepy. ${possessive} father gently picked ${pronoun} up and carried ${pronoun} on his broad shoulders. ${childName} rested ${possessive} head against ${possessive} father's, feeling safe and loved.`,
        imagePrompt: `A tall strong adult man (the father) carrying a small sleepy ${genderWord} child on his broad shoulders, the child resting their head against the father's head with eyes half-closed and a peaceful smile, a tall adult woman (the mother) walking beside them with a tender loving expression, a beautiful park path at dusk with golden lampposts glowing warmly, trees with fairy lights, the father is clearly tall and strong with the small child riding high on his shoulders, warm evening light, emotional and cozy family moment`,
        sceneDescription: `${childName}'s father carries ${pronoun} on his shoulders as they head home`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep main subjects in upper two-thirds, simpler background at bottom',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
      {
        pageNumber: 16,
        text: `Back home, tucked into bed, ${childName} whispered, "That was the best day ever." ${possessive} mother kissed ${possessive} forehead, and ${possessive} father placed a tiny glowing firefly night-light by the bed. "Sweet dreams, little adventurer," they said together.`,
        imagePrompt: `A cozy warm bedroom at night, a small ${genderWord} child tucked into bed under a colorful blanket with a peaceful sleepy smile, a tall adult woman (the mother) leaning down kissing the child's forehead with a tender expression, a tall adult man (the father) standing beside the bed placing a small glowing firefly-shaped night-light on the bedside table, soft warm lamp light creating a golden glow, stuffed animals on the bed, stars visible through a window, both adults tower over the child in the small bed, loving family bedtime scene`,
        sceneDescription: `${childName} is tucked into bed after the magical family adventure`,
        layout: 'full-bleed-text-center' as const,
        imageComposition: 'place subjects at edges/sides, keep center softer for text readability',
        charactersInScene: ['MAIN_CHILD', 'PARENT', 'PARENT'],
      },
    ],
  };
}
