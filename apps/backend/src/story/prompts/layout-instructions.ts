export const LAYOUT_INSTRUCTIONS = `
PAGE LAYOUT DESIGN:
You are also the book designer. For each page, choose a "layout" that controls how the page looks in the final printed book. Choose from:

- "chapter-title": Decorative title page. No illustration. Large beautiful title text with ornamental elements. MUST be used for page 1.
- "full-bleed-text-bottom": Full illustration fills the page. Story text overlaid at the bottom with a soft gradient. Best for: action scenes, establishing shots.
- "full-bleed-text-top": Full illustration. Story text overlaid at the top. Best for: scenes where visual action is at the bottom of the image.
- "full-bleed-text-center": Full illustration. Story text floats in a semi-transparent panel in the center. Best for: magical, dreamy, transformative moments.
- "image-left-text-right": Image fills the left half, story text on a cream-colored right half with decorative typography. Best for: dialogue, character introductions, quieter moments.
- "image-right-text-left": Mirror of above — text on left, image on right. Alternate with image-left-text-right.
- "dramatic-image-only": Full illustration with NO text. The image tells the story alone. Use for the single most climactic/dramatic moment. Maximum 1 per book. The "text" field should be a very brief 5-8 word caption.
- "text-heavy-vignette": Cream-colored page with generous text (3-4 sentences) and a small circular illustration. Best for: reflective moments, internal thoughts, transitions.

LAYOUT RULES:
- Page 1 MUST be "chapter-title"
- Page 2 should be a strong visual opening ("full-bleed-text-bottom" or "full-bleed-text-center")
- Never use the same layout more than 2 times in a row
- Use "dramatic-image-only" once, for the climactic moment (around pages 11-13)
- Use "text-heavy-vignette" for 1-2 reflective moments
- Alternate "image-left-text-right" and "image-right-text-left" (never same twice in a row)
- Page 16 should be "full-bleed-text-center" or "full-bleed-text-bottom" for the warm conclusion
- Use at least 5 different layout types across the 16 pages

IMAGE COMPOSITION:
For each page, provide an "imageComposition" hint that tells the image generator how to frame the image for the layout:
- "image-left-text-right": place subject on the LEFT side, leave right side as soft background
- "image-right-text-left": place subject on the RIGHT side, leave left side as soft background
- "full-bleed-text-bottom": keep main subject in upper two-thirds, simpler background at bottom
- "full-bleed-text-top": keep main subject in lower two-thirds, simpler background at top
- "full-bleed-text-center": place subjects at edges/sides, keep center softer for text readability
- "dramatic-image-only": full cinematic wide composition, subject centered, maximum visual impact
- "text-heavy-vignette": tight portrait or close-up, circular-friendly framing
- "chapter-title": describe a simple decorative border or ornamental pattern`;

export const LAYOUT_JSON_STRUCTURE = `Return JSON with this exact structure:
{
  "title": "string",
  "pages": [{
    "pageNumber": number,
    "text": "string",
    "imagePrompt": "string",
    "sceneDescription": "string",
    "layout": "string (one of the layout types above)",
    "imageComposition": "string (composition guidance for image generator)"
  }]
}`;
