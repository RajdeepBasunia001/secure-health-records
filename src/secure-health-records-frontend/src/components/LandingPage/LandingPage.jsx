import React from 'react';
import './LandingPage.css';
import Navigation from './Nav.jsx';
import Hero from './Hero.jsx';
import Feature from './Feature.jsx';
import InsightSection from './InsightSection.jsx';
import Platform from './Platform.jsx';
import Security from './Security.jsx';
import Testimonials from './Testimonials.jsx';
import UrgencySection from './UrgencySection.jsx';
import ScatteredDocs from './ScatteredDocs.jsx';
import Footer from './Footer.jsx';
import RoleSelection from '../auth/RoleSelection.jsx';

const LandingPage = () => {
  return (
    <div className="paper-texture">
      <Navigation />
      <Hero />
      <Feature />
      {/* <StickyCards /> */}
      <InsightSection />
      <Platform />
      <Security />
      <Testimonials />
      <UrgencySection />
      <section id="role-selection">
        <RoleSelection />
      </section>
      <ScatteredDocs />
      <Footer />
    </div>
  );
};

export default LandingPage; 