import { useEffect, useRef } from 'react';

export default function useScrollReveal(delayClass = '') {
  const ref = useRef();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handleReveal = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          node.classList.add('scroll-reveal');
          if (delayClass) node.classList.add(delayClass);
          observer.unobserve(node);
        }
      });
    };
    const observer = new window.IntersectionObserver(handleReveal, {
      threshold: 0.15,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [delayClass]);

  return ref;
} 