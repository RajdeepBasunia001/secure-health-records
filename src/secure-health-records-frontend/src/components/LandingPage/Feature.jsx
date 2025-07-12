// components/Feature.jsx
import React, { useEffect } from 'react';
import PaperCard from './PaperCard';
import './feature.css';

const cards = [
  {
  id: 'card-1',
  title: 'Paper Clutter',
  note: 'Problem #004',
  text: 'Mountains of physical files make it nearly impossible to retrieve or share medical history efficiently.',
  footer: 'Outdated Systems',
  image: './problem-1.png',
  },
  {
    id: 'card-2',
    title: 'Privacy Risks',
    note: 'Problem #002',
    text: 'Anyone with basic info can access your files — zero audit trail or control.',
    footer: 'Privacy Breakdown',
    image: './pb-2.png',
  },
  {
    id: 'card-3',
    title: 'Emergency Delays',
    note: 'Problem #003',
    text: 'During critical moments, medical history isn’t available instantly.',
    footer: 'Life-Critical Gaps',
    image: './problem-3.png',
  },
  
  {
    id: 'card-4',
    title: 'Scattered Records',
    note: 'Problem #001',
    text: 'Medical records are spread across hospitals and clinics, with no unified access.',
    footer: 'Decentralization Failure',
    image: './problem-4.png',
  }
];

const Feature = () => {
  useEffect(() => {
    const totalCards = cards.length;
    const wrapper = document.querySelector('.card-stack-wrapper');
    if (wrapper) {
      wrapper.style.setProperty('--cards-count', totalCards);
      wrapper.style.setProperty('--card-height', '50vh'); // sticky height base
    }
  }, []);

  return (
    <>
      <div className="feature-container">
        <section className="feature-header">
          <div className="text-center mb-6">
            <h1 className="hero-title">
              <span className="hero-title-highlight">What’s Broken Today?</span><br />
              Your Medical Records Are <br />
              at <span className="hero-title-highlight">Risk</span>
            </h1>
            <p className="tagline-main">
              <span className="quote quote-left">“</span>
              <span className="highlight">Centralized systems</span> have
              <span className="keyword"> failed</span> to protect your data.
              <span className="quote quote-right">”</span>
            </p>
          </div>
        </section>

        <section id="stacked-feature" className="feature-stack-section">
          <div className="card-stack-wrapper">
            {cards.map((card, index) => (
              <div key={card.id} className="card-sticky">
                <PaperCard
                  rotation={index % 2 === 0 ? 2 : -2}
                  className="stacked-card"
                  style={{ zIndex: index + 1 }}
                >
                  <div className={`card-content`}>
                    <div className="card-text">
                      <div className="handwritten mb-2">{card.note}</div>
                      <h3 className="font-typewriter text-lg font-bold mb-3">
                        {card.title}
                      </h3>
                      <p
                        className="font-serif text-sm leading-relaxed"
                        style={{ color: 'rgba(43, 43, 43, 0.7)' }}
                      >
                        {card.text}
                      </p>
                      <div className="divider" />
                      <div
                        className="font-typewriter text-xs"
                        style={{ color: 'var(--faded-blue)' }}
                      >
                        {card.footer}
                      </div>
                    </div>
                    <div className="card-image">
                      <img src={card.image} alt={card.title} />
                    </div>
                  </div>
                </PaperCard>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Feature;
