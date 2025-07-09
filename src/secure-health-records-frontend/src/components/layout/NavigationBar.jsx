import React from 'react';

const NavigationBar = () => (
  <nav className="navbar">
    <span className="brand">Secure Health Records</span>
    <div>
      <a href="#home" className="nav-link">Home</a>
      <a href="#features" className="nav-link">Features</a>
      <a href="#about" className="nav-link">About</a>
      <a href="#contact" className="nav-link">Contact</a>
    </div>
  </nav>
);

export default NavigationBar; 