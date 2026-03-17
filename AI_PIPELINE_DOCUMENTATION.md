# Once Upon a Time - Complete AI Pipeline Documentation

> This document explains EVERY step of how AI is used in this project.
> Anyone reading this can recreate the same output, fine-tune settings, and understand every keyword/parameter used.

---

## TABLE OF CONTENTS

1. [High-Level Flow Chart](#1-high-level-flow-chart)
2. [Step-by-Step AI Pipeline](#2-step-by-step-ai-pipeline)
3. [STEP 1: Photo Upload & Storage](#step-1-photo-upload--storage)
4. [STEP 2: Character Description (Gemini Vision)](#step-2-character-description-extraction-gemini-vision-api)
5. [STEP 3: Story Generation (Gemini Flash / Static)](#step-3-story-generation)
6. [STEP 4: Reference Sheet (PhotoMaker)](#step-4-reference-sheet-generation-photomaker)
7. [STEP 5: Page Image Generation (PhotoMaker)](#step-5-page-image-generation-photomaker)
8. [STEP 6: PDF Assembly](#step-6-pdf-assembly)
9. [PhotoMaker Deep Dive](#photomaker-deep-dive)
10. [Prompt Engineering Bible](#prompt-engineering-bible)
11. [Negative Prompt Breakdown](#negative-prompt-breakdown)
12. [What Failed & Why](#what-failed--lessons-learned)
13. [Configuration Reference](#configuration-reference)
14. [File Map](#file-map)

---

## 1. HIGH-LEVEL FLOW CHART

```
USER FLOW
=========

[User Opens App]
       |
       v
[Select Theme] -----> Dinosaur / Tooth Fairy / Moon Princess / Custom
       |
       v
[Upload Child's Photo] -----> JPEG/PNG/WebP, max 10MB
       |
[Enter Name, Age, Gender]
       |
[If Custom: Write Story Idea]
       |
       v
[Click "Create My Storybook"]
       |
       |                    BACKEND AI PIPELINE
       |                    ===================
       v
+----------------------------------------------+
|  STEP 1: Save Photo to Disk                  |
|  /uploads/{uuid}.jpg                         |
+----------------------------------------------+
       |
       v
+----------------------------------------------+
|  STEP 2: CHARACTER DESCRIPTION               |
|  (Gemini 2.5 Flash - Vision API)             |
|                                              |
|  Input:  Child's photo (base64)              |
|  Output: Identity Tag + Full Description     |
|                                              |
|  Example Output:                             |
|  "short dark brown hair, medium brown        |
|   skin, big brown eyes, boy"                 |
|  ---                                         |
|  "A boy with short straight dark brown       |
|   hair, medium brown skin, round face        |
|   with large dark brown eyes, thick          |
|   eyebrows, small nose, wearing a bright     |
|   orange t-shirt, khaki shorts"              |
+----------------------------------------------+
       |
       v
+----------------------------------------------+
|  STEP 3: STORY GENERATION                    |
|                                              |
|  IF theme = dinosaur/tooth-fairy/moon:       |
|    -> Use STATIC pre-written story           |
|    -> Replace {childName} placeholders       |
|    -> Skip Gemini call (saves API cost)      |
|                                              |
|  IF theme = custom:                          |
|    -> Call Gemini 2.5 Flash                  |
|    -> Send user's story idea + rules         |
|    -> Get 16-page structured JSON            |
|                                              |
|  Output: 16 pages, each with:               |
|    - text (story words)                      |
|    - imagePrompt (scene description)         |
|    - layout (page design type)               |
|    - imageComposition (framing hint)         |
+----------------------------------------------+
       |
       v
+----------------------------------------------+
|  STEP 4: REFERENCE SHEET                     |
|  (PhotoMaker on Replicate)                   |
|                                              |
|  Input:  Child's photo + "img" prompt        |
|  Output: Character reference sheet image     |
|  Purpose: Establishes character look         |
+----------------------------------------------+
       |
       v
+----------------------------------------------+
|  STEP 5: PAGE IMAGE GENERATION               |
|  (PhotoMaker on Replicate - 15 calls)        |
|                                              |
|  For EACH of the 16 pages:                   |
|                                              |
|  Page 1 (chapter-title): SKIP (no image)     |
|                                              |
|  Pages with child (normal):                  |
|    -> Use "img" trigger for face embedding   |
|    -> Prompt = identity + scene + style      |
|    -> PhotoMaker merges face into scene      |
|                                              |
|  Pages without child (dramatic-image-only):  |
|    -> NO "img" trigger (no face embedding)   |
|    -> Pure scene generation (dinosaurs etc)  |
|    -> Prevents face appearing on animals     |
|                                              |
|  12-second delay between each API call       |
|  Failed pages auto-retried once              |
+----------------------------------------------+
       |
       v
+----------------------------------------------+
|  STEP 6: PDF GENERATION                      |
|  (PDFKit library)                            |
|                                              |
|  Assembles: Cover + 16 story pages + back    |
|  Custom fonts, gradient overlays, text       |
+----------------------------------------------+
       |
       v
[User sees Interactive Book Preview]
[User can Download PDF]
```

---

## 2. STEP-BY-STEP AI PIPELINE

### The 3 AI Models Used

| Model | Provider | Purpose | API |
|-------|----------|---------|-----|
| **Gemini 2.5 Flash** | Google | Story text generation | `@google/genai` SDK |
| **Gemini 2.5 Flash (Vision)** | Google | Character description from photo | `@google/genai` SDK |
| **PhotoMaker-Style** | TencentARC (via Replicate) | Disney/Pixar image generation with face identity | Replicate API |

---

## STEP 1: Photo Upload & Storage

**File**: `apps/backend/src/upload/upload.service.ts`

```
User uploads photo via browser
       |
       v
POST /api/upload/photo (multipart/form-data)
       |
       v
Validate: JPEG/PNG/WebP, max 10MB
       |
       v
Save to: /uploads/{random-uuid}.{ext}
       |
       v
Return: "/uploads/{uuid}.ext" (relative path)
```

- Photo is stored on the server's local filesystem
- The relative path is saved in the database with the order
- This same photo is used for ALL subsequent AI operations

---

## STEP 2: Character Description Extraction (Gemini Vision API)

**File**: `apps/backend/src/image/image.service.ts` → `describeCharacter()`

This is the FIRST AI call. It analyzes the child's uploaded photo to extract visual features that will be used to keep the character consistent across all 16 pages.

### How It Works

```
1. Read photo from disk
2. Convert to base64
3. Send to Gemini 2.5 Flash with Vision prompt
4. Parse response into TWO parts
```

### The Exact Prompt Sent to Gemini Vision

```
You are analyzing a photo of a {boy/girl} child for a children's
storybook illustration project.
Describe this {boy/girl}'s visual appearance in precise detail
for an illustrator.
The child's name is {childName}, age {childAge}, {childGender}.

Provide a CONCISE but DETAILED visual description covering:
1. Hair: EXACT color, style, length, texture
   (e.g. "short straight dark brown hair")
2. Skin tone: Use EXACT descriptions like "medium brown skin",
   "dark brown skin". NEVER use vague terms.
3. Face shape and features
   (e.g. "round face, big brown eyes, thick eyebrows")
4. Gender: Must clearly match a {boy/girl}.

Then suggest a simple, memorable outfit:
- A specific colored t-shirt/top
- Specific pants/shorts/skirt
- Gender-appropriate

Format as TWO lines separated by "---":

LINE 1 (IDENTITY TAG): 10-15 words
  hair + skin + eyes + gender
  Example: "short dark brown hair, medium brown skin,
           big brown eyes, boy"

LINE 2 (FULL DESCRIPTION): Up to 50 words with outfit.
  Example: "A boy with short straight dark brown hair,
           medium brown skin, round face with large dark
           brown eyes, thick eyebrows, small nose, wearing
           a bright orange t-shirt, khaki shorts."
```

### Gemini Vision API Call Details

```typescript
Model: "gemini-2.5-flash"
Content: [
  { inlineData: { mimeType: "image/png", data: base64Image } },
  { text: prompt }
]
```

### What the Output Looks Like

```
short dark brown hair, medium brown skin, big brown eyes, boy
---
A boy with short straight dark brown hair, medium brown skin,
round face with large dark brown eyes, thick eyebrows, small nose,
wearing a bright orange t-shirt, khaki shorts, and white sneakers.
```

### Why This Matters

The output is split into TWO parts and used differently:

- **Identity Tag** (Line 1): Placed RIGHT AFTER the `img` trigger word in PhotoMaker prompts. This is the most critical position — PhotoMaker anchors face features to whatever text follows `img`.

- **Full Description** (Line 2): Placed at the END of the prompt as reinforcement. Prevents the model from "drifting" away from the character's appearance on later pages.

### Critical Rules for Character Description

| Rule | Why |
|------|-----|
| EXACT skin tone ("medium brown skin") | Vague terms like "warm skin" cause skin color to change between pages |
| EXACT hair length ("short", "medium", "long") | Hair length changes are the #1 consistency issue |
| Include gender word | Prevents gender drift (boy looking like girl on some pages) |
| Under 50 words total | Too long = PhotoMaker ignores parts of it |

---

## STEP 3: Story Generation

**Files**:
- `apps/backend/src/story/story.service.ts` (Gemini call for custom)
- `apps/backend/src/story/static-stories/` (pre-built templates)

### Two Paths

```
                    Theme Selection
                         |
            +------------+------------+
            |                         |
     Pre-built Theme              Custom Theme
  (dinosaur/tooth-fairy/        (user writes own
   moon-princess)                story idea)
            |                         |
            v                         v
   Return static JSON         Call Gemini 2.5 Flash
   (no API call needed)       with story prompt
            |                         |
            +------------+------------+
                         |
                         v
              16-page story JSON
              with imagePrompts
```

### Static Stories (Pre-built Themes)

For dinosaur, tooth-fairy, and moon-princess themes, the story text and image prompts are hardcoded templates with `{childName}` placeholders:

```typescript
// Example from static-stories/dinosaur.ts
{
  pageNumber: 2,
  text: `One sunny afternoon, ${childName} was playing in the
         backyard when ${pronoun} noticed something strange...`,
  imagePrompt: 'A sunny backyard garden with a large old oak tree,
                a swirling magical portal glowing with emerald green
                and golden light...',
  layout: 'full-bleed-text-bottom',
  imageComposition: 'keep main subject in upper two-thirds...'
}
```

**Why static?** Using pre-written stories means the scene backgrounds are carefully crafted and tested. Each imagePrompt is hand-tuned to work well with PhotoMaker.

### Custom Stories (Gemini 2.5 Flash)

For the "Write Your Own Story" theme, the user's story idea is sent to Gemini:

```typescript
// Gemini API call
Model: "gemini-2.5-flash"
Response format: "application/json"
```

**The prompt includes:**
1. User's story idea (their input)
2. Story arc structure (intro → rising action → climax → resolution)
3. Character consistency rules (NEVER merge child with animals)
4. Image prompt writing rules (detailed scenes, no other humans)
5. Layout instructions (8 layout types)
6. JSON output schema

### Story Output JSON Structure

```json
{
  "title": "Rakesh's Roaring Adventure!",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Story text for this page...",
      "imagePrompt": "Detailed scene description for image generation...",
      "sceneDescription": "Brief description of what's happening...",
      "layout": "full-bleed-text-bottom",
      "imageComposition": "keep main subject in upper two-thirds..."
    }
    // ... 16 pages total
  ]
}
```

### The 8 Page Layout Types

| Layout | Description | When Used |
|--------|-------------|-----------|
| `chapter-title` | Title page, NO image generated | Page 1 only |
| `full-bleed-text-bottom` | Full image, text at bottom | Action scenes, establishing shots |
| `full-bleed-text-top` | Full image, text at top | Scenes with action at bottom |
| `full-bleed-text-center` | Full image, centered text | Magical/dreamy moments |
| `image-left-text-right` | Image left, text right | Dialogue, introductions |
| `image-right-text-left` | Image right, text left | Alternate with above |
| `dramatic-image-only` | Full image, NO text overlay | Climax moments (max 2 per book) |
| `text-heavy-vignette` | Small circular image, lots of text | Reflective moments |

---

## STEP 4: Reference Sheet Generation (PhotoMaker)

**File**: `apps/backend/src/image/image.service.ts` → `generateReferenceSheet()`

A reference sheet is generated BEFORE any page images. This helps establish the character's look.

### Exact API Call

```typescript
Model: "tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769"

Input: {
  prompt: "A full body character reference sheet of a img child,
           multiple angles, front view and side view, neutral pose,
           3d CGI, Pixar style, children's book character",
  input_image: "{replicate-hosted-photo-url}",
  style_name: "Disney Charactor",     // Note: typo is intentional!
  style_strength_ratio: 40,
  num_steps: 30,
  guidance_scale: 5,
  num_outputs: 1,
  negative_prompt: "{NEGATIVE_PROMPT}",
  disable_safety_checker: true
}
```

### Photo URL Resolution

The child's photo is stored locally at `/uploads/{uuid}.jpg`. But Replicate's API needs a publicly accessible URL. So:

```
1. Read photo from disk
2. Upload to Replicate's file hosting:
   POST https://api.replicate.com/v1/files
   Authorization: Bearer {REPLICATE_API_TOKEN}
   Body: FormData with photo as 'content'
3. Get back public URL (data.urls.get)
4. Cache this URL for all subsequent page generations
```

---

## STEP 5: Page Image Generation (PhotoMaker)

**File**: `apps/backend/src/image/image.service.ts` → `generatePageImage()`

This is the CORE of the AI pipeline. For each of the 16 pages, an image is generated using PhotoMaker with the child's face embedded into a Disney/Pixar-style scene.

### Two Generation Modes

```
For each page:
       |
       +-- layout == "chapter-title"?
       |       YES -> SKIP (no image needed)
       |
       +-- layout == "dramatic-image-only"?
       |       YES -> MODE 2: Scene-Only (NO face embedding)
       |              Dinosaurs, landscapes, action scenes
       |              The "img" trigger word is NOT used
       |              Child's face does NOT appear on animals
       |
       +-- All other layouts?
               YES -> MODE 1: With Face Embedding
                      Child appears in scene with face identity
                      The "img" trigger word IS used
```

---

### MODE 1: With Face Embedding (Normal Pages)

This is used for most pages where the child is the main character.

#### Step-by-Step Prompt Construction

```
ORIGINAL imagePrompt from story:
"A sunny backyard garden with a large old oak tree,
 a swirling magical portal glowing with emerald green
 and golden light, butterflies dancing around the portal,
 lush green grass, warm afternoon sunlight"


STEP A: Strip human references from scene
=========================================
Remove: "the child", "the kid", "the boy", "the girl"
Remove: pronouns + family ("his mother", "her friend")
Remove: human words ("woman", "man", "adult", "parent")
Remove: human actions ("waving goodbye to a person")

Result (scenePrompt):
"A sunny backyard garden with a large old oak tree,
 a swirling magical portal glowing with emerald green
 and golden light, butterflies dancing around the portal,
 lush green grass, warm afternoon sunlight"


STEP B: Parse character description
====================================
Input: "short dark brown hair, medium brown skin, big brown eyes, boy
        ---
        A boy with short straight dark brown hair, medium brown skin,
        round face with large dark brown eyes, thick eyebrows, small
        nose, wearing a bright orange t-shirt, khaki shorts"

Split on "---":
  identityTag = "short dark brown hair, medium brown skin,
                 big brown eyes, boy"
  fullDescription = "A boy with short straight dark brown hair..."


STEP C: Build final prompt
===========================
Template:
"A img {genderTag} child with {identityTag},
 in a scene: {scenePrompt},
 the child has {fullDescription}.
 Composition: {imageComposition}.
 3d CGI, Pixar style, detailed background,
 full scene illustration, vibrant colors"

Final prompt:
"A img boy child with short dark brown hair, medium brown skin,
 big brown eyes, boy, in a scene: A sunny backyard garden with
 a large old oak tree, a swirling magical portal glowing with
 emerald green and golden light, butterflies dancing around the
 portal, lush green grass, warm afternoon sunlight, the child
 has A boy with short straight dark brown hair, medium brown
 skin, round face with large dark brown eyes, thick eyebrows,
 small nose, wearing a bright orange t-shirt, khaki shorts.
 Composition: keep main subject in upper two-thirds.
 3d CGI, Pixar style, detailed background, full scene
 illustration, vibrant colors"
```

#### Exact PhotoMaker API Call (Mode 1)

```typescript
replicate.run("tencentarc/photomaker-style:467d062...", {
  input: {
    prompt: fullPrompt,           // Built above
    input_image: publicPhotoUrl,   // Child's photo (Replicate-hosted)
    style_name: "Disney Charactor", // Intentional typo - model's enum
    style_strength_ratio: 40,      // Balance: identity vs style
    num_steps: 30,                 // Diffusion steps
    guidance_scale: 5,             // How closely to follow prompt
    num_outputs: 1,                // One image per page
    negative_prompt: NEGATIVE_PROMPT,
    disable_safety_checker: true
  }
})
```

---

### MODE 2: Scene-Only / No Face Embedding (Dramatic Pages)

Used for `dramatic-image-only` layout — pure dinosaur scenes, epic landscapes.

```
WHY: When PhotoMaker sees "img" + detailed dinosaur description,
     it sometimes puts the child's FACE on the dinosaur (chimera).
     By removing "img" from the prompt, the face is NOT embedded
     into any subject.

HOW: Same model, same parameters, but:
     - NO "img" trigger word in prompt
     - input_image still passed (model requires it) but ignored
     - Pure scene description only
```

#### Exact API Call (Mode 2)

```typescript
// Prompt has NO "img" trigger word
sceneOnlyPrompt = `${imagePrompt}, 3d CGI, Pixar style,
  cinematic wide shot, detailed background, vibrant colors,
  epic scene`

replicate.run("tencentarc/photomaker-style:467d062...", {
  input: {
    prompt: sceneOnlyPrompt,       // NO "img" keyword!
    input_image: publicPhotoUrl,   // Required but face NOT used
    style_name: "Disney Charactor",
    style_strength_ratio: 40,
    num_steps: 30,
    guidance_scale: 5,
    num_outputs: 1,
    negative_prompt: NEGATIVE_PROMPT +
      ", human face on animal, child face on dinosaur,
         human features on creature",
    disable_safety_checker: true
  }
})
```

---

### Image Download & Storage

```
1. PhotoMaker returns URL to generated image
2. Fetch image from Replicate URL
3. Convert to Buffer
4. Save to /uploads/{orderId}-page-{pageNumber}.png
5. Store relative path in database (Page.imageUrl)
```

### Rate Limiting

```
- 12-second delay between each PhotoMaker API call
- Prevents Replicate rate limiting
- 16 pages = ~3-4 minutes total generation time
- Page 1 (chapter-title) is skipped
- dramatic-image-only pages also have 12s delay
```

### Retry Logic

```
First pass: Generate all 16 pages
       |
       v
Check for FAILED pages
       |
       +-- Any failures?
               YES -> Retry each failed page once
                      (same 12s delay between retries)
               NO  -> Continue to PDF
       |
       v
Final check:
  - All COMPLETE -> Mark order PREVIEW_READY
  - <= 3 failed  -> Mark PREVIEW_READY anyway (partial)
  - > 3 failed   -> Mark order FAILED
```

---

## STEP 6: PDF Assembly

**File**: `apps/backend/src/pdf/pdf.service.ts`

```
Uses: PDFKit library
Size: A4 (595.28 x 841.89 points)

Structure:
  1. Cover Page
     - Background: First story page image (dimmed 35%)
     - Colors: Dark purple (#1a0533) gradient
     - Text: Book title (PlayfairDisplay-Bold, 42pt)
     - Text: "Starring {childName}" (DancingScript, 18pt)

  2. Story Pages (x16)
     - Background: Page image (full bleed)
     - Overlay: Dark gradient (transparent -> #0a0514)
     - Text: Story text (CrimsonText, 16pt, white, centered)
     - Child name: Bold whenever it appears

  3. Back Cover
     - Background: Last page image (dimmed)
     - Text: "The End" (PlayfairDisplay-Bold, 36pt)

Custom Fonts:
  - PlayfairDisplay-Bold.ttf (titles)
  - CrimsonText-Regular.ttf (body text)
  - CrimsonText-Italic.ttf (accents)
  - DancingScript-Regular.ttf (decorative)
```

---

## PHOTOMAKER DEEP DIVE

### What is PhotoMaker?

PhotoMaker-Style is a model by TencentARC that generates images in specific artistic styles while preserving a person's face identity from a reference photo.

### Model ID

```
tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769
```

### How the "img" Trigger Word Works

```
PhotoMaker uses a special trigger word "img" in the text prompt.
When the model sees "img", it takes the face from input_image
and embeds it into whatever subject is described near "img".

RULE: Only ONE "img" per prompt.
      Multiple "img" = API error.

WHERE "img" goes matters:
  "A img child with brown hair..."
       ^-- Face goes on the child

  "A img dinosaur with green scales..."
       ^-- Face goes on the dinosaur! (BAD)

That's why "img" MUST be followed by child description,
not animal/creature description.
```

### All Parameters Explained

| Parameter | Value | What It Does |
|-----------|-------|-------------|
| `prompt` | See above | Text description of desired image |
| `input_image` | Child's photo URL | Reference face for identity embedding |
| `style_name` | `"Disney Charactor"` | Art style preset (typo is intentional — it's the model's enum value) |
| `style_strength_ratio` | `40` | How strongly to apply the Disney style. Lower = more realistic face but less stylized. Higher = more stylized but may lose face features. **35-40 is the sweet spot.** |
| `num_steps` | `30` | Number of diffusion denoising steps. More = better quality but slower. 30 is good balance. |
| `guidance_scale` | `5` | How strictly to follow the text prompt. Higher = more literal but can look artificial. 5 is balanced. |
| `num_outputs` | `1` | Number of images to generate per call |
| `negative_prompt` | See below | Things to AVOID in the image |
| `disable_safety_checker` | `true` | Disable NSFW filter (needed for children's content which sometimes triggers false positives) |

### style_strength_ratio Experiments

| Value | Result |
|-------|--------|
| 20 | Great backgrounds but lost face identity (skin tone, features wrong) |
| 35 | Good balance — used initially |
| 40 | Current setting — slightly better identity preservation |
| 50+ | Too stylized, face becomes generic cartoon |

---

## PROMPT ENGINEERING BIBLE

### The Golden Prompt Structure

```
"A img {gender} child with {IDENTITY_TAG},
 in a scene: {SCENE_DESCRIPTION},
 the child has {FULL_DESCRIPTION}.
 Composition: {LAYOUT_HINT}.
 3d CGI, Pixar style, detailed background,
 full scene illustration, vibrant colors"
```

### Why Each Part Matters

```
PART 1: "A img {gender} child with {IDENTITY_TAG}"
         ^^^
         |-- "img" trigger: tells PhotoMaker WHERE to put the face
         |-- IMMEDIATELY followed by identity features
         |-- Gender word prevents gender drift

PART 2: "in a scene: {SCENE_DESCRIPTION}"
         ^^^^^^^^^^^^
         |-- "in a scene:" signals this is the BACKGROUND
         |-- Detailed environment, creatures, lighting
         |-- Dinosaurs/creatures described here (not near "img")

PART 3: "the child has {FULL_DESCRIPTION}"
         ^^^^^^^^^^^^^^^
         |-- REINFORCEMENT of identity features
         |-- Includes outfit for consistency
         |-- Prevents model from "forgetting" features

PART 4: "Composition: {LAYOUT_HINT}"
         ^^^^^^^^^^^^^
         |-- Tells model how to frame the shot
         |-- "keep subject in upper two-thirds" etc.

PART 5: "3d CGI, Pixar style, detailed background..."
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         |-- Quality/style keywords
         |-- "detailed background" prevents plain backgrounds
         |-- "full scene illustration" forces wide scene (not portrait)
```

### Scene Prompt Cleaning (What Gets Stripped)

Before the scene description goes into the final prompt, these patterns are removed:

```
REMOVED:
  "the child", "the kid", "the boy", "the girl"
  "a child", "a kid", "a boy", "a girl"
  "his/her/their mother/father/friend/family"
  "woman", "man", "adult", "person", "people"
  "waving goodbye to a person"
  "holding hands with a child"
  "another child", "second child", "two children"

KEPT:
  All dinosaur descriptions
  All creature/animal descriptions
  Environment details (jungle, cave, river)
  Lighting descriptions
  Object descriptions (crystals, portal)
```

### Image Prompt Writing Rules (for Custom Stories)

When Gemini generates image prompts for custom stories, these rules apply:

1. START with the LOCATION/SETTING
2. Include SPECIFIC visual landmarks if real-world location mentioned
3. Describe ALL animals/creatures with at least 3 visual details
4. Refer to child as "the child" (gets stripped later)
5. NEVER include other human characters
6. Any other characters must be animals/creatures/fantasy beings
7. Location + key objects should be 70% of the prompt
8. Include specific lighting and atmosphere details

### Good vs Bad Image Prompts

```
GOOD (rich scene, separated child, detailed dinosaur):
"A lush prehistoric jungle with towering ferns and enormous
 ancient trees, soft green moss covering the ground, colorful
 exotic flowers, golden sunbeams breaking through canopy,
 a cute tiny baby Parasaurolophus with big round amber eyes
 and a small curved crest sitting nearby on the ground"

BAD (vague, will produce generic background):
"The child in a jungle with a dinosaur"

BAD (child described with animal features - causes chimera):
"The child with dinosaur horns exploring a cave"

BAD (multiple humans - causes extra people):
"The child and their parents walking through the jungle"
```

---

## NEGATIVE PROMPT BREAKDOWN

The negative prompt tells PhotoMaker what to AVOID generating:

```
FULL NEGATIVE PROMPT:
"multiple people, two people, two children, two kids,
 second child, another child, duplicate person, twin,
 siblings, crowd, group, adult, woman, man, couple,
 extra person,
 human face on animal, animal face on human,
 human-animal hybrid, chimera, centaur,
 horns on child, tail on child, animal ears on child,
 scales on child, fur on child, snout on child,
 claws on child, wings on child,
 child merged with animal, child fused with dinosaur,
 animal body parts on human,
 scary, dark, violent, blood, horror,
 realistic photo, photorealistic,
 blurry, low quality, deformed, ugly, bad anatomy,
 extra limbs, extra hands, extra arms, extra fingers,
 mutated hands, fused fingers, merged bodies,
 fused characters, body horror, conjoined, disfigured,
 malformed limbs, missing fingers, too many fingers,
 cropped head, out of frame,
 gender swap, wrong gender"
```

### Categories Explained

| Category | Terms | Why |
|----------|-------|-----|
| **Anti-Multiple People** | multiple people, two children, crowd, group | Prevents extra humans appearing |
| **Anti-Chimera** | human face on animal, chimera, horns on child, tail on child, scales on child | Prevents child's face/body merging with animals |
| **Anti-Horror** | scary, dark, violent, blood | Children's book - keep it friendly |
| **Anti-Realism** | realistic photo, photorealistic | Force Disney/Pixar style |
| **Anti-Deformity** | extra limbs, mutated hands, fused fingers | Prevent anatomy errors |
| **Anti-Gender-Drift** | gender swap, wrong gender | Keep consistent gender appearance |

---

## WHAT FAILED & LESSONS LEARNED

### Model Experiments

| Model | Result | Why It Failed |
|-------|--------|--------------|
| **FLUX PuLID** | Good face but chimera artifacts | Merged child with dinosaurs (body parts fused) |
| **PhotoMaker (style_strength: 20)** | Great backgrounds | Lost face identity (wrong skin tone, features) |
| **PhotoMaker (style_strength: 50+)** | Strong style | Face became generic cartoon, lost identity |
| **Composite (FLUX bg + PhotoMaker char)** | Mechanical look | Character looked pasted onto background |

### Prompt Experiments

| Approach | Result | Why It Failed |
|----------|--------|--------------|
| Character description BURIED in scene | Portrait-only images | Model focused on face, ignored scene |
| "SEPARATELY in the background: [scene]" | No backgrounds at all | Model interpreted as portrait request |
| Multiple `img` triggers | API error | PhotoMaker only supports one `img` per prompt |
| Human words in scene ("family", "parents") | Extra people generated | PhotoMaker creates humans from human words |
| Dinosaur described near `img` | Child's face on dinosaur | `img` embeds face on nearest described subject |
| "the child is a HUMAN with NO animal features" | Plain background | Too much focus on "human" description, ignored scene |

### What Works (Current Approach)

```
1. Identity tag RIGHT AFTER "img" (face goes on child, not animal)
2. Scene description AFTER "in a scene:" (naturally integrated)
3. Identity reinforced at END ("the child has...")
4. "dramatic-image-only" pages skip "img" entirely (pure dinosaur scenes)
5. Negative prompt handles anti-chimera (not prompt structure)
6. style_strength_ratio: 40 (good balance)
7. Static stories for known themes (tested, reliable prompts)
```

---

## CONFIGURATION REFERENCE

### Environment Variables

```bash
# Google Gemini API (story generation + character description)
GEMINI_API_KEY=your-gemini-api-key

# Replicate API (PhotoMaker image generation)
REPLICATE_API_TOKEN=your-replicate-token

# PostgreSQL database
DATABASE_URL=postgresql://user:pass@localhost:5432/storybook_dev

# Redis (job queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Image Generation Config

```typescript
// packages/shared/src/constants/index.ts

IMAGE_GEN_CONFIG = {
  model: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
  styleName: 'Disney Charactor',  // Model's enum value (typo is intentional)
  styleStrengthRatio: 40,         // Identity vs style balance
  numSteps: 30,                   // Diffusion steps
  guidanceScale: 5,               // Prompt adherence
  numOutputs: 1,                  // Images per call
}

TOTAL_PAGES = 16                  // Pages per book
```

### Timing

```
Character description (Gemini Vision): ~3-5 seconds
Story generation (Gemini Flash):       ~5-10 seconds (custom only)
Reference sheet (PhotoMaker):          ~15-20 seconds
Per page image (PhotoMaker):           ~15-20 seconds
Inter-page delay:                      12 seconds (rate limiting)

Total for 16-page book:               ~7-10 minutes
```

---

## FILE MAP

### AI-Related Backend Files

```
apps/backend/src/
├── image/
│   └── image.service.ts          # ALL AI image logic
│       ├── describeCharacter()   # Gemini Vision → character description
│       ├── generateReferenceSheet() # PhotoMaker reference sheet
│       ├── generatePageImage()   # PhotoMaker page images (both modes)
│       ├── runPhotoMaker()       # Mode 1: with face embedding
│       ├── runSceneOnly()        # Mode 2: without face embedding
│       ├── resolvePublicUrl()    # Upload local photo to Replicate
│       └── downloadAndSave()     # Save generated image to disk
│
├── story/
│   ├── story.service.ts          # Gemini Flash story generation
│   ├── prompts/
│   │   ├── index.ts              # Theme → prompt builder routing
│   │   ├── dinosaur.ts           # Dinosaur theme prompt
│   │   ├── tooth-fairy.ts        # Tooth fairy theme prompt
│   │   ├── moon-princess.ts      # Moon princess theme prompt
│   │   ├── custom.ts             # Custom story prompt
│   │   └── layout-instructions.ts # 8 layout types + rules
│   └── static-stories/
│       ├── index.ts              # Static story selector
│       ├── dinosaur.ts           # 16-page dinosaur template
│       ├── tooth-fairy.ts        # 16-page tooth fairy template
│       └── moon-princess.ts      # 16-page moon princess template
│
├── queue/
│   └── orchestrator.processor.ts # Main pipeline orchestrator
│       └── process()             # Steps 1-6 in sequence
│
├── pdf/
│   └── pdf.service.ts            # PDF assembly with PDFKit
│
└── upload/
    └── upload.service.ts         # Photo file handling
```

### Configuration Files

```
packages/shared/src/
├── constants/index.ts            # IMAGE_GEN_CONFIG, NEGATIVE_PROMPT,
│                                 # THEMES, TOTAL_PAGES, BOOK_DIMENSIONS
├── validation/index.ts           # Zod schemas for all data
└── types/index.ts                # TypeScript types & enums
```

---

## QUICK REFERENCE: RECREATE THIS SYSTEM

To recreate the same output in your own code:

### 1. Get API Keys
- Google Gemini API key (for story + vision)
- Replicate API token (for PhotoMaker)

### 2. Character Description
```
Call Gemini 2.5 Flash Vision with child's photo
Ask for: hair (exact length+color), skin tone (exact), eyes, gender
Format: "identity tag --- full description"
```

### 3. Image Generation
```
Call PhotoMaker-Style on Replicate:
  model: tencentarc/photomaker-style:467d062...
  style_name: "Disney Charactor"
  style_strength_ratio: 40
  num_steps: 30
  guidance_scale: 5

Prompt formula:
  "A img {gender} child with {identity},
   in a scene: {scene},
   the child has {full_description},
   3d CGI, Pixar style, detailed background,
   full scene illustration, vibrant colors"

For scenes WITHOUT the child (dinosaurs, landscapes):
  Same model but NO "img" in prompt
  Face won't be embedded
```

### 4. Key Rules
```
- Only ONE "img" per prompt
- Identity tag goes RIGHT AFTER "img"
- Scene description goes AFTER "in a scene:"
- Strip all human words from scene description
- Use negative prompt to prevent chimeras
- style_strength_ratio 40 is the sweet spot
- 12-second delay between API calls
```

---

*Document generated from codebase analysis of the Once Upon a Time project.*
*All code references point to: /Users/nikhilpn/Downloads/nikhil-proj/*
