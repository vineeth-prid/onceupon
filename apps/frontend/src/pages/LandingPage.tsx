import { useNavigate } from 'react-router-dom';
import { VideoBackground } from '../components/VideoBackground';
import BookShowcase from '../components/BookShowcase';
import OccasionGallery from '../components/OccasionGallery';
import VideoTestimonials from '../components/VideoTestimonials';
import { HowItWorksDemo } from '../components/HowItWorksDemo';
import { Footer } from '../components/Footer';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Video Background */}
      <VideoBackground />

      {/* Hero Section */}
      <section
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen"
      >
        {/* Headline */}
        <h1
          className="font-display hero-headline text-5xl sm:text-7xl md:text-8xl font-normal max-w-7xl animate-fade-rise"
          style={{ lineHeight: 1.02, letterSpacing: '-2px', margin: 0 }}
        >
          Create <span className="hero-magical">Magical</span> Storybooks
        </h1>

        {/* Description */}
        <p
          className="hero-sub text-base sm:text-lg max-w-2xl mt-6 leading-relaxed font-body animate-fade-rise-delay"
        >
          Transform your little one into the hero of their very own
          personalized illustrated storybook. Through the magic of AI, we
          craft beautiful stories just for them.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/create')}
          className="btn-secondary hero-cta-brand animate-fade-rise-delay-2 px-14 py-5 mt-10"
        >
          Create a Book
        </button>
      </section>

      {/* Everything below the hero needs to sit ABOVE the fixed video */}
      <div className="relative" style={{ zIndex: 2 }}>

      {/* Book Flip Animation Showcase */}
      <BookShowcase />

      {/* How It Works Interactive Demo */}
      <HowItWorksDemo />

      {/* Video Testimonials */}
      <VideoTestimonials />

      {/* Occasion Gallery — sells custom stories for weddings, first-borns, graduations, etc. */}
      <OccasionGallery />

      {/* Footer */}
      <Footer />

      </div>{/* end z-index wrapper */}
    </div>
  );
}
