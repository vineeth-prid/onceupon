# Image Generation — Working Recipe & Failure Modes

This document captures the **working configuration** for the PhotoMaker image-generation pipeline (the one that produced Riya's Sparkling Christmas Wish on 2026-03-17 and the April-1 `f41bf6d` Disney/Pixar output). It also documents the failure modes we've hit and the prompt-engineering rules that prevent them.

Update this doc whenever you change `IMAGE_GEN_CONFIG`, `NEGATIVE_PROMPT`, the prompt assembly in `image.service.ts`, or any static-story prompt convention.

---

## 1. The PhotoMaker recipe

**Model**: `tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769`

**Config** (`packages/shared/src/constants/index.ts` → `IMAGE_GEN_CONFIG`):
```ts
{
  styleStrengthRatio: 30,   // Lower = stronger identity preservation. Was 40 — caused green/amber color bleed onto the child's eyes on dragon-heavy pages. 30 keeps Disney style and locks identity hard. Don't go below 25 or backgrounds become flat.
  numSteps: 30,
  guidanceScale: 5,
  numOutputs: 1,
}
```

**`style_name`**: `'Disney Charactor'` (intentional typo — that's the literal enum value PhotoMaker accepts).

**Gemini Vision** (character description): pinned at `gemini-2.5-flash`. Do **not** use `gemini-flash-latest` — its output drifts over time and breaks identity consistency across pages.

**Style suffix position**: at the **END** of the prompt, not the start. Reverting this is what restored quality after the April-1 baseline.

**Negative prompt**: see `NEGATIVE_PROMPT` in shared constants. Includes: anti-chimera ("dragon-headed child", "human-bodied dragon", "wings on child"), anti-color-leak ("wrong eye color", "wrong skin color"), anti-multi-person, standard quality/anatomy guards.

---

## 2. The `img` trigger word — what works for our integration

The [TencentARC README](https://github.com/TencentARC/PhotoMaker) says the trigger should *follow* the class word (`boy img`, `man img`). However, **in our integration we use `img` BEFORE the class word** (`A img boy child with...`) — this is the form that produced Riya's gold-standard render and the most recent on-character "rak" output the user validated. We tested swapping to `boy img` per the docs and the user reported a quality regression, so we reverted.

**Working syntax** (`apps/backend/src/image/image.service.ts:206`):
```ts
const imgKeyword = isPhotoMaker ? 'img ' : '';
fullPrompt = `A ${imgKeyword}${genderTag} child with ${identityTag}, in a scene: ${scenePrompt}, the child has ${fullDescription}`;
```

The reference-sheet prompt uses the same order: `"a img child"`. Don't change either without an A/B test on a real photo.

---

## 3. Prompt assembly (the recipe in code)

`apps/backend/src/image/image.service.ts` → `generatePageImage()` builds:

```
A img {gender} child with {identityTag}, in a scene: {scrubbed scenePrompt}, the child has {fullDescription}
[ + . Composition: {imageComposition} ]
, {style.promptSuffix}
```

Where:
- **`identityTag`**: 10-15 word identity from Gemini Vision (hair + skin + eyes + gender). Example: `"long curly dark brown hair, warm caramel skin, large dark brown eyes, girl"`.
- **`fullDescription`**: full description including outfit (50 words max).
- **`scrubbed scenePrompt`**: scene with human-bystander tokens stripped by regex (mother, parent, friend, woman, man, etc.).
- **Style suffix**: e.g. `"3d CGI, Pixar style, detailed background, full scene illustration, vibrant colors"` — appended at the **END**.

We tried automating an "anti-chimera safety clause" injection for non-human creature scenes; it pushed quality down on the simple pages and was reverted. The real fix for multi-character pages is the alternative model path described in §6 below.

---

## 4. Layout-driven routing

`generatePageImage` switches on `layout`:

| Layout | Behavior |
|---|---|
| `dramatic-image-only` | Calls `runSceneOnly` — generates the scene **without** face embedding. Use for cinematic wide shots (flying, distant, action) where the child's face wouldn't be central anyway. Safer for pages with multiple non-human characters. |
| All others | Calls `runPhotoMaker` with the assembled prompt above. Face is embedded. |

**Rule for static-story authors:** if a scene has the child + a large/dominant non-human creature, use `dramatic-image-only` OR rewrite the scene so the child is unambiguously the foreground subject and the creature is partial/background.

---

## 5. Known failure modes & mitigations

### 5.1 Chimera (face fused with the wrong subject)

**Symptom**: child's face appears on the dragon's body, or the child grows wings/scales/tail.
**Cause**: PhotoMaker assigns the face identity to whichever subject is most prominent in the prompt. When a non-human creature is described in detail before the child, the face migrates.
**Fixes**:
1. Put the child first in the scene description: `"the child wearing a red cape and blue shirt in the foreground, in the background a dragon..."`
2. Use spatial separators: `"on the LEFT", "in the foreground center", "with at least an arm-length of space between them"`.
3. Keep the creature partial / out-of-frame for high-risk pages: `"only the dragon's head visible at the top edge"`.
4. The runtime anti-chimera clause does the rest.
5. Last resort: change layout to `dramatic-image-only` to skip face embedding entirely.

### 5.2 Eye color / skin / hair drift

**Symptom**: brown-eyed boy renders with green or amber eyes; outfit colors flip to match scene.
**Cause**: dominant scene colors (e.g. heavy "emerald green" descriptors on a dragon) leak into the child's features. Identity tag gets out-weighed by scene tokens.
**Runtime fixes (already in `image.service.ts`)**:
1. **Color-bleed sanitizer** (`dampenColorBleed`): caps each color at 3 mentions per scene prompt before sending to PhotoMaker. PhotoMaker overweights repeated tokens; this prevents `"emerald green dragon, green wings, green flame, green scales"` from drowning the identity tag.
2. **Color-exclusion identity anchor**: extracts the child's actual eye/hair color (via `extractEyeColor` / `extractHairColor`), detects which scene colors conflict (via `detectSceneColors`), and appends an explicit exclusion clause at the END of the prompt: `"the boy's eyes are brown (NOT green, NOT amber); the boy's hair is brown (NOT green, NOT amber)"`. The diffuser attends most heavily to the last tokens.
3. **Lower `styleStrengthRatio` (30)**: PhotoMaker docs say lower = stronger identity. We dropped this from 40 → 30 specifically to fight color bleed; 30 still produces good Disney stylization.
**Author fixes (per static-story prompt)**:
1. Reduce the density of the leaking color (`"green dragon"` once, not `"emerald green"` four times) — the sanitizer is a safety net, not a license.
2. Don't give creatures human-overlapping features — avoid describing dragon eyes with words also used for the child (`"amber eyes", "warm gentle eyes"` etc.).
3. Outfit consistency: name outfit colors precisely and identically across pages (`"red superhero cape and blue shirt"` everywhere — not switching to `"red cape"` then `"red coat"`).
4. For close-up bedroom/intimate scenes: lock ambient lighting to neutral warm tones (`"amber lamplight"`, `"golden glow"`) — don't have the dragon's wing be a glowing green lamp casting onto the child's face.

### 5.3 Multiple humans

**Symptom**: two children appear, or random adults show up.
**Cause**: scene mentions human bystanders.
**Fixes**:
1. The regex strip in `image.service.ts` removes `mother`, `father`, `parent`, `friend`, `woman`, `man`, `crowd`, `family members`, etc. before the prompt is sent.
2. Static-story authors should refer to the protagonist as `"the child"` only — the regex strip relies on this.
3. NEGATIVE_PROMPT lists: `multiple people, two children, second child, another child, crowd, group, adult, woman, man`.

### 5.4 Identity inconsistency across pages

**Symptom**: the same child looks like a different person on different pages.
**Cause**: prompts vary too much. Identity tag isn't repeated. Outfit named inconsistently.
**Fixes**:
1. Identity tag from Gemini Vision is included at the start of every prompt (`"A boy img with {identityTag}, ..."`).
2. The full description is repeated mid-prompt (`"the boy has {fullDescription}"`).
3. The anti-chimera clause repeats `identityTag` again at the end when applicable.
4. Static-story prompts should use the **exact same outfit wording** on every page (e.g. `"a flowing red superhero cape and a blue shirt"`).

---

## 6. Multi-character pages — known weakness, alternative model path

PhotoMaker is a single-subject identity-preservation model. When a scene has the child + a non-human creature (dragon, dinosaur, large fairy, beast), it can:
- Transfer the face identity to the larger / more prominent subject (full chimera — the face appears on the dragon's body).
- Leak dominant scene colors into the child's eyes / skin / hair.
- Drop or alter the outfit.

No prompt-engineering trick reliably fixes this. The permanent fix is to use a different model for these pages. We've added a second `ILLUSTRATION_STYLES` entry — `kontext-disney` — that routes to **FLUX.1 Kontext Pro** (`black-forest-labs/flux-kontext-pro`), Black Forest Labs' image-edit model whose headline feature is character preservation across multiple scenes from a single reference photo. Replicate's [official consistent-characters guide](https://replicate.com/blog/generate-consistent-characters) recommends Kontext Pro as the top creative-transformation choice.

To use it: set `illustrationStyle: 'kontext-disney'` on the order. The routing block in `image.service.ts` detects `flux-kontext` and calls `runFluxKontext()` with `{ prompt, input_image, aspect_ratio: '1:1', output_format: 'png' }`.

Other options if Kontext also struggles on a particular scene type:
- **Two-pass face-swap**: generate the scene with a generic child via Flux Schnell, then pipe through `easel/advanced-face-swap` (already wired in family mode at `image.service.ts` for multi-person rendering). Bypasses identity-binding entirely. Slower (2 calls per page), occasional hairline seams.
- **Custom Flux LoRA per child**: train a small LoRA from one photo (~5-10 min, ~$1-2) and use for all 16 pages. Highest consistency, highest cost.
- **`runwayml/gen4-image`**: Replicate's top pick for *photorealistic* consistent characters. Less of a fit for our Disney/Pixar look but worth knowing.

## 7. Rules for new static stories

When writing a new file under `apps/backend/src/story/static-stories/`:

1. **Function signature** must be `(childName: string, _childAge: number, childGender: string) => StoryOutputInput`. Prefix `_childAge` with underscore — TS won't flag the unused parameter.
2. **16 pages**, each with: `pageNumber`, `text`, `imagePrompt`, `sceneDescription`, `layout`, `imageComposition`.
3. **Refer to the protagonist as "the child"** in `imagePrompt`. The runtime regex strip relies on this. Use `${childName}` and pronouns in the `text` field only.
4. **Outfit consistency**: pick one outfit (e.g. `"red superhero cape and blue shirt"`) and repeat it identically in every `imagePrompt`. Don't mention any clothing detail that conflicts with the child's photo.
5. **No human bystanders.** Villagers must be `"tiny dark silhouetted figures in distant cottage windows"` only — never humans in the foreground.
6. **Non-human creatures** (dragons, dinosaurs, fairies, etc.):
   - Describe with explicit non-human anatomy: `"green scales, orange wings, long curving tail, four clawed feet"`.
   - Do NOT use overlapping human descriptors on the creature (`"gentle eyes"`, `"smile"`, `"face"`).
   - Place spatially separate from the child: `"on the LEFT", "with arm-length space between them", "at the back edge of the frame"`.
   - Reduce dominant color words that could leak: prefer `"green dragon"` over `"emerald green"` repeated.
7. **High-drama / multi-creature pages** (chase, big creature reveal, flight): use `layout: 'dramatic-image-only'`. The runtime will skip face embedding and produce a cinematic wide shot.
8. **Layouts available**: `chapter-title`, `full-bleed-text-bottom`, `full-bleed-text-top`, `full-bleed-text-center`, `image-left-text-right`, `image-right-text-left`, `dramatic-image-only`.
9. **Register** the story in `apps/backend/src/story/static-stories/index.ts` under the same key as the catalog `slug`.

---

## 8. Quality benchmark

Riya's Sparkling Christmas Wish (Order `2b061b35-2f4e-48a7-ae4f-99f7aff70f0c`, rendered 2026-03-17 ~20:33 IST under commit `5721e06` or `1fbac14`) is the visual gold standard. The page images are at `apps/backend/uploads/2b061b35-2f4e-48a7-ae4f-99f7aff70f0c-page-*.png`.

If a recipe change needs to be validated, regenerate from this order's stored `characterDescription` + page `imagePrompt` and compare to those reference images side-by-side.

---

## 9. What we tried and what didn't work

- **Flux PuLID** (commit `2f3cf05` and earlier): merged child with dinosaurs/dragons (chimera). Replaced by PhotoMaker on `5721e06`.
- **Style suffix at start of prompt** (introduced after April-1, reverted): caused subtle identity drift across pages.
- **`gemini-flash-latest`** (a floating tag): produced different identity descriptions over time. Pinned to `2.5-flash`.
- **`style_strength_ratio: 20`**: lost identity entirely (skin tone, features wrong).
- **`style_strength_ratio: 40`** (the prior default): produced great solo pages but bled scene colors (green dragon → green eyes) on multi-character close-ups. Replaced by 30 which trades a hint of stylization for hard identity locking.
- **Multiple `img` triggers in one prompt**: API error from PhotoMaker.
- **Composite approach** (Flux background + PhotoMaker character + sharp overlay): too mechanical, character looked pasted on.
- **`img` keyword AFTER the class word** (`"A boy img child with..."`): per docs this should be the right form, but in our integration it produced a noticeable quality regression. Reverted to `"A img boy child with..."` which is what produced Riya's gold-standard output and the most recent on-character renders.
- **Auto-injected anti-chimera safety clause** (May 2026): tried appending `"The boy is fully human… no wings, no scales… two distinct beings"` to every prompt that mentioned a non-human creature. Hurt overall quality — the prompt became too long and constrained. Removed; permanent fix is the Kontext path in §6.
- **Restructured static-story prompts with explicit spatial framing** (`"on the LEFT, the child... on the RIGHT, the dragon..."`): made the page-1/page-2 quality drop. Reverted to the original "rich descriptive" prompts.
