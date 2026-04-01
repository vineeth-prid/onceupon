import { useRef, useEffect } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4';

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      if (video.duration && video.duration > 0) {
        const t = video.currentTime;
        const d = video.duration;
        const fadeIn = 0.5;
        const fadeOut = 0.5;

        if (t < fadeIn) {
          video.style.opacity = String(t / fadeIn);
        } else if (t > d - fadeOut) {
          video.style.opacity = String((d - t) / fadeOut);
        } else {
          video.style.opacity = '1';
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 100);
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: '300px',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}
    >
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        autoPlay
        className="w-full h-full object-cover"
        style={{ opacity: 0 }}
      />
      {/* Top gradient fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #FFFFFF 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
