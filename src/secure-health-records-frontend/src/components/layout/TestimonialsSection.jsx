import React from 'react';

const TestimonialsSection = () => (
  <section style={{ maxWidth: 900, margin: '2.5rem auto', padding: '2.5rem 2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 2px 12px #e0e7ef55' }}>
    <h2 style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: '1.1rem', color: '#222' }}>Testimonials/Use Cases</h2>
    <blockquote style={{ fontSize: '1.05rem', color: '#444', fontStyle: 'italic', marginBottom: '1.5rem', borderLeft: '4px solid #c7d2fe', paddingLeft: 16 }}>
      "I finally feel in control of my health data. Secure Health Records makes it easy to manage and share my records securely." – Emily
    </blockquote>
    <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#222', marginBottom: 8 }}>Security & Privacy</h3>
    <p style={{ fontSize: '0.98rem', color: '#444' }}>
      Your security and privacy are our top priorities. Secure Health Records employs end-to-end encryption, granular consent controls, and detailed audit trails to protect your data. Powered by Internet Identity, you can trust that your information is safe and secure.
    </p>
  </section>
);

export default TestimonialsSection; 