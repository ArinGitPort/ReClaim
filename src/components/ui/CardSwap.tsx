import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap } from 'gsap';

interface CardSwapProps {
  children: ReactNode[];
  xOffset?: number;
  yOffset?: number;
  scaleOffset?: number;
  delay?: number;
  pauseOnHover?: boolean;
}

export const CardSwap: React.FC<CardSwapProps> = ({
  children,
  xOffset = 36,
  yOffset = -36,
  scaleOffset = 0,
  delay = 5000,
  pauseOnHover = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = Array.from(containerRef.current.children) as HTMLElement[];
    if (cards.length === 0) return;

    // Initial setup
    gsap.set(cards, {
      x: (i) => i * xOffset,
      y: (i) => i * yOffset,
      scale: (i) => 1 - (i * scaleOffset),
      opacity: 1,
      zIndex: (i) => cards.length - i,
      transformOrigin: 'top center',
    });

    const swap = () => {
      if (pauseOnHover && isHoveredRef.current) return;

      const firstCard = cards.shift();
      if (!firstCard) return;

      // Move first card out diagonally
      gsap.to(firstCard, {
        x: -100,
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          cards.push(firstCard);

          // Re-stack
          cards.forEach((card, i) => {
            gsap.to(card, {
              x: i * xOffset,
              y: i * yOffset,
              scale: 1 - (i * scaleOffset),
              opacity: 1,
              zIndex: cards.length - i,
              duration: 0.6,
              ease: 'power3.out',
            });
          });
        },
      });
    };

    const autoSwapInterval = setInterval(swap, delay);

    return () => clearInterval(autoSwapInterval);
  }, [xOffset, yOffset, scaleOffset, delay, pauseOnHover]);

  return (
    <div
      className="relative w-full h-full"
      ref={containerRef}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="absolute top-0 left-0 w-full h-full">
          {child}
        </div>
      ))}
    </div>
  );
};

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`w-full h-full ${className}`}>{children}</div>;
};

export default CardSwap;