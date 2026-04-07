import { useNavigate } from 'react-router-dom';
import { VideoBackground } from '../components/VideoBackground';
import BookShowcase from '../components/BookShowcase';
import OccasionGallery from '../components/OccasionGallery';
import VideoTestimonials from '../components/VideoTestimonials';
import { Footer } from '../components/Footer';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Video Background */}
      <VideoBackground />

      {/* Hero Section */}
      <section
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pb-40"
        style={{ paddingTop: 'calc(8rem - 75px)' }}
      >
        {/* Headline */}
        <h1
          className="font-display text-5xl sm:text-7xl md:text-8xl font-normal max-w-7xl animate-fade-rise"
          style={{ lineHeight: 0.95, letterSpacing: '-2.46px', color: '#000000' }}
        >
          Create <em className="not-italic" style={{ color: '#6F6F6F', fontStyle: 'italic' }}>Magical</em> Storybooks{' '}
          <br />
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base max-w-xl mt-1 leading-relaxed font-body animate-fade-rise-delay" style={{ color: '#6F6F6F' }}>
          Transform your little one into the hero of their very own
          personalized illustrated storybook. Through the magic of AI, we craft
          beautiful stories just for them.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/create')}
          className="rounded-full px-14 py-5 text-base mt-6 font-body animate-fade-rise-delay-2 transition-transform hover:scale-[1.03] cursor-pointer"
          style={{ backgroundColor: '#000000', color: '#FFFFFF', border: 'none' }}
        >
          Create a Book
        </button>
      </section>

      {/* Everything below the hero needs to sit ABOVE the fixed video */}
      <div className="relative" style={{ zIndex: 2 }}>

      {/* Book Flip Animation Showcase */}
      <BookShowcase />

      {/* Occasion Gallery */}
      <OccasionGallery />

      {/* Video Testimonials */}
      <VideoTestimonials />

      {/* Footer */}
      <Footer />

      </div>{/* end z-index wrapper */}
    </div>
  );
}
