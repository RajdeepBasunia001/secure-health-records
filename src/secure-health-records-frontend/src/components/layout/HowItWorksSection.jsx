import React from 'react';
import useScrollReveal from './useScrollReveal';

const steps = [
  {
    icon: '📝',
    title: 'Create Account',
    desc: 'Sign up securely using Internet Identity.'
  },
  {
    icon: '📄',
    title: 'Upload/View Records',
    desc: 'Easily upload your health records and view them anytime.'
  },
  {
    icon: '👨‍⚕️',
    title: 'Share with Doctor',
    desc: 'Share specific records with your doctor with a few clicks.'
  },
];

const HowItWorksSection = () => (
  <section style={{ maxWidth: 900, margin: '2.5rem auto', padding: '2.5rem 2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 2px 12px #e0e7ef55' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: '#222', textAlign: 'center' }}>How It Works</h2>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center' }}>
      {steps.map((s, i) => {
        const stepRef = useScrollReveal(`fade-in-delay-${i+1}`);
        return (
          <div
            key={s.title}
            ref={stepRef}
            className="fade-in-up"
            style={{ textAlign: 'center', minWidth: 180, maxWidth: 220, flex: '1 1 180px' }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{s.icon}</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#222', marginBottom: 6 }}>{s.title}</h3>
            <p style={{ fontSize: '0.97rem', color: '#444' }}>{s.desc}</p>
          </div>
        );
      })}
    </div>
  </section>
);

export default HowItWorksSection; 