import { useRef, useState, useCallback, useEffect } from "react";

const TESTIMONIALS = [
  {
    id: 1,
    video: "/testimonials/testimonial-1.mp4",
    name: "Sarah & Ayden",
    occasion: "Baby's First Year",
  },
  {
    id: 2,
    video: "/testimonials/testimonial-2.mp4",
    name: "Grace & Family",
    occasion: "Princess Adventure",
  },
  {
    id: 3,
    video: "/testimonials/testimonial-3.mp4",
    name: "Jessica & Dad",
    occasion: "Fairy Kingdom",
  },
  {
    id: 4,
    video: "/testimonials/testimonial-4.mp4",
    name: "Emma & Mom",
    occasion: "Dragon Adventure",
  },
  {
    id: 5,
    video: "/testimonials/testimonial-5.mp4",
    name: "Oliver & Family",
    occasion: "Space Explorer",
  },
  {
    id: 6,
    video: "/testimonials/testimonial-6.mp4",
    name: "Priya & Grandma",
    occasion: "Growing Up",
  },
];

// Arrow button
function NavArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Previous" : "Next"}
      className="flex items-center justify-center cursor-pointer"
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.9)",
        border: "none",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        flexShrink: 0,
        transition: "all 0.2s",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.9)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)";
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          transform: direction === "left" ? "rotate(180deg)" : undefined,
        }}
      >
        <path
          d="M9 5L16 12L9 19"
          stroke="#333"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function VideoTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Auto-play videos when they become visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 },
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement;
    if (card) {
      const scrollLeft =
        card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
      el.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
    setActiveIdx(idx);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const childEl = child as HTMLElement;
      const childCenter = childEl.offsetLeft + childEl.clientWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIdx(closest);
  }, []);

  return (
    <section
      style={{ padding: "64px 0 56px", background: "#fff", overflow: "hidden" }}
    >
      <style>{`
        .video-testi-scroll::-webkit-scrollbar { display: none; }
        .video-testi-card {
          flex-shrink: 0;
          width: min(360px, 80vw);
          height: min(560px, 75vh);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          scroll-snap-align: center;
          background: #f0f0f0;
        }
        @media (min-width: 768px) {
          .video-testi-card {
            width: 380px;
            height: 600px;
          }
        }
        @media (min-width: 1024px) {
          .video-testi-card {
            width: 400px;
            height: 640px;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40, padding: "0 24px" }}>
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 600,
            color: "#000",
            lineHeight: 1.15,
          }}
        >
          Reactions You Can Count On
        </h2>

        <h3
          className="font-display"
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            color: "#6F6F6F",
            lineHeight: 1.4,
            fontWeight: 400,
            fontStyle: "italic",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          A magical story for every child — rooted in wonder, adventure, and the
          joy of seeing themselves as the hero. Where imagination becomes a
          keepsake, and every page feels like home.
        </h3>
      </div>

      {/* Scrollable video cards with nav arrows */}
      <div style={{ position: "relative" }}>
        {/* Left arrow */}
        <div
          className="hidden md:flex"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <NavArrow
            direction="left"
            onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
          />
        </div>

        {/* Right arrow */}
        <div
          className="hidden md:flex"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <NavArrow
            direction="right"
            onClick={() =>
              scrollTo(Math.min(TESTIMONIALS.length - 1, activeIdx + 1))
            }
          />
        </div>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="video-testi-scroll"
          onScroll={handleScroll}
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            padding: "0 24px",
            justifyContent: "start",
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div key={t.id} className="video-testi-card">
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={t.video}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Bottom gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                  pointerEvents: "none",
                }}
              />

              {/* Name & occasion overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 18,
                  left: 18,
                }}
              >
                <p
                  className="font-body"
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 3,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.name}
                </p>
                <p
                  className="font-body"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {t.occasion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 28,
        }}
      >
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="cursor-pointer"
            aria-label={`Go to testimonial ${i + 1}`}
            style={{
              width: activeIdx === i ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: activeIdx === i ? "#000" : "#d0d0d0",
              border: "none",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
