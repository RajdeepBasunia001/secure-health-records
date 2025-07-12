import React from 'react';
import PaperCard from './PaperCard';


const Security = () => {
  return (
    <section id="security" className="security main-content">
      <div className="container">
        <div className="text-center mb-6">
          <h2 className="section-title">Security First</h2>
          <p className="section-subtitle">
            Your health data protected by cryptographic guarantees
          </p>
        </div>

        <div className="security-grid">
          <PaperCard rotation={1}>
            <div className="handwritten mb-2">Security Protocol v2.1</div>
            <h3 className="font-typewriter text-lg font-bold mb-3">End-to-End Encryption</h3>
            <p
              className="font-serif text-sm"
              style={{ color: 'rgba(43, 43, 43, 0.7)' }}
            >
              All data is encrypted before it leaves your device and remains encrypted on the blockchain.
            </p>
          </PaperCard>

          <PaperCard rotation={-1}>
            <div className="handwritten mb-2">Access Control v1.8</div>
            <h3 className="font-typewriter text-lg font-bold mb-3">Zero-Knowledge Proofs</h3>
            <p
              className="font-serif text-sm"
              style={{ color: 'rgba(43, 43, 43, 0.7)' }}
            >
              Prove medical credentials without revealing sensitive information.
            </p>
          </PaperCard>

          <PaperCard rotation={2}>
            <div className="handwritten mb-2">Audit Trail v3.0</div>
            <h3 className="font-typewriter text-lg font-bold mb-3">Immutable Records</h3>
            <p
              className="font-serif text-sm"
              style={{ color: 'rgba(43, 43, 43, 0.7)' }}
            >
              Complete audit trail of all access and modifications, tamper-proof by design.
            </p>
          </PaperCard>
        </div>
      </div>
    </section>
  );
};

export default Security;
