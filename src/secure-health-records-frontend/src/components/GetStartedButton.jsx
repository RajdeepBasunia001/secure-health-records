import React from 'react';

const GetStartedButton = ({ className = '', onClick }) => (
  <button className={`cta-btn ${className}`.trim()} onClick={onClick}>
    Get Started
  </button>
);

export default GetStartedButton; 