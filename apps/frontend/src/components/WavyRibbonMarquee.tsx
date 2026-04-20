import { useEffect, useRef } from 'react';

const RIBBON_TEXT =
  'Flip through a sample book  \u2022  Every story is a one-of-a-kind adventure  \u2022  Personalized just for your little one  \u2022  ';

export default function WavyRibbonMarquee() {
  const textPathRef = useRef<SVGTextPathElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tp = textPathRef.current;
    if (!tp) return;

    let offset = 50;
    const speed = 0.06;

    const tick = () => {
      offset -= speed;
      if (offset <= -150) offset = 50;
      tp.setAttribute('startOffset', `${offset}%`);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const fullText = RIBBON_TEXT.repeat(4);

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        margin: '-10px 0',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <defs>
          <path
            id="ribbon-curve"
            d="M-0.0625 165C304.861 165 441.551 35 725.946 35C1010.34 35 1079.44 165 1439.94 165"
          />
        </defs>

        {/* Subtle glass ribbon band */}
        <use
          href="#ribbon-curve"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth="70"
          fill="none"
        />

        {/* Scrolling text along the curve */}
        <text
          fontSize="28"
          fontWeight="600"
          letterSpacing="0.04em"
          fill="#262626"
          dominantBaseline="middle"
          fontFamily="inherit"
        >
          <textPath
            ref={textPathRef}
            href="#ribbon-curve"
            startOffset="50%"
            textAnchor="middle"
          >
            {fullText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
