import React from 'react';

const FooterCredits = () => {
  return (
    <div className="footer-credits">
      Built on Internet Computer Protocol • Powered by Web3 • Secured by Cryptography
    </div>
  );
}

const Footer = () => {
  return (
    <> 
    <footer className="footer main-content">
      <div className="container">
        <div className="footer-logo">
          MediChain<span className="logo-dot">.</span>
        </div>
        
        <p className="footer-tagline">
          The future of healthcare records is decentralized
        </p>
        
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Documentation</a>
        </div>
        
        <div className="footer-divider" />
        
      </div>
    </footer>
    <FooterCredits />
    </>
  );
};

export default Footer;
