import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <div className="footer-left">
        <span className="footer-logo">🩺</span> Secure Health Records
      </div>
      <div className="footer-links">
        <a href="#" className="footer-link">Privacy</a>
        <a href="#" className="footer-link">Contact</a>
      </div>
      <div className="footer-right">
        &copy; {new Date().getFullYear()} Secure Health Records
      </div>
    </div>
  </footer>
);

export default Footer; 