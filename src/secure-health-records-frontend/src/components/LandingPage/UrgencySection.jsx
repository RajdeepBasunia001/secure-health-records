import React from 'react';
import './UrgencySection.css';
import Login from './Login';

const UrgencySection = () => {
  return (
    <section className="urgency-section">
      <div className="urgency">

        <h1 className="urgency-title">Protect Your Records Now</h1>
        <div className="cover"></div>
        
        <div className="urgency-content">
          {/* Left Side */}
          <div className="urgency-img hero-title-highlight">
            <h3 className="img-left">
                 Data loss, breaches, and medical delays happen every day.
            </h3>
            <div className="img-center">
                <span className="img-top">Your Health Can't Wait !</span>
                <img src="./register.png" alt="login or signup" />
            </div>
            <h3 className="img-right">
                Don't be a victim of outdated systems.
            </h3>
    
          </div>

          {/* Right Side */}
          <div className="urgency-cta">
            <div className="login-top">
                <h3>
                    Join
                </h3>
                <div class="footer-logo">
                    <span>MediChain</span>
                    <span class="logo-dot">.</span></div>
            </div>
            < Login />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrgencySection;
