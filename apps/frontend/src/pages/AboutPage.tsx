import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Animated counter hook (fires once when element enters viewport)   */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Stat item                                                          */
/* ------------------------------------------------------------------ */
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl md:text-6xl" style={{ color: '#FFF' }}>
        {count}
        {suffix}
      </p>
      <p className="mt-2 font-body text-sm tracking-wide uppercase" style={{ color: '#6F6F6F' }}>
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mission card                                                       */
/* ------------------------------------------------------------------ */
function MissionCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-2xl p-8"
      style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}
    >
      <h3 className="font-display text-xl mb-3" style={{ color: '#000' }}>
        {title}
      </h3>
      <p className="font-body text-sm leading-relaxed" style={{ color: '#6F6F6F' }}>
        {description}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Team member card                                                   */
/* ------------------------------------------------------------------ */
function TeamCard({
  emoji,
  gradientFrom,
  gradientTo,
  name,
  role,
  bio,
}: {
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full text-4xl"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        {emoji}
      </div>
      <h3 className="font-display text-lg" style={{ color: '#000' }}>
        {name}
      </h3>
      <p className="font-body text-xs uppercase tracking-wide mt-1 mb-3" style={{ color: '#6F6F6F' }}>
        {role}
      </p>
      <p className="font-body text-sm leading-relaxed" style={{ color: '#6F6F6F' }}>
        {bio}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  AboutPage                                                          */
/* ================================================================== */
export function AboutPage() {
  return (
    <div style={{ background: '#FFF' }}>
      {/* ---- Hero ---- */}
      <section
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ background: '#000', minHeight: '50vh', paddingTop: '6rem', paddingBottom: '6rem' }}
      >
        {/* Breadcrumb */}
        <nav className="mb-10 font-body text-xs tracking-wide uppercase" style={{ color: '#6F6F6F' }}>
          <Link to="/" className="hover:underline" style={{ color: '#6F6F6F' }}>
            Home
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: '#FFF' }}>About</span>
        </nav>

        <h1
          className="font-display text-4xl md:text-6xl lg:text-7xl max-w-3xl leading-tight"
          style={{ color: '#FFF' }}
        >
          We believe every story deserves a home
        </h1>
        <p
          className="mt-6 font-body text-base md:text-lg max-w-xl leading-relaxed"
          style={{ color: '#6F6F6F' }}
        >
          Turning your most precious moments into beautifully crafted books that
          families treasure for generations.
        </p>
      </section>

      {/* ---- Our Story ---- */}
      <section style={{ background: '#FAFAFA' }} className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div>
            <p
              className="font-body text-xs uppercase tracking-widest mb-4"
              style={{ color: '#6F6F6F' }}
            >
              Our Story
            </p>
            <h2 className="font-display text-3xl md:text-4xl leading-snug mb-8" style={{ color: '#000' }}>
              Born from a desire to preserve what matters most
            </h2>
            <div className="space-y-5 font-body text-sm leading-relaxed" style={{ color: '#6F6F6F' }}>
              <p>
                It started the way many ideas do -- with a new parent staring at a phone
                full of photos at 2 a.m. Our founder, Ayla, realized that thousands of
                irreplaceable moments were buried in camera rolls, destined to be
                forgotten between screenshots and grocery lists.
              </p>
              <p>
                She set out to build something different: a platform that could take those
                fleeting snapshots and weave them into stories worth holding. Using
                AI-powered illustration and thoughtful design, we transform ordinary
                photos into extraordinary memory books -- personalized, printed on
                archival paper, and bound to last.
              </p>
              <p>
                Today, we have helped over 50,000 families turn their photos into
                keepsakes. From a child's first year to a couple's love story, every
                book we create is a reminder that the small moments are the ones that
                matter most.
              </p>
            </div>
          </div>

          {/* Right column -- decorative collage */}
          <div className="relative flex items-center justify-center" style={{ minHeight: '400px' }}>
            <div
              className="absolute rounded-2xl flex items-end p-6"
              style={{
                width: '220px',
                height: '280px',
                background: 'linear-gradient(135deg, #E8E8E8, #D0D0D0)',
                top: '0',
                right: '10%',
                transform: 'rotate(3deg)',
                zIndex: 1,
              }}
            >
              <span className="font-display text-sm" style={{ color: '#000' }}>
                Children's Book
              </span>
            </div>
            <div
              className="absolute rounded-2xl flex items-end p-6"
              style={{
                width: '200px',
                height: '260px',
                background: 'linear-gradient(135deg, #D5D5D5, #BFBFBF)',
                top: '60px',
                right: '35%',
                transform: 'rotate(-4deg)',
                zIndex: 2,
              }}
            >
              <span className="font-display text-sm" style={{ color: '#000' }}>
                Love Story
              </span>
            </div>
            <div
              className="absolute rounded-2xl flex items-end p-6"
              style={{
                width: '190px',
                height: '250px',
                background: 'linear-gradient(135deg, #C8C8C8, #ABABAB)',
                top: '120px',
                right: '5%',
                transform: 'rotate(1deg)',
                zIndex: 3,
              }}
            >
              <span className="font-display text-sm" style={{ color: '#FFF' }}>
                Pregnancy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stats Counter ---- */}
      <section style={{ background: '#000' }} className="px-6 py-24">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatItem value={50} suffix="K+" label="Books Created" />
          <StatItem value={30} suffix="+" label="Occasion Types" />
          <StatItem value={4} suffix=".9★" label="Average Rating" />
          <StatItem value={40} suffix="+" label="Countries Delivered" />
        </div>
      </section>

      {/* ---- Our Mission ---- */}
      <section style={{ background: '#FFF' }} className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <h2
            className="font-display text-3xl md:text-4xl text-center mb-16"
            style={{ color: '#000' }}
          >
            What drives everything we do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <MissionCard
              title="Memories That Last"
              description="Every book is printed on archival-quality paper and built to be passed down through generations. These are not disposable prints -- they are heirlooms."
            />
            <MissionCard
              title="Beauty in Every Page"
              description="We obsess over design so you do not have to. Every illustration is crafted with care, every layout considered, every detail intentional."
            />
            <MissionCard
              title="Stories for Everyone"
              description="From new parents documenting a first year to newlyweds preserving their love story, we believe every milestone is worth celebrating in print."
            />
          </div>
        </div>
      </section>

      {/* ---- Team Grid ---- */}
      <section style={{ background: '#FAFAFA' }} className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <p
            className="font-body text-xs uppercase tracking-widest text-center mb-4"
            style={{ color: '#6F6F6F' }}
          >
            Our Team
          </p>
          <h2
            className="font-display text-3xl md:text-4xl text-center mb-16"
            style={{ color: '#000' }}
          >
            The people behind the pages
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">
            <TeamCard
              emoji="👩‍💼"
              gradientFrom="#E0E0E0"
              gradientTo="#C0C0C0"
              name="Ayla Hassan"
              role="Founder & CEO"
              bio="Started the company after the birth of her daughter, determined to turn fleeting moments into lasting stories."
            />
            <TeamCard
              emoji="🧑‍💻"
              gradientFrom="#D8D8D8"
              gradientTo="#B8B8B8"
              name="Marcus Lee"
              role="Head of AI"
              bio="AI researcher with a passion for building technology that creates meaningful, personal experiences."
            />
            <TeamCard
              emoji="🎨"
              gradientFrom="#D0D0D0"
              gradientTo="#B0B0B0"
              name="Priya Nair"
              role="Creative Director"
              bio="Award-winning illustrator who believes that great design is invisible -- it just makes you feel something."
            />
            <TeamCard
              emoji="📦"
              gradientFrom="#C8C8C8"
              gradientTo="#A8A8A8"
              name="James Okafor"
              role="Head of Operations"
              bio="Ensures every book is printed, bound, and delivered to perfection -- no matter where in the world it is headed."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
