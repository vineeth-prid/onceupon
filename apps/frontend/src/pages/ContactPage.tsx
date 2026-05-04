import { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';

type Topic = 'Book Creation' | 'Order & Delivery' | 'Printing Quality' | 'Payments' | 'Other';

const topics: Topic[] = [
  'Book Creation',
  'Order & Delivery',
  'Printing Quality',
  'Payments',
  'Other',
];

export function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [message, setMessage] = useState('');

  const [state, handleSubmit] = useForm('mlgzjolo');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #E5E5E5',
    borderRadius: 10,
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    color: '#000',
    background: '#FFF',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#000',
    marginBottom: 6,
  };

  const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '0.75rem',
    marginTop: 4,
    display: 'block',
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          background: '#000',
          padding: '80px 24px 64px',
          textAlign: 'center',
        }}
      >
        <h1
          className="font-display"
          style={{
            color: '#FFF',
            fontSize: '3rem',
            lineHeight: 1.15,
            margin: '0 0 16px',
          }}
        >
          We'd love to hear from you
        </h1>
        <p
          className="font-body"
          style={{
            color: '#6F6F6F',
            fontSize: '1.125rem',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Have a question, feedback, or need help with an order? Get in touch
          and we'll respond as soon as we can.
        </p>
      </section>

      {/* Two-Column Layout */}
      <section
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '64px 24px 96px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 56,
          alignItems: 'start',
        }}
      >
        {/* Left Column */}
        <div>
          <h2
            className="font-display"
            style={{ fontSize: '2rem', color: '#000', margin: '0 0 16px' }}
          >
            Let's talk about your story
          </h2>
          <p
            className="font-body"
            style={{
              color: '#6F6F6F',
              fontSize: '1rem',
              lineHeight: 1.7,
              margin: '0 0 40px',
            }}
          >
            Whether you need help creating your book, have a question about an
            existing order, or just want to say hello, our team is ready to
            assist you every step of the way.
          </p>

          {/* Contact Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div
                className="font-body"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: '#6F6F6F',
                  marginBottom: 6,
                }}
              >
                Email
              </div>
              <div
                className="font-body"
                style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}
              >
                hello@onceuponatym.com
              </div>
            </div>

            {/* Live Chat */}
            <div
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div
                className="font-body"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: '#6F6F6F',
                  marginBottom: 6,
                }}
              >
                Live Chat
              </div>
              <div
                className="font-body"
                style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}
              >
                Mon&ndash;Fri, 9am&ndash;6pm
              </div>
            </div>

            {/* Phone */}
            <div
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div
                className="font-body"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: '#6F6F6F',
                  marginBottom: 6,
                }}
              >
                Phone
              </div>
              <div
                className="font-body"
                style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}
              >
                +44 20 0000 0000
              </div>
            </div>
          </div>

          {/* Response Time Box */}
          <div
            style={{
              marginTop: 24,
              background: '#FAFAFA',
              borderRadius: 12,
              padding: '20px 24px',
            }}
          >
            <p
              className="font-body"
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#6F6F6F',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: '#000' }}>Average response time:</strong>{' '}
              We typically reply within 2&ndash;4 hours during business hours.
            </p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: 16,
            padding: 36,
          }}
        >
          {state.succeeded ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
              }}
            >
              {/* Checkmark */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                className="font-display"
                style={{
                  fontSize: '1.5rem',
                  color: '#000',
                  margin: '0 0 12px',
                }}
              >
                Message sent!
              </h3>
              <p
                className="font-body"
                style={{
                  color: '#6F6F6F',
                  fontSize: '0.9375rem',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Thank you for reaching out. We'll get back to you as soon as
                possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Name Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div>
                  <label className="font-body" htmlFor="firstName" style={labelStyle}>
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="font-body"
                    style={inputStyle}
                    placeholder="Jane"
                  />
                  <ValidationError prefix="First Name" field="firstName" errors={state.errors} style={errorStyle} />
                </div>
                <div>
                  <label className="font-body" htmlFor="lastName" style={labelStyle}>
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="font-body"
                    style={inputStyle}
                    placeholder="Doe"
                  />
                  <ValidationError prefix="Last Name" field="lastName" errors={state.errors} style={errorStyle} />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label className="font-body" htmlFor="email" style={labelStyle}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-body"
                  style={inputStyle}
                  placeholder="jane@example.com"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} style={errorStyle} />
              </div>

              {/* Order Number */}
              <div style={{ marginBottom: 20 }}>
                <label className="font-body" htmlFor="orderNumber" style={labelStyle}>
                  Order number{' '}
                  <span style={{ fontWeight: 400, color: '#6F6F6F' }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="font-body"
                  style={inputStyle}
                  placeholder="#OUA-00000"
                />
                <ValidationError prefix="Order Number" field="orderNumber" errors={state.errors} style={errorStyle} />
              </div>

              {/* Topic Selector */}
              <div style={{ marginBottom: 20 }}>
                <label className="font-body" style={labelStyle}>
                  Topic
                </label>
                <input type="hidden" name="topic" value={selectedTopic || ''} />
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className="font-body"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: '1px solid #000',
                        background:
                          selectedTopic === topic ? '#16a34a' : '#FAFAFA',
                        color: selectedTopic === topic ? '#FFF' : '#000',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <ValidationError prefix="Topic" field="topic" errors={state.errors} style={errorStyle} />
              </div>

              {/* Message */}
              <div style={{ marginBottom: 28 }}>
                <label className="font-body" htmlFor="message" style={labelStyle}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="font-body"
                  rows={5}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                  }}
                  placeholder="Tell us how we can help..."
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} style={errorStyle} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state.submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 32px',
                  borderRadius: 999,
                  fontSize: '0.9375rem',
                  opacity: state.submitting ? 0.7 : 1,
                  cursor: state.submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {state.submitting ? 'Sending...' : 'Send Message'}
              </button>
              <ValidationError errors={state.errors} style={errorStyle} />
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
