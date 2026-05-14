import type { StoryOutputInput } from '@bookmagic/shared';

export function getBatmanDayStory(childName: string, _childAge: number, childGender: string): StoryOutputInput {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';
  const Pronoun = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);

  const SUIT = 'a dark slate-grey superhero bodysuit with a bold black bat-shaped emblem on the chest, a long flowing black cape draping from the shoulders, a wide bright yellow utility belt with small pouches, black gloves and boots, the matching grey-and-black bat cowl is pulled back and folded onto the shoulders and upper back so the entire face is fully exposed';

  return {
    title: `${childName}, Bat-Hero for a Night`,
    pages: [
      {
        pageNumber: 1,
        text: `${childName}, Bat-Hero for a Night`,
        imagePrompt: 'A decorative storybook title page with a dark slate-grey and midnight-blue border featuring soft bat silhouettes flying along the edges, a bright yellow bat emblem at the bottom center, a thin crescent moon in one upper corner, tiny twinkling stars scattered around, soft gentle blue moonlight glow, vibrant heroic storybook colors',
        sceneDescription: 'Title page with bat-themed decorations',
        layout: 'chapter-title' as const,
        imageComposition: 'chapter-title: decorative border with bat silhouettes and a crescent moon',
      },
      {
        pageNumber: 2,
        text: `One twilight, ${childName} climbed up into the dusty attic and lifted the lid of an old wooden trunk. Inside lay a long black cape, a bright yellow belt, and a shiny bat emblem.`,
        imagePrompt: `A cozy storybook attic scene at soft twilight with warm amber lamplight from an old oil lamp, exposed wooden roof beams, a small round attic window showing a deep blue twilight sky outside, dusty floorboards, a wooden trunk with the lid wide open revealing a folded long black cape, a bright yellow utility belt, and the dark slate-grey bat-emblem chest-piece (the suit itself, not on a body), tiny floating dust particles caught in the lamp light, the child kneeling in front of the trunk in regular soft cream pajamas with both hands gripping the trunk rim leaning in to peek, the child has dark brown hair and dark brown eyes, warm light brown skin, gasping awestruck expression, soft pastel storybook style`,
        sceneDescription: `${childName} discovers the bat-suit in the attic`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep trunk and child in upper two-thirds, soft floorboards at bottom for text',
      },
      {
        pageNumber: 3,
        text: `${Pronoun} pulled on the suit, fastened the cape, and tucked the cowl back behind ${possessive} head. "Ready for duty," ${childName} whispered into the quiet evening.`,
        imagePrompt: `A storybook bedroom scene at twilight with soft blue evening light filtering through a window, a tall wooden full-length mirror reflecting the child standing in a calm detective ready pose with one fist resting on the hip and the other arm slightly raised, the child wearing ${SUIT}, the long black cape draping elegantly to the floor, the bat cowl clearly folded back and resting on the shoulders and upper back so the entire face is visible, warm bedside lamp providing a gentle accent light, the child has dark brown hair and dark brown eyes, warm light brown skin, calm determined expression, soft pastel storybook style`,
        sceneDescription: `${childName} suits up in the mirror`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and mirror on the LEFT side, soft bedroom on right for text',
      },
      {
        pageNumber: 4,
        text: `Out in the garden, ${childName} crouched silently on a low tree branch, scanning the yard like a real night-time detective. Nothing escaped ${possessive} sharp eyes.`,
        imagePrompt: `A serene storybook backyard scene at deep twilight with a soft purple and indigo sky, a thin crescent moon just rising, a tall oak tree with thick green leaves and one strong horizontal low branch, the child crouched gracefully on the branch in a classic bat detective pose with one fist resting on the branch beside the foot, the other hand draping the cape across the leg, the long black cape spilling down dramatically, soft cool moonlight on the figure, a small backyard with neat flower beds visible below, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera with a watchful focused look, the child has dark brown hair and dark brown eyes, warm light brown skin, observant heroic expression, soft pastel storybook style`,
        sceneDescription: `${childName} perches on a tree branch at dusk`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and branch in upper two-thirds, soft garden at bottom for text',
      },
      {
        pageNumber: 5,
        text: `Inside, ${childName} leaped from the sofa to the armchair without making a sound, ${possessive} cape billowing like a midnight shadow.`,
        imagePrompt: `A cozy storybook living room scene at evening with warm amber lamplight, a soft beige sofa and a cushy brown armchair across a wooden floor, a bookshelf in the background, a small woven rug between, the child caught in a dramatic mid-air leap between the two pieces of furniture, body horizontal with arms forward and legs trailing slightly, the long black cape billowing dramatically like a shadow behind, tiny motion-line streaks indicating silent quick movement, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a focused calm expression, the child has dark brown hair and dark brown eyes, warm light brown skin, stealthy focused expression, soft pastel storybook style`,
        sceneDescription: `${childName} leaps silently across the living room`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and furniture on the RIGHT side, soft living room on left for text',
      },
      {
        pageNumber: 6,
        text: `A mystery! ${childName}'s favorite stuffed bunny had gone missing. Out came the trusty magnifying glass to inspect every clue.`,
        imagePrompt: `A playful storybook scene in a child bedroom at evening with warm lamp light, the wooden floor with scattered tiny clues — a small white tuft of plush fur, a tiny pawprint chalk-drawing, a button — a wooden toy chest slightly ajar in the background, the child crouched low on one knee holding a polished brass magnifying glass close to the eye, examining one tiny clue intensely on the floor, the magnifying glass enlarging a soft hint of plush fur, the child wearing ${SUIT}, the cape draped softly behind, the child face fully visible turned three-quarter toward the camera with one eye partially magnified, the child has dark brown hair and dark brown eyes, warm light brown skin, intense detective expression, soft pastel storybook style`,
        sceneDescription: `${childName} investigates clues with a magnifying glass`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and clues in upper two-thirds, soft floor at bottom for text',
      },
      {
        pageNumber: 7,
        text: `Following the trail, ${childName} peeked under the bed — and there sat the missing bunny, safe and a little dusty. "Mystery solved!" ${pronoun} smiled.`,
        imagePrompt: `A heartwarming storybook bedroom scene with warm bedside lamp light, a wooden bed frame, the corner of a fluffy quilt lifted up, beneath the bed in the soft shadow sits one small fluffy white plush bunny with floppy ears and a tiny pink stitched nose, a few dust bunnies and a stray plush sock around, the child lying flat on the floor on the stomach peeking under the bed with one hand reaching gently toward the plush bunny, the long black cape spread behind, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a triumphant relieved smile, the child has dark brown hair and dark brown eyes, warm light brown skin, satisfied detective smile, soft pastel storybook style`,
        sceneDescription: `${childName} finds the missing plush bunny under the bed`,
        layout: 'text-heavy-vignette' as const,
        imageComposition: 'tight close-up of child and bunny, circular-friendly framing',
      },
      {
        pageNumber: 8,
        text: `With a swing of ${possessive} toy grappling hook — TWHIP! — ${childName} zipped right up to the loft above the hallway.`,
        imagePrompt: `A dynamic storybook hallway scene with a tall wooden staircase and a balcony loft above, the child mid-zip rising upward through the air on a thin shimmering silver line from a toy grappling hook held high in one hand, the hook firmly clipped to the loft railing, the other arm trailing back gracefully, the long black cape streaming behind in motion, warm overhead pendant light, wooden floor and a small console table below, tiny motion-line streaks indicating the swift upward zip, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a focused thrilled expression, the child has dark brown hair and dark brown eyes, warm light brown skin, exhilarated focused expression, soft pastel storybook style`,
        sceneDescription: `${childName} grapples up to the loft`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child in upper two-thirds, soft hallway at bottom for text',
      },
      {
        pageNumber: 9,
        text: `Down the smooth banister ${childName} slid in a single graceful swoop, the cape rippling behind like a real bat in flight.`,
        imagePrompt: `A dynamic storybook staircase scene with a tall polished wooden banister curving downward, the child seated sideways on the banister mid-slide with one hand gripping the rail ahead and the other lifted gracefully back, body leaning forward into the descent, the long black cape rippling dramatically behind in the wind of motion, soft golden chandelier light from above, a foyer with a small rug and a coat stand below, warm wood-tone walls, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera with an excited grin, the child has dark brown hair and dark brown eyes, warm light brown skin, playful exhilarated expression, soft pastel storybook style`,
        sceneDescription: `${childName} slides down the banister`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and banister on the LEFT side, soft foyer on right for text',
      },
      {
        pageNumber: 10,
        text: `In a messy playroom, ${childName} tidied every toy in silence — books on the shelf, blocks in the bin — a secret good deed under the cover of night.`,
        imagePrompt: `A storybook playroom scene at evening lit by a single soft floor lamp, neat wooden shelves now holding books and lined-up plush toys, a wooden block bin with blocks stacked neatly, a small rug with no toys scattered (only one plush dragon remains in the child careful hands mid-placement), warm cozy lighting, the child crouched mid-step beside the bin gently placing the last plush toy in its spot, finger held to the lips in a silent shhh gesture toward the camera, the long black cape draped softly behind, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera with a kind quiet smile, the child has dark brown hair and dark brown eyes, warm light brown skin, gentle thoughtful expression, soft pastel storybook style`,
        sceneDescription: `${childName} silently tidies the playroom`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and bin on the RIGHT side, soft shelves on left for text',
      },
      {
        pageNumber: 11,
        text: `On the kitchen counter, ${childName} left a neat little note signed with a tiny bat symbol — a secret "you're welcome" for whoever found it first.`,
        imagePrompt: `A charming storybook kitchen counter scene at night with soft amber lamp light, a smooth wooden counter, a small folded cream-colored paper note standing open showing handwritten words "All tidied. — Bat" with a tiny hand-drawn bat symbol underneath, a single yellow pencil resting beside the note, a small jar of cookies in the background, warm cozy light, the child standing beside the counter just lifting one hand away after placing the note, the long black cape draped softly, the child wearing ${SUIT}, the child face fully visible turned toward the camera with a secretive proud smile, the child has dark brown hair and dark brown eyes, warm light brown skin, mischievous gentle expression, soft pastel storybook style`,
        sceneDescription: `${childName} leaves a bat-signed thank-you note`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and counter in upper two-thirds, soft kitchen at bottom for text',
      },
      {
        pageNumber: 12,
        text: `${childName} climbed onto the cozy back porch roof and watched the moon rise over the sleepy neighborhood. Everything below was peaceful and quiet.`,
        imagePrompt: `A breathtaking storybook rooftop scene at moonrise with a small pitched back-porch roof, the child crouched gracefully on the peak in a classic bat detective rooftop pose with one hand resting on a knee and the other on the roof tiles, the long black cape spreading dramatically out behind catching the cool blue moonlight, a magnificent full moon glowing low in a deep navy-blue sky just above distant tree silhouettes and dim cottage rooftops, tiny twinkling stars, gentle silvery rim light on the figure, the child wearing ${SUIT}, the child face fully visible turned three-quarter toward the camera with a serene watchful expression, the child has dark brown hair and dark brown eyes, warm light brown skin, peaceful heroic expression, soft pastel storybook style`,
        sceneDescription: `${childName} watches the moon rise from the rooftop`,
        layout: 'dramatic-image-only' as const,
        imageComposition: 'wide cinematic composition with full moon and child rooftop pose, maximum visual impact',
      },
      {
        pageNumber: 13,
        text: `Down in the driveway sat a sleek little black pedal-car Bat-Mobile. ${childName} hopped in and zoomed around the cul-de-sac, headlights blinking bright.`,
        imagePrompt: `A playful storybook driveway scene at night with warm porch light glowing in the background, a sleek small child-sized black pedal car styled like a tiny Bat-Mobile with sharp fins, big round yellow headlights gleaming brightly, a small bat emblem on the hood, smooth driveway under a deep navy starry sky, the child seated inside the pedal car with both hands gripping the steering wheel and feet pedaling, the long black cape tucked neatly behind the seat, an exhilarated speed-line trail behind the car, the child wearing ${SUIT}, the child face fully visible turned slightly toward the camera with a delighted focused grin, the child has dark brown hair and dark brown eyes (NOT yellow like the headlights), warm light brown skin, joyful driving expression, soft pastel storybook style`,
        sceneDescription: `${childName} zooms the pedal Bat-Mobile`,
        layout: 'image-left-text-right' as const,
        imageComposition: 'place child and car on the LEFT side, soft driveway on right for text',
      },
      {
        pageNumber: 14,
        text: `As the night grew late, ${childName} slipped back through the garden gate, hung up the cape, and gave a satisfied nod. A hero's work was done.`,
        imagePrompt: `A peaceful storybook entryway scene at night with warm amber wall-sconce light, a wooden door slightly ajar showing the dim garden outside, a coat hook on the wall, the long black cape just being hung carefully onto the hook by the child reach, a small woven mat on the floor, the dark slate-grey suit still worn by the child, the yellow utility belt still on, the bat cowl folded back on the shoulders, the child standing facing the coat hook turned three-quarter toward the camera with one hand on the cape and the other on the hip, the child wearing ${SUIT}, the child face fully visible with a quietly satisfied smile, the child has dark brown hair and dark brown eyes, warm light brown skin, content peaceful expression, soft pastel storybook style`,
        sceneDescription: `${childName} returns home and hangs the cape`,
        layout: 'image-right-text-left' as const,
        imageComposition: 'place child and coat hook on the RIGHT side, soft entryway on left for text',
      },
      {
        pageNumber: 15,
        text: `In soft pajamas, ${childName} climbed into bed and listened to the gentle breeze outside. A storybook lay open on ${possessive} lap.`,
        imagePrompt: `A cozy storybook bedroom scene at late night with soft golden bedside lamp light, a small wooden bed with a soft midnight-blue quilt featuring tiny bat patterns, a fluffy pillow, an open hardcover storybook resting on the child lap on the quilt, a small glass of water on the bedside table, a window above showing a deep navy starry sky with the crescent moon, the dark slate-grey suit and black cape neatly folded on a wooden chair nearby (the suit itself, not on a body), the child sitting up in bed in soft cream pajamas with tiny bat-emblem patterns reading the storybook with a calm smile, the child has dark brown hair and dark brown eyes, warm light brown skin, relaxed peaceful expression, soft pastel storybook style`,
        sceneDescription: `${childName} reads quietly before sleep`,
        layout: 'full-bleed-text-bottom' as const,
        imageComposition: 'keep child and bed in upper two-thirds, soft floor at bottom for text',
      },
      {
        pageNumber: 16,
        text: `Then ${childName} closed ${possessive} eyes. In ${possessive} dreams, ${pronoun} swooped over moonlit rooftops, calm and brave under a sky full of stars. The End.`,
        imagePrompt: 'A cozy storybook bedroom at deep night with soft cool blue moonlight from a window above the bed, a fluffy midnight-blue quilt with tiny bat emblem patterns, a fluffy pillow, a deep starry navy sky outside the window with a glowing crescent moon and a small distant city skyline silhouette, soft drifting bat silhouettes like dream wisps trailing from the window toward the bed, the child sleeping curled peacefully on the pillow with a gentle dream smile, the child wearing soft cream pajamas with tiny bat patterns, the child has dark brown hair and dark brown eyes, warm light brown skin, peaceful dreaming expression, the long black cape folded neatly on a chair nearby, soft pastel storybook style',
        sceneDescription: `${childName} dreams of swooping over moonlit rooftops`,
        layout: 'full-bleed-text-center' as const,
        imageComposition: 'place child and window at edges, soft sky in center for text',
      },
    ],
  };
}
