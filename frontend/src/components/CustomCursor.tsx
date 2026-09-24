import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnter, setIsEnter] = useState(false);
  const [label, setLabel] = useState('Enter');

  const mousePos = useRef({ x: -100, y: -100 });
  const orbitPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [data-cursor], .interactive');
      if (interactiveEl) {
        setIsEnter(true);
        const customLabel = interactiveEl.getAttribute('data-cursor') || 'Inspect';
        setLabel(customLabel);
      } else {
        setIsEnter(false);
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    let rafId: number;
    const loop = () => {
      // Lerp orbit position by 0.2
      orbitPos.current.x += (mousePos.current.x - orbitPos.current.x) * 0.2;
      orbitPos.current.y += (mousePos.current.y - orbitPos.current.y) * 0.2;

      if (orbitRef.current) {
        orbitRef.current.style.transform = `translate3d(${orbitPos.current.x}px, ${orbitPos.current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  return (
    <div className={`custom-cursor ${isVisible ? 'is-visible' : ''} ${isEnter ? 'is-enter' : ''}`}>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={orbitRef} className="cursor-orbit">
        <span className="cursor-label">{label}</span>
      </div>
    </div>
  );
};
