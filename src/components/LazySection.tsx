import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string;
  id?: string;
}

export function LazySection({ 
  children, 
  threshold = 0, 
  rootMargin = '800px 0px',
  minHeight = 'auto',
  id
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Immediate or timeout safety fallback so sections never stay blank
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        clearTimeout(safetyTimer);
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: '800px 0px' });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} id={id} className="scroll-mt-24" style={{ minHeight }}>
      {isVisible ? children : (
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
}
