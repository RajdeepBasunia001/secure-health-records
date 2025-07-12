import React from 'react';
import PaperCard from './PaperCard';

const Platform = () => {
  return (
    <section id="platform" className="platform main-content">
      <div className="container">
            <div className="text-center mb-10">
              <h1 className="hero-title" >
                <span className="hero-title-highlight">Introducing</span><br />
                MediChain
              </h1>
              <p className="tagline-main" style={{ fontSize: '1rem', marginTop: '0', opacity: 0.6 }}>
                Built on <span className="highlight">Internet Computer Protocol</span>
              </p>

              <p className="tagline-main">
                <span className="quote quote-left">“</span>
                A next-generation <span className="highlight">Blockchain</span> solution for modern <span className="keyword">Healthcare</span>
                <span className="quote quote-right">”</span>
              </p>

            </div>



        <div className="platform-grid">
          <div className="platform-features">
            <PaperCard rotation={1}>
              <h3 className="font-typewriter text-xl font-bold mb-3">Web3 Native</h3>
              <p
                className="font-serif leading-relaxed"
                style={{ color: 'rgba(43, 43, 43, 0.7)' }}
              >
                Built entirely on-chain with no traditional cloud dependencies.
                Your data lives on the Internet Computer, ensuring true decentralization.
              </p>
            </PaperCard>

            <PaperCard rotation={-1}>
              <h3 className="font-typewriter text-xl font-bold mb-3">Interoperable</h3>
              <p
                className="font-serif leading-relaxed"
                style={{ color: 'rgba(43, 43, 43, 0.7)' }}
              >
                Compatible with existing healthcare systems and standards.
                Seamlessly integrate with hospitals, clinics, and laboratories.
              </p>
            </PaperCard>

            
            <PaperCard rotation={-1}>
              <h3 className="font-typewriter text-xl font-bold mb-3">Permanent and Reliable</h3>
              <p
                className="font-serif leading-relaxed"
                style={{ color: 'rgba(43, 43, 43, 0.7)' }}
              >
               Once your records are added, they stay intact — unchanged, traceable, and always available when needed.
              </p>
            </PaperCard>
          </div>

          <div className="platform-visual">
            <PaperCard rotation={2}>
              <img
                src="./doctor.jpg"
                alt="Digital medical interface"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              />
              <div className="status-text">Connected Care: Globally</div>
              <div className="description-text">
                Connecting Patients with Healthcare Providers from across the world
              </div>
            </PaperCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
