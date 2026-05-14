import type { StoryOutputInput } from '@bookmagic/shared';

export function getSpiderManDayStory(childName: string, _childAge: number, childGender: string): StoryOutputInput {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';
  const Pronoun = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);

  const SUIT = 'a red and blue spider-themed superhero bodysuit with thin black web-pattern lines across the chest, shoulders and sleeves, a large black-outlined spider emblem on the chest, deep red gloves and boots with black web stitching, the matching red web-pattern mask is pulled up and rolled onto the top of the forehead so the entire face is fully exposed';

  return {
    title: `${childName}, Spider-Hero for a Day`,
    pages: [
      {
        pageNumber: 1,
        text: `${childName}, Spider-Hero for a Day`,
        imagePrompt: 'A decorative storybook title page with a bold red and blue border featuring delicate hand-drawn spider web patterns in the corners, a small cartoon spider emblem at the bottom center, tiny city skyline silhouettes along the lower edge, soft sparkle highlights, vibrant heroic storybook colors',
        sceneDescription: 'Title page with spider-themed decorations',
        layout: 'chapter-title' as const,
        imageComposition: 'chapter-title: decorative border with web patterns and city skyline accents',
      },
      {
        pageNumber: 2,
        text: `One bright Saturday, ${childName} bounced into ${possessive} bedroom and froze — there, draped over the chair, was a brand-new spider-hero suit, waiting just for ${pronoun === 'they' ? 'them' : pronoun}!`,
        imagePrompt: `A cheerful storybook bedroom scene with soft morning sunlight streaming through a window with sky-blue curtains, a comic-book poster on the wall, a small wooden bed with a star-patterned quilt, a wooden chair beside the bed with ${SUIT} draped neatly across it (the suit itself, no body inside it yet), the child standing in the doorway in regular soft cream pajamas with wide-eyed amazement and both hands raised to the cheeks, the child has dark brown hair and dark brown eyes, warm light brown skin, gasping delighted expression, soft pastel storybook style`,
        sceneDescription: `${childName} discovers the spider-hero suit`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep chair, suit and child in upper two-thirds, soft floor at bottom for text',
      },
      {
        pageNumber: 3,
        text: `${Pronoun} pulled on the suit, rolled the mask up onto ${possessive} forehead, and struck a brave pose in front of the mirror. "Spider-Hero, ready!" ${childName} declared.`,
        imagePrompt: `A bright storybook bedroom mirror scene with a tall wooden full-length mirror reflecting the child standing in a strong superhero pose with hands on hips and chest puffed out, the child wearing ${SUIT}, the child face fully visible and turned three-quarter toward the camera, soft sunlight, a few comic books on a desk in the background, the child has dark brown hair and dark brown eyes, warm light brown skin, proud heroic expression, soft pastel storybook style`,
        sceneDescription: `${childName} suits up and poses in the mirror`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and mirror on the LEFT side, soft bedroom on right for text',
      },
      {
        pageNumber: 4,
        text: `THWIP! ${childName} pressed ${possessive} palms to the bedroom wall and — somehow — began to climb up like a real spider! Higher and higher ${pronoun} went, all the way to the ceiling.`,
        imagePrompt: `A playful storybook bedroom scene viewed from a low angle, the child clinging to the bedroom wall partway up near the ceiling with both hands and both feet pressed flat against the wall in a classic spider crawling pose, a pretend tiny dotted web-line trailing behind, soft golden morning light, a poster and a clock on the wall, the bed visible below, the child wearing ${SUIT}, the child face turned toward the camera with a triumphant grin, the child has dark brown hair and dark brown eyes, warm light brown skin, excited grinning expression, soft pastel storybook style`,
        sceneDescription: `${childName} climbs the bedroom wall`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child climbing in upper two-thirds, soft bed at bottom for text',
      },
      {
        pageNumber: 5,
        text: `Suddenly — TINGLE! ${childName}'s spider-sense buzzed! ${Pronoun} dashed into the kitchen and caught a wobbly glass of juice just before it could tip over.`,
        imagePrompt: `A bright storybook kitchen scene with soft yellow walls, a wooden table with a bowl of fresh fruit, a glowing pendant lamp, a tall glass of orange juice balanced precariously on the very edge of the table mid-tip, the child mid-stride diving across the kitchen with one arm fully extended and fingers about to catch the glass, tiny lightning-bolt spider-sense lines drawn around the child head, the child wearing ${SUIT}, the child face fully visible with focused determined expression, the child has dark brown hair and dark brown eyes, warm light brown skin, heroic concentration expression, soft pastel storybook style`,
        sceneDescription: `${childName}'s spider-sense saves a falling juice glass`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and table on the RIGHT side, soft kitchen on left for text',
      },
      {
        pageNumber: 6,
        text: `Out into the backyard ${childName} flipped — once, twice, three times! ${Pronoun} landed lightly on the grass with arms wide. "Tah-dah!" ${pronoun} laughed.`,
        imagePrompt: `A cheerful storybook backyard scene with soft green grass, a small wooden fence and a leafy tree, a few colorful flowers along the lawn, warm afternoon sunlight, the child caught mid-acrobatic landing with one foot just touching the grass and arms thrown wide in a triumphant final pose, tiny motion-line streaks showing the previous flip arc behind, the child wearing ${SUIT}, the child face fully visible with a wide laughing smile, the child has dark brown hair and dark brown eyes, warm light brown skin, joyful triumphant expression, soft pastel storybook style`,
        sceneDescription: `${childName} flips across the backyard`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child in upper two-thirds, soft grass at bottom for text',
      },
      {
        pageNumber: 7,
        text: `Pointing a wrist at a sturdy branch, ${childName} pretended to shoot a sparkling web — THWIP! — and swung happily through the air over the garden.`,
        imagePrompt: `A dynamic storybook outdoor scene with the child swinging through the air on a thin shimmering silver web-line attached to a sturdy oak tree branch above, the child gripping the web-line with one hand and reaching forward with the other in classic web-swing pose, soft fluffy clouds and a pale blue sky in the background, the leafy garden and a wooden fence below, tiny sparkle highlights along the web-line, warm afternoon sunlight, the child wearing ${SUIT}, the child face turned toward the camera with a delighted laughing smile, the child has dark brown hair and dark brown eyes, warm light brown skin, exhilarated joyful expression, soft pastel storybook style`,
        sceneDescription: `${childName} web-swings over the garden`,
        layout: 'dramatic-image-only' as const,
        imageComposition: 'wide cinematic composition, child centered mid-swing, maximum visual impact',
      },
      {
        pageNumber: 8,
        text: `High in a tree, a tiny tabby kitten meowed sadly. "Don't worry — I'm coming!" ${childName} called. With a quick climb and a gentle scoop, the kitten was safe.`,
        imagePrompt: `A heartwarming storybook scene at a tall oak tree with thick green leaves, one small fluffy orange-and-cream tabby kitten with big round green eyes (kitten eyes only — not the child) clinging to a high branch looking down nervously, the child crouched on the same branch with one arm gently scooping the kitten close to the chest, the other hand gripping the branch, warm late-afternoon golden light filtering through leaves, a soft suburban backyard far below, the child wearing ${SUIT}, the child face fully visible with a gentle reassuring smile, the child has dark brown hair and dark brown eyes (NOT green like the kitten), warm light brown skin, tender protective expression, soft pastel storybook style`,
        sceneDescription: `${childName} rescues a kitten from a tree`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and kitten on the LEFT side, soft sky and leaves on right for text',
      },
      {
        pageNumber: 9,
        text: `On the sidewalk wandered a lost little puppy with a wagging tail. ${childName} bent down, read the tag on its collar, and led it gently back to its front porch.`,
        imagePrompt: `A sweet storybook neighborhood sidewalk scene with a tidy cobblestone path lined with small flower beds, a friendly fluffy small puppy with floppy ears and a wagging tail wearing a red collar with a tiny silver tag, sniffing the ground beside the path, a charming cottage with a wooden front porch and a "Welcome" mat visible a short distance away, warm afternoon golden light, the child kneeling beside the puppy with one careful hand on the puppy back and the other gently lifting the collar tag to read it, the child wearing ${SUIT}, the child face fully visible with a kind gentle smile, the child has dark brown hair and dark brown eyes, warm light brown skin, caring helpful expression, soft pastel storybook style`,
        sceneDescription: `${childName} helps a lost puppy home`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and puppy in upper two-thirds, soft path at bottom for text',
      },
      {
        pageNumber: 10,
        text: `On a balcony nearby, a bright yellow paper kite had tangled itself in the railing. ${childName} scaled the wall, gave the kite a careful tug, and set it free into the breeze.`,
        imagePrompt: `A breezy storybook scene of a small cozy balcony on the side of a yellow-painted house, a bright sunshine-yellow diamond-shaped paper kite tangled in the white wooden balcony railing with its long ribbon tail flapping, a few potted plants and a small wind chime on the balcony, fluffy clouds in a pale blue sky, the child crouched on the balcony railing with one hand gripping the railing and the other gently untangling the kite ribbon, tiny motion lines showing how the kite is about to be freed, the child wearing ${SUIT}, the child face fully visible with a determined focused expression, the child has dark brown hair and dark brown eyes (NOT yellow like the kite), warm light brown skin, careful helpful expression, soft pastel storybook style`,
        sceneDescription: `${childName} rescues a tangled kite`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and balcony on the RIGHT side, soft sky on left for text',
      },
      {
        pageNumber: 11,
        text: `Back home, ${childName} dropped lightly into the flower garden, landing among the tulips without crushing a single petal. ${Pronoun} bowed to the flowers and giggled.`,
        imagePrompt: `A whimsical storybook garden scene with neat rows of bright tulips in pink, peach, and pale violet, soft green grass borders, a small white picket fence in the background, warm late-afternoon light, the child caught in a graceful three-point landing on the soft earth between the flowers, one knee on the ground and one hand fingertip-touching the soil for balance, the other arm extended elegantly outward, no flowers crushed, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a playful smile, the child has dark brown hair and dark brown eyes (NOT pink like the tulips), warm light brown skin, playful graceful expression, soft pastel storybook style`,
        sceneDescription: `${childName} lands lightly in the flower garden`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and flowers in upper two-thirds, soft soil at bottom for text',
      },
      {
        pageNumber: 12,
        text: `Indoors, a stray bouncing ball came zooming straight toward ${childName}. ZOOM! ${Pronoun} dodged it in super-slow-motion, leaning all the way back with a grin.`,
        imagePrompt: `A playful storybook living room scene with a wooden floor, a soft beige couch, a bookshelf in the background, warm overhead lamp light, a bright red rubber bouncing ball captured mid-air zooming toward the camera with motion blur lines behind it, the child standing mid-floor leaning dramatically backward in a slow-motion dodge with knees bent and arms back for balance, the ball just inches from the chest, the child wearing ${SUIT}, the child face fully visible with a wide cheeky grin, the child has dark brown hair and dark brown eyes (NOT red like the ball), warm light brown skin, playful dodging expression, soft pastel storybook style`,
        sceneDescription: `${childName} dodges a bouncing ball in slow motion`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and ball on the LEFT side, soft living room on right for text',
      },
      {
        pageNumber: 13,
        text: `With a piece of soft chalk, ${childName} drew a giant spider web on the garden wall — a hero's signature for everyone to find later.`,
        imagePrompt: `A charming storybook scene at a smooth pale grey stone garden wall, a large fresh chalk drawing of a perfect round spider web with eight curving spokes covering a wide section of the wall, a small chalk spider in the center of the web, a piece of white chalk in the child fingers, scattered other small chalk drawings nearby — a star, a heart — soft warm afternoon light, the child standing beside the wall with one hand finishing the last chalk line and the other on the hip, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a proud satisfied smile, the child has dark brown hair and dark brown eyes, warm light brown skin, accomplished pleased expression, soft pastel storybook style`,
        sceneDescription: `${childName} chalks a spider-web signature`,
        layout: 'text-heavy-vignette' as const,
        imageComposition: 'tight close-up of child and chalk web, circular-friendly framing',
      },
      {
        pageNumber: 14,
        text: `As the sun began to set, ${childName} struck the perfect rooftop pose, cape of cloud behind ${pronoun === 'they' ? 'them' : pronoun}. The whole neighborhood glowed warm and gold.`,
        imagePrompt: `A breathtaking storybook rooftop scene at golden sunset with the child crouched dramatically on the peak of a tiled rooftop in a classic spider-hero rooftop pose — one hand resting on the roof tiles, the other fist resting on the bent knee, head turned three-quarter toward the camera looking out heroically, the sky filled with vivid orange, pink, and purple sunset clouds, distant neighborhood houses and tree silhouettes below, tiny twinkling lights starting in nearby windows, warm rim lighting on the child, the child wearing ${SUIT}, the child face fully visible with a confident heroic expression, the child has dark brown hair and dark brown eyes, warm light brown skin, proud peaceful smile, soft pastel storybook style`,
        sceneDescription: `${childName} strikes the hero pose at sunset`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and rooftop in upper two-thirds, soft skyline at bottom for text',
      },
      {
        pageNumber: 15,
        text: `Back inside, ${childName} hung the brave spider-suit on a chair and tucked into a warm bowl of pasta. Even spider-heroes need supper!`,
        imagePrompt: `A cozy storybook kitchen dinner scene at evening with warm amber overhead light, a wooden dining table with a checkered tablecloth, a steaming bowl of spaghetti with tomato sauce and tiny meatballs, a glass of water, a folded napkin, a wooden chair with the red and blue spider-themed superhero bodysuit draped over the back (the suit itself, hanging neatly), the child seated at the table in soft cream pajamas with tiny spider patterns, holding a fork mid-twirl of spaghetti with a delighted smile, the child has dark brown hair and dark brown eyes, warm light brown skin, content hungry happy expression, soft pastel storybook style`,
        sceneDescription: `${childName} eats dinner after a busy hero day`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and table on the RIGHT side, soft kitchen on left for text',
      },
      {
        pageNumber: 16,
        text: `Snug in bed, ${childName} closed ${possessive} eyes and smiled. In ${possessive} dreams, ${pronoun} swung between glowing skyscrapers, brave and free. The End.`,
        imagePrompt: 'A cozy storybook bedroom at night with soft warm amber lamplight, a small wooden bed with a fluffy quilt patterned with tiny web designs, a fluffy pillow, a window above showing a deep navy night sky with a thin crescent moon and tiny city skyline silhouettes in the distance, soft dotted web-lines drifting like dream wisps from the window down toward the bed, the child sleeping curled peacefully on the pillow with a gentle dream smile, the child wearing soft cream pajamas with tiny spider patterns, the child has dark brown hair and dark brown eyes, warm light brown skin, peaceful dreaming expression, the red and blue suit folded neatly on a chair nearby, soft pastel storybook style',
        sceneDescription: `${childName} dreams of swinging through the city`,
        layout: 'full-bleed-text-center' as const,
        imageComposition: 'place child and window at edges, soft sky in center for text',
      },
    ],
  };
}
