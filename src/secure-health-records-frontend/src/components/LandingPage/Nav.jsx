import React, { useEffect, useState } from 'react';
import GetStartedButton from './GetStartedButton.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isLoginPage = location.pathname.startsWith('/login');

  return (
    <nav className={`navigation ${isVisible ? 'show' : 'hide'}`}>
      <div className="container">
        <div className="nav-container">
          <div className="logo">
            MediChain<span className="logo-dot">.</span>
          </div>

          {(!isLoginPage) && (
            <div className="nav-links desktop">
              <button className="nav-link" onClick={() => scrollToSection('platform')}>
                Platform
              </button>
              <button className="nav-link" onClick={() => scrollToSection('security')}>
                Security
              </button>
              <button className="nav-link" onClick={() => scrollToSection('features')}>
                Features
              </button>
              <button className="nav-link" onClick={() => scrollToSection('contact')}>
                Contact
              </button>
            </div>
          )}

          {isLoginPage ? (
            <button className="stamp-button" onClick={() => navigate('/')}>Home</button>
          ) : (
            <GetStartedButton onClick={() => scrollToSection('role-selection')} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
