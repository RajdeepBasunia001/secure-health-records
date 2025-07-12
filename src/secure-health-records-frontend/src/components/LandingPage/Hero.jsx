import React from 'react';
import PaperCard from './PaperCard';


const StampButton = ({ children, variant = 'primary', onClick, className = '' }) => (
  <button
    className={`stamp-button ${variant === 'secondary' ? 'secondary' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Hero = () => {
  return (
    <section id="features" className="hero main-content">
      <div className="container">
        <div className="text-center mb-6">
          <h1 className="hero-title">
            Digital Health Records<br />
            <span className="hero-title-highlight">Reimagined</span>
          </h1>
          <p className="hero-subtitle">
            Secure, decentralized medical records built on Internet Computer Protocol.
            Your health data, your control, your future.
          </p>

          <div class="tagline-wrapper">
            <p class="tagline-main">
            <span class="quote quote-left">“</span>
              <span class="highlight">Your health data</span>, 
              <span class="keyword">your control</span>, 
              your future.
            <span class="quote quote-right">”</span>
            </p>
            <p class="tagline-sub">
              ⟶ <span class="built">Built on blockchain</span>. 
              <span class="trusted">Trusted by patients.</span>
            </p>
          </div>


        </div>

        <div className="hero-cards">
          <PaperCard rotation={1}>
            <div className="handwritten mb-2">Patient Record #001</div>
            <h3 className="font-typewriter text-lg font-bold mb-3">Secure Storage</h3>
            <p className="font-serif text-sm leading-relaxed" style={{ color: 'rgba(43, 43, 43, 0.7)' }}>
              Your medical records are encrypted and stored on the decentralized Internet Computer,
              ensuring maximum security and privacy.
            </p>
            <div className="divider" />
            <div className="font-typewriter text-xs" style={{ color: 'var(--faded-blue)' }}>ICP Blockchain</div>
          </PaperCard>

          <PaperCard rotation={-1}>
            <div className="handwritten mb-2">Access Log #002</div>
            <h3 className="font-typewriter text-lg font-bold mb-3">Instant Access</h3>
            <p className="font-serif text-sm leading-relaxed" style={{ color: 'rgba(43, 43, 43, 0.7)' }}>
              Healthcare providers can access your records instantly with your permission,
              improving care coordination and emergency response.
            </p>
            <div className="divider" />
            <div className="font-typewriter text-xs" style={{ color: 'var(--faded-blue)' }}>Smart Contracts</div>
          </PaperCard>

          <PaperCard rotation={2}>
            <div className="handwritten mb-2">Control Panel #003</div>
            <h3 className="font-typewriter text-lg font-bold mb-3">Full Control</h3>
            <p className="font-serif text-sm leading-relaxed" style={{ color: 'rgba(43, 43, 43, 0.7)' }}>
              You decide who can access your data and when. Grant or revoke permissions
              instantly with blockchain-verified transactions.
            </p>
            <div className="divider" />
            <div className="font-typewriter text-xs" style={{ color: 'var(--faded-blue)' }}>User Sovereignty</div>
          </PaperCard>
        </div>

        <div className="hero-buttons">
          <StampButton className="px-8 py-3" onClick={() => {
            const el = document.getElementById('role-selection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>Start Your Journey</StampButton>
          <StampButton variant="secondary" className="px-8 py-3">Learn More</StampButton>
        </div>
      </div>
    </section>
  );
};

export default Hero;
