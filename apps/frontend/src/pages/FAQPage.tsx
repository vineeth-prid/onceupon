import { useState } from 'react';
import { Link } from 'react-router-dom';

type Category = 'all' | 'creation' | 'printing' | 'delivery' | 'payments';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  category: Category;
  title: string;
  items: FAQItem[];
}

const sections: FAQSection[] = [
  {
    category: 'creation',
    title: 'Book Creation',
    items: [
      {
        question: 'What types of memory books can I create?',
        answer:
          'You can create personalised memory books for any life event \u2014 children\u2019s books, weddings, pregnancy, graduations, travel memories, and more.',
      },
      {
        question: 'How does the AI personalise my book?',
        answer:
          'Upload photos and details like names and a dedication. Our AI analyses your photos to create unique illustrations and weaves your details into a one-of-a-kind narrative.',
      },
      {
        question: 'How long does generation take?',
        answer:
          'Book generation typically takes 1\u20133 minutes. You\u2019ll receive a notification when your book is ready to preview.',
      },
      {
        question: 'Can I edit the book after it\u2019s generated?',
        answer:
          'Yes! You can regenerate individual pages up to 5 times before ordering. You can also go back and edit your details or try a different illustration style.',
      },
    ],
  },
  {
    category: 'printing',
    title: 'Printing & Quality',
    items: [
      {
        question: 'What formats and sizes are available?',
        answer:
          'We offer Classic Square (21\u00d721cm, 24 pages, softcover), Premium Square (25\u00d725cm, 32 pages, hardcover), and Grand Portrait (21\u00d728cm, 40 pages, hardcover).',
      },
      {
        question: 'How is the print quality?',
        answer:
          'We use professional-grade printing on archival paper to ensure vibrant colours and longevity. Every book undergoes a quality check before dispatch.',
      },
      {
        question: 'Can I add gift packaging?',
        answer:
          'Yes! Add Premium Gift Packaging at checkout \u2014 includes a branded box, ribbon, and tissue paper.',
      },
    ],
  },
  {
    category: 'delivery',
    title: 'Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer:
          'Standard (7\u201310 days), Express (3\u20135 days), and Priority (1\u20132 days). Exact times depend on location.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship worldwide. Delivery times and costs vary by destination.',
      },
      {
        question: 'How do I track my order?',
        answer:
          'Once dispatched, you\u2019ll receive an email with your tracking number. You can also track from your profile.',
      },
    ],
  },
  {
    category: 'payments',
    title: 'Payments & Refunds',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'All major credit/debit cards, Apple Pay, and Google Pay.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          'As each book is uniquely personalised, we can\u2019t offer refunds after printing begins. However, quality issues are reprinted free.',
      },
      {
        question: 'Can I use a promo code?',
        answer:
          'Yes! Enter your code at checkout for an instant discount.',
      },
    ],
  },
];

const tabs: { key: Category; label: string }[] = [
  { key: 'all', label: 'All Topics' },
  { key: 'creation', label: 'Book Creation' },
  { key: 'printing', label: 'Printing' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'payments', label: 'Payments' },
];

export function FAQPage() {
  const [activeTab, setActiveTab] = useState<Category>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const visibleSections =
    activeTab === 'all'
      ? sections
      : sections.filter((s) => s.category === activeTab);

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
          Frequently Asked Questions
        </h1>
        <p
          className="font-body"
          style={{
            color: '#6F6F6F',
            fontSize: '1.125rem',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Everything you need to know about creating, ordering, and receiving
          your personalised storybook.
        </p>
      </section>

      {/* Filter Tabs */}
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '40px 24px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="font-body"
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: '1px solid #000',
                background: activeTab === tab.key ? '#000' : '#FAFAFA',
                color: activeTab === tab.key ? '#FFF' : '#000',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
        {visibleSections.map((section) => (
          <div key={section.category} style={{ marginBottom: 48 }}>
            <h2
              className="font-display"
              style={{
                fontSize: '1.5rem',
                color: '#000',
                margin: '0 0 20px',
              }}
            >
              {section.title}
            </h2>

            <div
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {section.items.map((item, idx) => {
                const key = `${section.category}-${idx}`;
                const isOpen = openItems.has(key);

                return (
                  <div
                    key={key}
                    style={{
                      borderTop: idx > 0 ? '1px solid #E5E5E5' : 'none',
                    }}
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="font-body"
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px 24px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: 16,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: '#000',
                          lineHeight: 1.5,
                        }}
                      >
                        {item.question}
                      </span>
                      <span
                        style={{
                          fontSize: '1.25rem',
                          color: '#6F6F6F',
                          flexShrink: 0,
                          fontWeight: 300,
                          lineHeight: 1,
                          transition: 'transform 0.2s ease',
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        }}
                      >
                        +
                      </span>
                    </button>

                    <div
                      style={{
                        maxHeight: isOpen ? 200 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                      }}
                    >
                      <p
                        className="font-body"
                        style={{
                          padding: '0 24px 20px',
                          margin: 0,
                          fontSize: '0.9375rem',
                          lineHeight: 1.7,
                          color: '#6F6F6F',
                        }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <section
        style={{
          background: '#FAFAFA',
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          className="font-display"
          style={{ fontSize: '2rem', color: '#000', margin: '0 0 12px' }}
        >
          Still have questions?
        </h2>
        <p
          className="font-body"
          style={{
            color: '#6F6F6F',
            fontSize: '1rem',
            margin: '0 0 28px',
            lineHeight: 1.6,
          }}
        >
          Our team is here to help you with anything you need.
        </p>
        <Link
          to="/contact"
          className="font-body"
          style={{
            display: 'inline-block',
            padding: '14px 36px',
            background: '#000',
            color: '#FFF',
            borderRadius: 999,
            textDecoration: 'none',
            fontSize: '0.9375rem',
            fontWeight: 500,
            transition: 'opacity 0.2s ease',
          }}
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
