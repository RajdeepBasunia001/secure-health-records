import React from 'react';

const LandingFooter = () => (
  <footer style={{ width: '100%', background: '#f7fafc', color: '#444', padding: '2.2rem 0 1.2rem 0', borderRadius: '1.2rem 1.2rem 0 0', marginTop: '3rem' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.2rem', padding: '0 2rem' }}>
      <div style={{ display: 'flex', gap: '0.8rem', fontSize: '1.2rem' }}>
        <span role="img" aria-label="twitter">🐦</span>
        <span role="img" aria-label="github">💻</span>
        <span role="img" aria-label="instagram">📸</span>
      </div>
      <div style={{ fontSize: '0.98rem', color: '#888', marginTop: 8 }}>
        &copy; {new Date().getFullYear()} Secure Health Records. All rights reserved.
      </div>
    </div>
  </footer>
);

export default LandingFooter; 