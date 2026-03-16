import { forwardRef } from 'react';
import { FullBleedTextBottom } from './FullBleedTextBottom';
import { FullBleedTextTop } from './FullBleedTextTop';
import { FullBleedTextCenter } from './FullBleedTextCenter';
import { ImageLeftTextRight } from './ImageLeftTextRight';
import { ImageRightTextLeft } from './ImageRightTextLeft';
import { DramaticImageOnly } from './DramaticImageOnly';
import { TextHeavyVignette } from './TextHeavyVignette';
import { ChapterTitle } from './ChapterTitle';
import type { LayoutPageProps } from './shared';

type LayoutComponent = React.ForwardRefExoticComponent<LayoutPageProps & React.RefAttributes<HTMLDivElement>>;

const LAYOUT_MAP: Record<string, LayoutComponent> = {
  'full-bleed-text-bottom': FullBleedTextBottom,
  'full-bleed-text-top': FullBleedTextTop,
  'full-bleed-text-center': FullBleedTextCenter,
  'image-left-text-right': ImageLeftTextRight,
  'image-right-text-left': ImageRightTextLeft,
  'dramatic-image-only': DramaticImageOnly,
  'text-heavy-vignette': TextHeavyVignette,
  'chapter-title': ChapterTitle,
};

export const BookPage = forwardRef<HTMLDivElement, LayoutPageProps>(
  (props, ref) => {
    const layout = props.page.layout || 'full-bleed-text-bottom';
    const Component = LAYOUT_MAP[layout] || FullBleedTextBottom;
    return <Component ref={ref} {...props} />;
  }
);
