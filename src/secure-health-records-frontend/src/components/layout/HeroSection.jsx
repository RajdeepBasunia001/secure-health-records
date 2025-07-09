import React from 'react';
import { useNavigate } from 'react-router-dom';
import GetStartedButton from '../GetStartedButton';

const HeroSection = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/role-selection');
  };

  return (
    <>
      <section className="hero-section" id="home">
        <h1>Take Control of Your Health Data</h1>
        <p>Secure, private, and user-owned health records on the blockchain. Access and share your medical data with confidence.</p>
        <div className="cta-buttons">
          <GetStartedButton className="cta-btn" onClick={handleGetStarted} />
          <button className="cta-btn secondary">Learn More</button>
        </div>
      </section>
      <hr className="section-divider" />
      <section className="info-cards-section" id="features">
        <div className="info-cards-container">
          <div className="info-card">
            <h3>Privacy First</h3>
            <p>Your health data is encrypted and only accessible by you and those you authorize. We never sell or share your data.</p>
          </div>
          <div className="info-card">
            <h3>Blockchain Security</h3>
            <p>All records are stored on a secure, tamper-proof blockchain, ensuring data integrity and transparency at all times.</p>
          </div>
          <div className="info-card">
            <h3>Easy Sharing</h3>
            <p>Share your medical records instantly with healthcare providers, family, or caregivers—always with your consent.</p>
          </div>
        </div>
      </section>
      <hr className="section-divider" />
      <section className="about-section" id="about">
        <div className="about-content">
          <h2>About Secure Health Records</h2>
          <p>
            Secure Health Records is a next-generation platform designed to give users full control over their medical data. Built on blockchain technology, our mission is to empower individuals to manage, access, and share their health information securely and privately. Whether you are a patient, doctor, or caregiver, our platform ensures your data is always protected and accessible when you need it most.
          </p>
        </div>
      </section>
      <hr className="section-divider" />
      <section className="contact-section" id="contact">
        <div className="contact-content">
          <h2>Contact Us</h2>
          <p>
            Have questions or need support? Reach out to our team at <a href="mailto:support@securehealthrecords.com">support@securehealthrecords.com</a> and we'll be happy to help!
          </p>
        </div>
      </section>
    </>
  );
};

export default HeroSection; 