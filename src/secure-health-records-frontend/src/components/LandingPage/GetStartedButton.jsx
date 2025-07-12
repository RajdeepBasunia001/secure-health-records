import React from 'react';

const GetStartedButton = ({ onClick, children = 'Get Started' }) => (
  <button className="stamp-button" onClick={onClick}>
    {children}
  </button>
);

export default GetStartedButton; 