import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StickyCards.css'; // Create this CSS file with styles below

gsap.registerPlugin(ScrollTrigger);

const cardData = [
  "Experience the ultimate in luxury living.",
  "Modern design meets timeless elegance.",
  "Indulge in a home that redefines luxury.",
  "Experience the ultimate in luxury living.",
  "Modern design meets timeless elegance.",
];

const StickyCards = () => {
  useEffect(() => {
    const wrappers = document.querySelectorAll('.card-wrapper');

    wrappers.forEach((wrapper, index) => {
      const card = wrapper.querySelector('.card');

      if (index === wrappers.length - 1) {
        gsap.set(card, { opacity: 1, scale: 1 });
      } else {
        gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            pin: true,
            pinSpacing: false,
          },
        })
        .set(card, { opacity: 1, scale: 1 })
        .to(card, { opacity: 0, scale: 0.6, ease: 'none' }, 0.01);
      }
    });
  }, []);

  return (
    <>
      <section className="empty-section"><h1>Scroll down to experience</h1></section>

      <div className="cards-container">
        {cardData.map((text, index) => (
          <div className="card-wrapper" key={index}>
            <div className="card">
              <h2>Card {index + 1}</h2>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="empty-section"><h1>Scroll up to experience</h1></section>
    </>
  );
};

export default StickyCards;
