const STEPS = [
  {
    number: '01',
    icon: '\u{1F3AF}',
    title: 'Choose Your Occasion',
    description:
      'Pick from 30+ life events \u2014 milestones, weddings, pregnancy, new home, travel memories.',
  },
  {
    number: '02',
    icon: '\u{1F3A8}',
    title: 'Personalise Your Story',
    description:
      'Add names, upload photos, choose an illustration style, and write a personal dedication.',
  },
  {
    number: '03',
    icon: '\u2728',
    title: 'AI Creates Your Book',
    description:
      'Our AI generates a beautifully crafted storybook in 1\u20133 minutes. Preview before ordering.',
  },
  {
    number: '04',
    icon: '\u{1F4E6}',
    title: 'We Print & Deliver',
    description:
      'Professionally printed, elegantly packaged, and delivered straight to your door.',
  },
];

export function HowItWorks() {
  return (
    <section className="w-full bg-white" style={{ padding: '5rem 2rem' }}>
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div
          className="flex items-center justify-center gap-3"
          style={{ marginBottom: '1.25rem' }}
        >
          <span style={{ width: 24, height: 1, background: '#C0C0C0', display: 'inline-block' }} />
          <span
            className="font-body"
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              color: '#6F6F6F',
              textTransform: 'uppercase',
            }}
          >
            How It Works
          </span>
          <span style={{ width: 24, height: 1, background: '#C0C0C0', display: 'inline-block' }} />
        </div>

        {/* Heading */}
        <h2
          className="font-display font-normal text-center"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#000',
            lineHeight: 1.1,
            marginBottom: '1rem',
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Four steps to a book you'll treasure forever
        </h2>

        {/* Subtitle */}
        <p
          className="font-body text-center"
          style={{
            fontSize: '1rem',
            color: '#6F6F6F',
            lineHeight: 1.6,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '3.5rem',
          }}
        >
          From your first click to holding a beautifully printed book &mdash; the whole journey takes
          less than 10 minutes.
        </p>

        {/* Step cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderRadius: 16, overflow: 'hidden' }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="transition-colors duration-200"
              style={{
                background: '#FAFAFA',
                padding: '2.5rem 1.75rem 2rem',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA';
              }}
            >
              {/* Large faded step number */}
              <span
                className="font-display"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 400,
                  color: '#E0E0E0',
                  lineHeight: 1,
                  display: 'block',
                  marginBottom: '1.25rem',
                }}
              >
                {step.number}
              </span>

              {/* Icon container */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#f0f0f0',
                  fontSize: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                {step.icon}
              </div>

              {/* Title */}
              <h3
                className="font-body"
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#000',
                  marginBottom: '0.5rem',
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="font-body"
                style={{
                  fontSize: '0.875rem',
                  color: '#6F6F6F',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
