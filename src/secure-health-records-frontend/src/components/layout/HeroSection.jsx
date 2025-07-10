import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgImg from '../../assets/bg.png';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section
      className="hero-section modern-hero"
      style={{
        background: `url(${bgImg}) center/cover no-repeat`,
        borderRadius: '1.5rem',
        margin: '2.5rem auto 2.5rem auto',
        maxWidth: 900,
        boxShadow: '0 4px 32px rgba(80, 80, 120, 0.08)',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Overlay for readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(2.5px)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ fontSize: '2.7rem', fontWeight: 800, marginBottom: '1.2rem', color: '#222', letterSpacing: '-1px' }}>
          Take Control of Your Health Data
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#444', marginBottom: '2.2rem', fontWeight: 400 }}>
          Securely manage and share your personal health records with healthcare providers, ensuring privacy and control.
        </p>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button
            className="cta-btn hero-primary"
            style={{ background: '#c7d2fe', color: '#222', fontWeight: 600, fontSize: '1.1rem', padding: '0.95rem 2.5rem', borderRadius: '999px', border: 'none', boxShadow: '0 2px 8px #c7d2fe55' }}
            onClick={() => navigate('/login?role=patient')}
          >
            Access My Records
          </button>
          <button
            className="cta-btn hero-secondary"
            style={{ background: '#e0e7ef', color: '#222', fontWeight: 600, fontSize: '1.1rem', padding: '0.95rem 2.5rem', borderRadius: '999px', border: 'none', boxShadow: '0 2px 8px #e0e7ef55' }}
            onClick={() => navigate('/role-selection')}
          >
            Get Started with Internet Identity
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 