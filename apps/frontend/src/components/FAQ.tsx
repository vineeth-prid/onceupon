import { useState } from 'react';

const FAQ_DATA = [
  {
    question: 'How do I create a storybook?',
    answer: 'Simply click "Create a Book", choose a story category, upload your child\'s photo, and our AI will generate a personalized illustrated storybook starring your child.',
  },
  {
    question: 'What age group are the books designed for?',
    answer: 'Our storybooks are designed for children aged 2-10 years old. Each story is crafted with age-appropriate language and beautiful illustrations that captivate young readers.',
  },
  {
    question: 'How long does it take to generate a book?',
    answer: 'Once you upload a photo and select a story, the AI typically generates your personalized storybook within 3-5 minutes, including all custom illustrations.',
  },
  {
    question: 'Can I preview the book before downloading?',
    answer: 'Yes! After generation is complete, you can flip through your book using our interactive reader. You can also download it as a PDF for printing.',
  },
  {
    question: 'What photo works best for the illustrations?',
    answer: 'A clear, front-facing photo with good lighting works best. The AI uses facial features, skin tone, and hair to accurately represent your child in every illustration.',
  },
  {
    question: 'Can I create multiple books for the same child?',
    answer: 'Absolutely! You can create as many books as you like. Each story is unique, so your child can star in adventures, animal tales, fantasy quests, and more.',
  },
  {
    question: 'What illustration styles are available?',
    answer: 'We offer several styles including Disney/Pixar 3D, watercolor, gouache, sticker art, clay animation, geometric, and classic picture book illustration.',
  },
  {
    question: 'Is my child\'s photo stored securely?',
    answer: 'Yes, your child\'s photo is only used for generating illustrations and is handled securely. We take privacy very seriously and never share uploaded photos.',
  },
  {
    question: 'Can I download the book as a PDF?',
    answer: 'Yes! Once your storybook is generated, you can download a high-quality PDF version perfect for printing or sharing with family.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleFAQs = showAll ? FAQ_DATA : FAQ_DATA.slice(0, 6);

  return (
    <section className="w-full bg-white" style={{ padding: '4rem 2rem 3rem' }}>
      <div className="max-w-3xl mx-auto">
        <h2
          className="font-display font-normal animate-fade-rise"
          style={{ fontSize: '2.5rem', color: '#000', marginBottom: '2rem', lineHeight: 1.1 }}
        >
          Frequently Asked Questions
        </h2>

        <div>
          {visibleFAQs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{ borderBottom: '1px solid #e5e5e5' }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center cursor-pointer font-body"
                  style={{
                    padding: '1.1rem 0',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#000',
                  }}
                >
                  <span>{faq.question}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6F6F6F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flexShrink: 0,
                      marginLeft: '1rem',
                      transition: 'transform 0.3s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? '200px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease, opacity 0.3s ease',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p
                    className="font-body"
                    style={{
                      fontSize: '0.9rem',
                      color: '#6F6F6F',
                      lineHeight: 1.6,
                      padding: '0 0 1rem',
                      margin: 0,
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!showAll && FAQ_DATA.length > 6 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => setShowAll(true)}
              className="font-body cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.9rem',
                color: '#000',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              See All
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
