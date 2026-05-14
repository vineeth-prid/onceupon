import type { StoryOutputInput } from '@bookmagic/shared';

export function getSupermanDayStory(childName: string, _childAge: number, childGender: string): StoryOutputInput {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';
  const Pronoun = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);

  const SUIT = 'a bright royal blue superhero bodysuit with a large red and yellow diamond-shaped shield emblem on the chest, a flowing crimson red cape billowing from the shoulders, red boots, a bright yellow utility belt, no mask (the face is fully bare and visible at all times)';

  return {
    title: `${childName}, Super-Hero for a Day`,
    pages: [
      {
        pageNumber: 1,
        text: `${childName}, Super-Hero for a Day`,
        imagePrompt: 'A decorative storybook title page with a bold royal blue and crimson red border, comic-book starbursts in the corners, soft yellow lightning-bolt accents, a small floating cape silhouette and a tiny city skyline silhouette along the lower edge, sparkle highlights, vibrant heroic storybook colors',
        sceneDescription: 'Title page with super-hero themed decorations',
        layout: 'chapter-title' as const,
        imageComposition: 'chapter-title: decorative border with comic-style accents and floating cape',
      },
      {
        pageNumber: 2,
        text: `One sleepy Saturday, ${childName} opened the toy chest and gasped — folded right on top was a brilliant red cape and a bright blue super-suit with a shiny shield emblem.`,
        imagePrompt: `A cheerful storybook bedroom scene with soft morning sunlight, a sky-blue painted wall with a small framed poster, a wooden toy chest with the lid wide open, the chest filled with toys but on top neatly folded sits the entire blue super-suit and the red cape (the suit itself, not on a body), the child kneeling in front of the chest in regular soft cream pajamas with both hands on the chest rim leaning in to peek, the child has dark brown hair and dark brown eyes, warm light brown skin, gasping delighted expression with wide eyes, soft pastel storybook style`,
        sceneDescription: `${childName} finds the super-suit in the toy chest`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep chest and child in upper two-thirds, soft floor at bottom for text',
      },
      {
        pageNumber: 3,
        text: `${Pronoun} pulled on the suit, fastened the cape, and stood proudly in front of the mirror. "Super-Hero, ready to help!" ${childName} announced with hands on hips.`,
        imagePrompt: `A bright storybook bedroom mirror scene with a tall wooden full-length mirror reflecting the child standing tall in a classic super-hero pose with hands firmly on hips and chest puffed forward, the red cape draping elegantly behind, soft morning sunlight streaming in, a few comic books on a wooden desk in the background, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera, the child has dark brown hair and dark brown eyes, warm light brown skin, proud heroic confident expression, soft pastel storybook style`,
        sceneDescription: `${childName} suits up and poses in the mirror`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and mirror on the LEFT side, soft bedroom on right for text',
      },
      {
        pageNumber: 4,
        text: `In the playroom, a heavy toy box wouldn't budge. ${childName} took a deep breath, lifted it high above ${possessive} head with one hand, and grinned. Super-strength!`,
        imagePrompt: `A playful storybook playroom scene with soft beige walls and a wooden floor scattered with toys, the child standing strong with feet planted firmly apart, lifting a wooden toy box overflowing with plush toys and blocks high above the head with one outstretched arm in an effortless super-strength pose, tiny motion-line streaks indicating the easy lift, warm overhead light, the child wearing ${SUIT}, the cape billowing slightly behind, the child face fully visible with a wide proud grin, the child has dark brown hair and dark brown eyes, warm light brown skin, triumphant strong expression, soft pastel storybook style`,
        sceneDescription: `${childName} lifts a heavy toy box with one hand`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and toy box on the RIGHT side, soft playroom on left for text',
      },
      {
        pageNumber: 5,
        text: `With a great big leap, ${childName} JUMPED — high enough to touch the very tip of the ceiling! Up, up, up went ${possessive} red cape, fluttering like a flag.`,
        imagePrompt: `A dynamic storybook living room scene with the child caught mid-air in a soaring jump that has reached almost to the ceiling, both arms stretched upward in a classic flying pose with fists ahead, one hand fingertip-touching the ceiling, the cape billowing wide and graceful behind, soft warm overhead lamp light, a cozy beige couch and bookshelf visible below, tiny motion-line streaks showing the upward arc, the child wearing ${SUIT}, the child face fully visible turned toward the camera with an exhilarated wide smile, the child has dark brown hair and dark brown eyes, warm light brown skin, exhilarated soaring expression, soft pastel storybook style`,
        sceneDescription: `${childName} leaps up to touch the ceiling`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child in upper two-thirds, soft living room at bottom for text',
      },
      {
        pageNumber: 6,
        text: `WHOOSH! Out the window ${childName} soared, gliding gently above the rooftops. Below, ${pronoun} could see chimneys, trees, and the little park all lit up in morning sun.`,
        imagePrompt: `A breathtaking storybook flight scene high above a small neighborhood with rows of pitched red and grey rooftops, brick chimneys, tall leafy trees, and a small green park with a winding path far below, a soft blue morning sky with a few fluffy white clouds drifting by, the child flying in a classic superman pose with both fists forward and body horizontal, the red cape streaming dramatically behind, tiny wind-streak lines around the body showing speed, warm sunlight on the face, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera, the child has dark brown hair and dark brown eyes, warm light brown skin, exhilarated heroic expression, soft pastel storybook style`,
        sceneDescription: `${childName} flies above the rooftops`,
        layout: 'dramatic-image-only' as const,
        imageComposition: 'wide cinematic composition, child centered mid-flight, maximum visual impact',
      },
      {
        pageNumber: 7,
        text: `A bright red balloon drifted away from a tiny robin's nest! Quick as a flash, ${childName} swooped down and caught the string just in time, then tied it gently to a branch.`,
        imagePrompt: `A heartwarming storybook scene of the child mid-flight beside a tall leafy oak tree, one small fluffy brown robin with an orange chest perched on a branch beside its tiny twig nest, a single shiny round red balloon on a long curling white string having drifted up just above the branch, the child reaching out and catching the balloon string with one careful hand while the other hand steadies against the air, soft fluffy white clouds and pale blue sky in the background, warm afternoon light, the child wearing ${SUIT}, the cape flowing behind, the child face fully visible with a gentle helpful smile, the child has dark brown hair and dark brown eyes (NOT red like the balloon or orange like the robin), warm light brown skin, kind helpful expression, soft pastel storybook style`,
        sceneDescription: `${childName} catches a drifting balloon for a robin`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child, balloon, and robin on the LEFT side, soft sky on right for text',
      },
      {
        pageNumber: 8,
        text: `Down in the garden, a flower pot tipped off a high windowsill! ${childName} darted in and caught it gently — not a single petal harmed.`,
        imagePrompt: `A storybook scene at a cozy yellow cottage wall with a window high above a flower garden, a small terracotta flower pot full of cheerful pink geraniums frozen in mid-air just inches from a fall, a tiny soil sprinkle dropping below, the child caught in a graceful hover mid-air with both hands cupped under the pot catching it gently from below, the red cape billowing softly, lush green garden plants and tulips below, soft afternoon sunlight, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a focused gentle smile, the child has dark brown hair and dark brown eyes (NOT pink like the geraniums), warm light brown skin, attentive caring expression, soft pastel storybook style`,
        sceneDescription: `${childName} catches a falling flower pot`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and pot in upper two-thirds, soft garden at bottom for text',
      },
      {
        pageNumber: 9,
        text: `Up in a tree, a tiny white kitten cried softly. "I've got you," ${childName} whispered. ${Pronoun} lifted into the air and floated the kitten safely down to the grass.`,
        imagePrompt: `A tender storybook scene of a tall leafy oak tree with one small fluffy snow-white kitten with big round blue eyes (kitten eyes only — not the child) clinging to a high branch, the child gently hovering in the air beside the branch, both hands carefully cradling the kitten close to the chest, soft golden afternoon light filtering through leaves, a soft green lawn far below, the cape flowing softly downward, the child wearing ${SUIT}, the child face fully visible with a tender protective smile, the child has dark brown hair and dark brown eyes (NOT blue like the kitten), warm light brown skin, gentle reassuring expression, soft pastel storybook style`,
        sceneDescription: `${childName} floats a kitten safely down from a tree`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child, kitten, and tree on the RIGHT side, soft sky on left for text',
      },
      {
        pageNumber: 10,
        text: `A runaway ball bounced down the lane! ${childName} zoomed after it in a streak of red and blue, scooped it up, and set it neatly back on the grass.`,
        imagePrompt: `A speedy storybook lane scene with a winding path between leafy hedges, a bright orange and white striped rubber ball mid-bounce ahead, the child running at super-speed across the path with one arm extended forward about to scoop the ball, the body leaned forward in motion, a clear red and blue motion-streak trail behind showing the super-fast movement, warm afternoon sunlight, a few fluttering autumn leaves swirling in the wake, the child wearing ${SUIT}, the cape streaming dramatically behind, the child face fully visible with a determined focused grin, the child has dark brown hair and dark brown eyes (NOT orange like the ball), warm light brown skin, fast determined expression, soft pastel storybook style`,
        sceneDescription: `${childName} races a runaway ball`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and ball in upper two-thirds, soft path at bottom for text',
      },
      {
        pageNumber: 11,
        text: `On the porch, a fizzy glass of lemonade was about to overflow. ${childName} took a gentle FROSTY breath — and the lemonade froze into a cool icy treat!`,
        imagePrompt: `A playful storybook porch scene with a wooden front porch, a small round side table, a tall clear glass of bright yellow lemonade bubbling near the rim with foam on top, a soft pale icy mist breath drifting from the child slightly parted lips toward the glass, the lemonade visibly beginning to glaze with delicate frost crystals and a thin layer of crisp ice on top, tiny frosty sparkle particles in the air, warm midday light, the child standing beside the table leaning gently toward the glass with one hand resting on the table, the child wearing ${SUIT}, the cape softly draped, the child face fully visible with a playful focused smile, the child has dark brown hair and dark brown eyes (NOT yellow like the lemonade), warm light brown skin, playful magical expression, soft pastel storybook style`,
        sceneDescription: `${childName} uses frosty breath on a glass of lemonade`,
        layout: 'text-heavy-vignette' as const,
        imageComposition: 'tight close-up of child and lemonade glass, circular-friendly framing',
      },
      {
        pageNumber: 12,
        text: `As afternoon turned to evening, ${childName} flew straight into a sky full of glowing sunset clouds. The whole world below shone like gold.`,
        imagePrompt: `A magnificent storybook sunset sky scene with the child flying in a strong classic superhero pose horizontally through fluffy clouds tinted vivid orange, pink, and lavender by the setting sun, soft beams of golden light streaming across the sky, distant green hills and a tiny silhouetted town below catching the last warm light, soft wind-streaks behind the body showing speed, the cape streaming gloriously behind, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera bathed in warm golden rim light, the child has dark brown hair and dark brown eyes, warm light brown skin, peaceful joyful soaring expression, soft pastel storybook style`,
        sceneDescription: `${childName} flies through sunset clouds`,
        layout: 'full-bleed-text-top' as const,
        imageComposition: 'keep child in lower two-thirds, soft sunset sky at top for text',
      },
      {
        pageNumber: 13,
        text: `Down ${childName} came, landing softly in the backyard with one knee on the grass — the perfect super-hero landing.`,
        imagePrompt: `A cheerful storybook backyard scene at golden hour with soft green grass and a small wooden fence, a leafy tree to one side, a few colorful tulips along the lawn, the child in a classic super-hero landing pose with one knee firmly on the grass, one fist resting on the earth beside the knee, the other arm flared back for balance, the cape spread wide behind on the grass, tiny dust puffs around the landing point, warm orange and pink sunset light, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a confident smile, the child has dark brown hair and dark brown eyes, warm light brown skin, triumphant heroic expression, soft pastel storybook style`,
        sceneDescription: `${childName} lands in the backyard`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child in upper two-thirds, soft grass at bottom for text',
      },
      {
        pageNumber: 14,
        text: `${childName} stood tall, cape blowing in the breeze. The whole neighborhood was safe and happy — thanks to one brave little super-hero.`,
        imagePrompt: `A storybook neighborhood scene at warm golden evening with a winding cobblestone street lined with charming cottages and gentle string lights just beginning to glow in the windows, distant treetops and rolling hills behind, soft pink-orange sunset clouds, the child standing in the very middle of the street in a strong heroic pose with feet apart and hands on hips, the red cape billowing dramatically in the breeze behind, warm rim light along the figure, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera, the child has dark brown hair and dark brown eyes, warm light brown skin, proud peaceful smile, soft pastel storybook style`,
        sceneDescription: `${childName} stands proudly in the neighborhood`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child on the LEFT side, soft neighborhood on right for text',
      },
      {
        pageNumber: 15,
        text: `Back home, ${childName} folded the cape carefully and pulled on cozy pajamas. ${Pronoun} sipped warm cocoa and looked up at the first twinkling stars.`,
        imagePrompt: `A cozy storybook bedroom evening scene with soft golden lamp light, a fluffy beanbag chair by a window showing a deep blue twilight sky with first twinkling stars, the bright blue super-suit and red cape folded neatly on a wooden chair (the suit itself, not on a body), a small steaming mug of cocoa with tiny marshmallows in the child hands, the child sitting on the beanbag in soft cream pajamas with tiny shield emblem patterns, gentle peaceful smile while looking out the window, the child has dark brown hair and dark brown eyes, warm light brown skin, content reflective expression, soft pastel storybook style`,
        sceneDescription: `${childName} settles down with cocoa at evening`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and beanbag on the RIGHT side, soft bedroom on left for text',
      },
      {
        pageNumber: 16,
        text: `Tucked in tight, ${childName} closed ${possessive} eyes. In ${possessive} dreams, ${pronoun} soared above golden cities, brave and kind and free. The End.`,
        imagePrompt: 'A cozy storybook bedroom at night, a small wooden bed with a fluffy quilt patterned with tiny shield emblems, a fluffy pillow, a window above showing a deep starry night sky with a glowing crescent moon and a faint distant city skyline silhouette twinkling in the distance, a soft golden glow drifting like a dream wisp from the window toward the bed, the child sleeping curled peacefully on the pillow with a gentle dream smile, the child wearing soft cream pajamas with tiny shield emblem patterns, the child has dark brown hair and dark brown eyes, warm light brown skin, peaceful dreaming expression, the red cape folded gently on a chair nearby, soft pastel storybook style',
        sceneDescription: `${childName} dreams of soaring over golden cities`,
        layout: 'full-bleed-text-center' as const,
        imageComposition: 'place child and window at edges, soft sky in center for text',
      },
    ],
  };
}
