import React from 'react';
import vaultImg from '../../assets/vault.png';
import lockImg from '../../assets/lock.png';
import concentImg from '../../assets/concent.png';
import internetidImg from '../../assets/internetid.png';
import auditImg from '../../assets/audit.png';
import historyImg from '../../assets/history.png';
import useScrollReveal from './useScrollReveal';

const features = [
  {
    img: vaultImg,
    title: 'Patient-Owned Data',
    desc: 'Your health data is yours. You have full ownership and control over your records.'
  },
  {
    img: lockImg,
    title: 'End-to-End Encryption',
    desc: 'All data is encrypted both in transit and at rest, ensuring maximum security.'
  },
  {
    img: concentImg,
    title: 'Consent-Based Access',
    desc: 'You decide who can access your data and for how long, with granular consent settings.'
  },
  {
    img: internetidImg,
    title: 'Internet Identity Login',
    desc: 'Securely log in using Internet Identity, a decentralized authentication system.'
  },
  {
    img: auditImg,
    title: 'Audit Logs',
    desc: 'Track all access and modifications to your records with detailed audit logs.'
  },
  {
    img: historyImg,
    title: 'Immutable History',
    desc: 'Data is stored on a decentralized network, making it tamper-proof and ensuring its integrity.'
  },
];

const FeaturesSection = () => (
  <section style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '2.5rem 1.5rem' }}>
    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2.2rem', color: '#222', textAlign: 'center' }}>Key Features</h2>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.2rem', justifyContent: 'center' }}>
      {features.map((f, i) => {
        const cardRef = useScrollReveal(`fade-in-delay-${i+1}`);
        return (
          <div
            key={f.title}
            ref={cardRef}
            className={`modern-card card-hover-animate fade-in-up`}
            style={{ maxWidth: 220, minWidth: 180, textAlign: 'center', flex: '1 1 180px' }}
          >
            <img src={f.img} alt={f.title} style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 18, borderRadius: 12, background: '#e0e7ef' }} />
            <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#222', marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: '0.98rem', color: '#444' }}>{f.desc}</p>
          </div>
        );
      })}
    </div>
  </section>
);

export default FeaturesSection; 