import React from 'react';
import useScrollReveal from './useScrollReveal';

const ProblemSolutionSection = () => {
  const problemRef = useScrollReveal('fade-in-delay-1');
  const solutionRef = useScrollReveal('fade-in-delay-2');
  return (
    <section style={{ maxWidth: 900, margin: '2.5rem auto', padding: '2.5rem 2rem', background: 'none' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
      }}>
        {/* Problem Card */}
        <div ref={problemRef} className="modern-card fade-in-up" style={{ flex: '1 1 320px', minWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>🩺</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, color: '#b91c1c' }}>The Problem</h3>
          <p style={{ fontSize: '1.05rem', color: '#444', lineHeight: 1.7 }}>
            Current health data systems are often fragmented and difficult to navigate, leaving individuals with limited control over their own health information.
          </p>
        </div>
        {/* Solution Card */}
        <div ref={solutionRef} className="modern-card fade-in-up" style={{ flex: '1 1 320px', minWidth: 240, background: '#f7fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, color: '#2563eb' }}>Our Solution</h3>
          <p style={{ fontSize: '1.05rem', color: '#444', lineHeight: 1.7 }}>
            Secure Health Records provides a user-owned, decentralized solution, empowering you to manage your records securely and share them with healthcare providers on your terms.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection; 