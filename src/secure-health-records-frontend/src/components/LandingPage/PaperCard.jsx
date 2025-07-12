// components/PaperCard.jsx
import React, { useState } from 'react';

const PaperCard = ({ children, rotation = 0, className = '', style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  const rotationClass = (() => {
    switch (rotation) {
      case 1: return 'rotate-1';
      case -1: return 'rotate-neg-1';
      case 2: return 'rotate-2';
      case -2: return 'rotate-neg-2';
      default: return '';
    }
  })();

  return (
    <div
      className={`paper-card ${rotationClass} ${className}`.trim()}
      style={{
        transform: `rotate(${isHovered ? 0 : rotation}deg)`,
        transition: 'transform 0.3s ease',
        ...style
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default PaperCard;
