# Once Upon a Time - Project Context

## Project Overview
Personalized children's storybook platform where a child's photo is used to generate AI-illustrated story pages in Disney/Pixar style.

## Tech Stack
- **Monorepo**: pnpm + Turborepo
- **Backend**: NestJS + Prisma ORM + BullMQ (Redis) + PostgreSQL 16
- **Frontend**: React 19 + Vite + react-pageflip (book animation)
- **Shared**: TypeScript package (`@bookmagic/shared`) with constants, validation, types
- **AI Models**:
  - **Gemini 2.5 Flash** (Google) — Story text generation + character description via Vision API
  - **PhotoMaker-Style** (TencentARC on Replicate) — Disney/Pixar character image generation with face identity

## Image Generation Pipeline

### Architecture
```
Upload Photo → Gemini Vision (character description) → Gemini Flash (story + scene prompts)
     ↓
PhotoMaker (reference sheet, style_strength: 35, portrait)
     ↓
PhotoMaker (per page, style_strength: 35, scene + character)
     ↓
Preview (react-pageflip book)
```

### How PhotoMaker Works
- Uses `img` trigger word in prompt to embed face identity from `input_image`
- **CRITICAL**: Only ONE `img` allowed per prompt — multiple triggers cause API error
- `style_name: "Disney Charactor"` (note: typo is intentional, it's the model's enum value)
- `style_strength_ratio: 35` gives best balance of identity + scene quality
- `input_image` receives the child's uploaded photo URL (uploaded to Replicate's file hosting)

### Prompt Structure (what works)
```
"A img child, [character description from Gemini Vision], in a scene: [scene description], 3d CGI, Pixar style, detailed background, full scene illustration, vibrant colors"
```

Key rules:
1. Character description (skin, hair, eyes) goes RIGHT AFTER `img` — this is critical for skin tone accuracy
2. Scene description comes after "in a scene:" — environment, creatures, lighting
3. All human references stripped from scene prompt (prevents extra people)
4. Non-human elements (dinosaurs, fairies, animals) are preserved

### Character Description (Gemini Vision)
- Analyzes uploaded photo for: hair color/style, exact skin tone, face features, build
- Must be VERY specific about skin tone (e.g., "medium brown skin" not just "warm skin")
- Kept under 60 words, no name needed
- Format: `"short dark brown hair, medium brown skin, round face with big brown eyes, wearing blue t-shirt and khaki shorts"`

### Scene Prompt Rules for Story Generation
- Dinosaurs/creatures described prominently with species name + visual details
- Environment richly described (jungle, volcano, lighting, sky)
- Child referred to as "the child" (gets stripped + replaced with `img`)
- NO other human characters ever (parents, adults, crowds) — causes identity confusion
- Tooth Fairy = tiny glowing pixie, Moon Princess = ethereal spirit (not human women)

### Negative Prompt
Includes: `multiple people, two people, crowd, group, adult, woman, man` + standard quality/anatomy terms

### What Failed (lessons learned)
1. **FLUX PuLID**: Good face identity but merged child with dinosaurs (chimera artifacts), poor scene backgrounds
2. **PhotoMaker low style_strength (20)**: Great backgrounds but lost character identity (skin tone, features wrong)
3. **PhotoMaker character-first prompt**: When character description buried scene, got portrait-only images with no background
4. **Multiple `img` triggers**: API error — "Cannot use multiple trigger words 'img' in text prompt"
5. **Composite approach (FLUX bg + PhotoMaker char + sharp overlay)**: Too mechanical, character looked pasted on
6. **Human words in scene prompt**: Words like "family", "parents", "waving goodbye" caused PhotoMaker to generate extra/different people

### Current Config
```typescript
// packages/shared/src/constants/index.ts
IMAGE_GEN_CONFIG = {
  model: 'tencentarc/photomaker-style:467d06...',
  styleName: 'Disney Charactor',
  styleStrengthRatio: 35,
  numSteps: 30,
  guidanceScale: 5,
  numOutputs: 1,
}
TOTAL_PAGES = 5  // reduced for testing (saves API credits)
```

## Development
- `pnpm dev` from root starts both backend (port 3000) and frontend (port 5173)
- Backend needs `.env` with `REPLICATE_API_TOKEN`, `GEMINI_API_KEY`, `DATABASE_URL`, `REDIS_URL`
- Must run `pnpm build` in `packages/shared` after changing shared constants
- Must run `npx prisma generate` in backend after schema changes
- Vite proxies `/api` to backend at localhost:3000 (uploaded images are served at `/api/uploads/`)

## Branches
- `main` — stable with FLUX PuLID model
- `feature/better-image-model` — PhotoMaker-Style (Disney/Pixar) implementation (current)
