import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VideoBackground } from '../components/VideoBackground';
import { FAQ } from '../components/FAQ';
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

      {/* Stats */}
      <section style={{ background: '#FAFAFA', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[
            { value: '50K+', label: 'Books Created' },
            { value: '30+', label: 'Story Templates' },
            { value: '4.9', label: 'Average Rating' },
            { value: '40+', label: 'Countries' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: '2.2rem', color: '#000', lineHeight: 1 }}>{stat.value}</div>
              <div className="font-body" style={{ fontSize: '0.75rem', color: '#6F6F6F', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#000', marginBottom: 8 }}>
              How It Works
            </h2>
            <p className="font-body" style={{ fontSize: '0.9rem', color: '#6F6F6F' }}>
              Four simple steps to create your personalized storybook
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2, borderRadius: 20, overflow: 'hidden' }}>
            {[
              { num: '01', icon: '📚', title: 'Choose Your Story', desc: 'Pick from 30+ templates or write your own custom story idea' },
              { num: '02', icon: '📷', title: 'Upload & Personalise', desc: 'Add photos and details to make the story uniquely yours' },
              { num: '03', icon: '✨', title: 'AI Creates Magic', desc: 'Our AI generates beautiful illustrations and weaves your story' },
              { num: '04', icon: '📖', title: 'Read & Treasure', desc: 'Preview your book, order a printed copy, or download as PDF' },
            ].map((step) => (
              <div key={step.num} style={{ background: '#FAFAFA', padding: '2.5rem 1.5rem', transition: 'background 0.3s', cursor: 'default' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FAFAFA')}
              >
                <div className="font-display" style={{ fontSize: '2.5rem', color: '#e5e5e5', marginBottom: 12 }}>{step.num}</div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 12 }}>{step.icon}</div>
                <h3 className="font-body" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#000', marginBottom: 6 }}>{step.title}</h3>
                <p className="font-body" style={{ fontSize: '0.82rem', color: '#6F6F6F', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section style={{ padding: '5rem 2rem', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div className="font-body" style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6F6F6F', marginBottom: 14 }}>About Us</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, color: '#000', lineHeight: 1.15, marginBottom: 16 }}>
              Every child deserves to be the <em style={{ fontStyle: 'italic', color: '#6F6F6F' }}>hero</em> of their own story
            </h2>
            <p className="font-body" style={{ fontSize: '0.9rem', color: '#6F6F6F', lineHeight: 1.8, marginBottom: 24 }}>
              We combine the magic of AI with beautiful storytelling to create personalized storybooks that children treasure. Each book features your child as the main character with custom illustrations based on their actual photo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '✨', title: 'AI-Powered Illustrations', desc: 'Your child\'s face in every page, Disney-quality art' },
                { icon: '📖', title: 'Personalized Stories', desc: '30+ themes or create your own custom narrative' },
                { icon: '🖨️', title: 'Premium Print Quality', desc: 'Archival paper, vibrant colors, built to last' },
              ].map((feat) => (
                <div key={feat.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 12, border: '1px solid transparent', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{feat.icon}</div>
                  <div>
                    <div className="font-body" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#000', marginBottom: 2 }}>{feat.title}</div>
                    <div className="font-body" style={{ fontSize: '0.78rem', color: '#6F6F6F' }}>{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 400 }}>
            {[
              { top: 0, left: 40, w: 220, h: 280, gradient: 'linear-gradient(148deg, #d4aa6a, #8a5a28, #3a1e0e)', label: "Children's Book", name: "Emma's First Year" },
              { top: 80, left: 200, w: 180, h: 230, gradient: 'linear-gradient(148deg, #88b48a, #3e7246, #1b3c22)', label: 'Adventure', name: 'Dragon Friend' },
              { top: 200, left: 0, w: 160, h: 190, gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)', label: 'Fantasy', name: 'Fairy Kingdom' },
            ].map((card, i) => (
              <div key={i} style={{ position: 'absolute', top: card.top, left: card.left, width: card.w, height: card.h, borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', transition: 'transform 0.3s', cursor: 'default' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ width: '100%', height: '100%', background: card.gradient, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14 }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>{card.label}</div>
                  <div className="font-display" style={{ fontSize: '0.9rem', color: '#fff' }}>{card.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#000', marginBottom: 8 }}>
              Loved by Families
            </h2>
            <p className="font-body" style={{ fontSize: '0.9rem', color: '#6F6F6F' }}>See what parents are saying about their storybooks</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 2rem 1rem', scrollbarWidth: 'none' }}>
          {[
            { name: 'Sarah J.', rating: 5, text: "My daughter's face when she saw herself in the book was priceless. The illustrations are absolutely stunning.", occasion: "Baby's First Year" },
            { name: 'Marcus L.', rating: 5, text: 'The quality of the printed book exceeded my expectations. It feels like a real published children\'s book.', occasion: 'Dragon Adventure' },
            { name: 'Priya N.', rating: 5, text: 'I\'ve ordered three books now — one for each child. They love reading about their own adventures before bed.', occasion: 'Custom Story' },
            { name: 'James O.', rating: 5, text: 'Perfect birthday gift. The personalization level is incredible — it really feels like a one-of-a-kind book.', occasion: 'Birthday Gift' },
            { name: 'Aisha M.', rating: 5, text: 'Ordered this for my niece and the whole family was amazed. Already planning the next one!', occasion: 'Fairy Kingdom' },
          ].map((t, i) => (
            <div key={i} style={{ minWidth: 300, background: '#FAFAFA', borderRadius: 16, padding: '1.5rem', border: '1px solid #f0f0f0', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                {Array.from({ length: t.rating }).map((_, j) => <span key={j} style={{ color: '#000', fontSize: '0.85rem' }}>★</span>)}
              </div>
              <p className="font-body" style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.65, marginBottom: 14, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="font-body" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#000' }}>{t.name}</div>
                <div className="font-body" style={{ fontSize: '0.7rem', color: '#6F6F6F' }}>{t.occasion}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
            Ready to create something <em style={{ fontStyle: 'italic', color: '#999' }}>magical?</em>
          </h2>
          <p className="font-body" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28 }}>
            Turn your child's photos into a beautifully illustrated storybook in minutes.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/create" className="no-underline font-body" style={{ padding: '0.8rem 2rem', borderRadius: 100, background: '#fff', color: '#000', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'transform 0.2s', textDecoration: 'none' }}>
              Start Your Book
            </Link>
            <Link to="/templates" className="no-underline font-body" style={{ padding: '0.8rem 2rem', borderRadius: 100, background: 'transparent', color: '#fff', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
      {/* Footer */}
      <Footer />
    </div>
  );
}
