import React, { useEffect, useState } from 'react';

const ScatteredDocs = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

const commonSize = '13rem';             
const scrollFactor = 0.04;            

const docs = [
  {
    id: "chart-1",
    src: "./repo1.jpg",
    alt: "Medical chart",
    style: {
      top: '8%',
      left: '8%',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(12deg)`,
    }
  },
  {
    id: "ecg-1",
    src: "./repo2.jpg",
    alt: "ECG chart",
    style: {
      top: '8%',
      right: '8%',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(-8deg)`,
    }
  },
  {
    id: "prescription-1",
    src: "./repo3.jpg",
    alt: "Medical prescription",
    style: {
      bottom: '8%',
      left: '8%',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(-8deg)`,
    }
  },
  {
    id: "xray-1",
    src: "./repo8.webp",
    alt: "Medical X-ray",
    style: {
      bottom: '8%',
      right: '8%',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(12deg)`,
    }
  },
  {
    id: "form-1",
    src: "./repo5.jpg",
    alt: "Medical form",
    style: {
      top: '40%',
      left: '18%',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(-4deg)`,
    }
  },
  {
    id: "stethoscope-1",
    src: "./repo7.jpg",
    alt: "Medical stethoscope",
    style: {
      top: '40%',
      right: '18%',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(15deg)`,
    }
  },
    {
    id: "top-l",
    src: "./repo4.jpg",
    alt: "Medical form",
    style: {
      top: '-30%',
      left: '18%',
      filter: 'grayscale(90%)',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(-8deg)`,
    }
  },
    {
    id: "top-r",
    src: "./repo6.jpg",
    alt: "Medical form",
    style: {
      top: '-30%',
      right: '18%',
      filter: 'grayscale(80%)',
      width: commonSize,
      height: commonSize,
      transform: `translateY(${scrollY * scrollFactor}px) rotate(12deg)`,
    }
  }
];


  return (
    <div className="scattered-docs" style={{ position: 'fixed', width: '100%', height: '100vh' }}>
      {docs.map(doc => (
        <div
          key={doc.id}
          className="scattered-doc"
          style={{
            position: 'absolute',
            opacity: 0.6,
            ...doc.style
          }}
        >
          <img
            src={doc.src}
            alt={doc.alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ScatteredDocs;
