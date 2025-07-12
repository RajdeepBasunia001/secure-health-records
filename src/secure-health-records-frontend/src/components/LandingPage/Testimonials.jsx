import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Star, StarHalf } from 'lucide-react';
import './Testimonials.css';
import PaperCard from './PaperCard';

const testimonials = [
  {
    text: 'I no longer need to carry files between doctors. 😊',
    name: 'Priya',
    location: 'Delhi',
    image: './priya.jpg',
    stars: 4.5,
  },
  {
    text: 'In an emergency, my son’s records were pulled up instantly.',
    name: 'Raj',
    location: 'Bangalore',
    image: './raj.jpg',
    stars: 5,
  },
  {
    text: 'I know exactly who accessed my reports. That’s peace of mind. 😌',
    name: 'Meena',
    location: 'Hyderabad',
    image: './meena.jpg',
    stars: 4,
  },
  {
    text: 'Everything is just there when I need it — no more guessing.',
    name: 'Ayaan',
    location: 'Pune',
    image: './ayaan.jpg',
    stars: 4.5,
  },
  {
    text: 'I switched clinics, and my history followed me instantly.👏',
    name: 'Sana',
    location: 'Lucknow',
    image: './sana.jpg',
    stars: 5,
  },
  {
    text: 'Finally, a platform that respects my privacy. 🙏',
    name: 'Sam',
    location: 'Chandigarh',
    image: './sam.jpg',
    stars: 4.5,
  },
];

const StarRating = ({ stars }) => {
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.5;
  const totalStars = 5;

  return (
    <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={18} fill="#facc15" stroke="none" />
      ))}
      {hasHalf && <StarHalf key="half" size={18} fill="#facc15" stroke="none" />}
      {[...Array(totalStars - fullStars - (hasHalf ? 1 : 0))].map((_, i) => (
        <Star key={`empty-${i}`} size={18} stroke="#ccc" fill="none" />
      ))}
    </div>
  );
};


const Testimonials = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  return (
    <section className="testimonial-area">
      <div className="container">
            <div className="text-center mb-10">
              <h1 className="hero-title" >
                <span className="hero-title-highlight">“Real Patients. </span><br />
                Real Relief.”
              </h1>
              <p className="tagline-main" style={{ fontSize: '1rem', marginTop: '0', opacity: 0.6 }}>
                What <span className="highlight">People</span> Are <span className="highlight">Saying</span> ?
              </p>

              <p className="tagline-main">
                <span className="quote quote-left">“</span>
                Our users have faced the same <span className="highlight-red">problems</span> — and finally found the right <span className="keyword">solutions</span>.
                <span className="quote quote-right">”</span>
              </p>

            </div>

        <div className="fade-wrapper">
<Slider {...settings} className="testimonial-slider">
  {testimonials.map((t, index) => (
    <PaperCard key={index} rotation={index % 3 - 1}> {/* Rotate -1, 0, 1 */}
      <div className="handwritten mb-2 client-profile">
        <div>
          <h6 className="text-sm font-bold font-typewriter">{t.name}</h6>
          <span className="text-xs" style={{ opacity: 0.8 }}>{t.location}</span>
        </div>
        <div className="client-video">
          <img
            src={t.image}
            alt="client-avatar"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 0 6px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      <div className="divider" />

      <p className="font-serif text-sm leading-relaxed mb-4" style={{ color: 'rgba(43, 43, 43, 0.7)' }}>
        “{t.text}”
      </p>
      <div className="client-info flex items-center gap-3 mt-4">
           
        <StarRating stars={t.stars} />


      </div>
    </PaperCard>
  ))}
</Slider>

        </div>

      </div>
    </section>
  );
};

export default Testimonials;


