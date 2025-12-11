
import React from 'react';
import { ShieldCheck, FolderLock, ArrowRightCircle } from 'lucide-react';
import PaperCard from './PaperCard';
import './InsightSection.css';

const InsightSection = () => {
  const features = [
    {
      icon: <ShieldCheck className="icon mb-2" />,
      title: 'Secure by Design',
      desc: 'Every record is stored with integrity in mind. No duplication, no tampering — just clarity and confidence.',
      label: 'Data Layer v1.0',
      rotation: 1,
    },
    {
      icon: <FolderLock className="icon mb-2" />,
      title: 'Only You Decide',
      desc: 'Share data with doctors only when you want to. Total control, always.',
      label: 'Access Layer v2.3',
      rotation: -1,
    },
    {
      icon: <ArrowRightCircle className="icon mb-2" />,
      title: 'Always Up-to-Date',
      desc: 'One truth across devices and doctors. No repeats. No confusion.',
      label: 'Sync Engine v0.9',
      rotation: 2,
    },
  ];

  return (
    <section id="insight" className="insight main-content">
      <div className="container">
        <div className="text-center mb-6">
          <h2 className="section-title">
            What If <span className="text-primary">You</span> Owned Your Health Data?
          </h2>
          <p className="section-subtitle">
            Imagine one secure place where all your records live — always up to date, always in your control.
          </p>
        </div>

        <div className="security-grid">
          {features.map((f, i) => (
            <PaperCard key={i} rotation={f.rotation}>
              <div className="handwritten mb-2">{f.label}</div>
              <div class="divider"></div>
              {f.icon}
              <h3 className="font-typewriter text-lg font-bold mb-2">{f.title}</h3>
              <div class="divider"></div>
              <p className="font-serif text-sm" style={{ color: 'rgba(43, 43, 43, 0.7)' }}>
                {f.desc}
              </p>
            </PaperCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsightSection;
