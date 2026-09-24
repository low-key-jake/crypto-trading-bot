import React, { useEffect, useRef } from 'react';

interface BitcoinManBackgroundProps {
  opacity: number;
}

export const BitcoinManBackground: React.FC<BitcoinManBackgroundProps> = ({ opacity }) => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Dynamic animated floating candlestick wave points in the night sky
    const pointsCount = 42;
    const candles = Array.from({ length: pointsCount }, (_, i) => ({
      baseY: height * 0.30 + Math.sin(i * 0.42) * 65,
      phase: Math.random() * Math.PI * 2,
      speedX: 0.02 + (i % 3) * 0.008,
      speedY: 0.025 + Math.random() * 0.015,
      height: 16 + Math.random() * 34,
      isGreen: (i % 2 === 0)
    }));

    let t = 0;
    const render = () => {
      t += 0.025;
      ctx.clearRect(0, 0, width, height);

      const step = width / (pointsCount - 1);

      // 1. Draw glowing wave line behind the candlesticks
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 16;

      for (let i = 0; i < pointsCount; i++) {
        const c = candles[i];
        // Dynamic undulating wave motion
        const yOffset = Math.sin(t * c.speedY * 18 + c.phase) * 22 + Math.cos(t * 0.5 + i * 0.3) * 14;
        const xOffset = Math.sin(t * 0.4 + i) * 6;
        const x = i * step + xOffset;
        const y = c.baseY + yOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw moving glowing candlesticks
      candles.forEach((c, i) => {
        const yOffset = Math.sin(t * c.speedY * 18 + c.phase) * 22 + Math.cos(t * 0.5 + i * 0.3) * 14;
        const xOffset = Math.sin(t * 0.4 + i) * 6;
        const x = i * step + xOffset;
        const y = c.baseY + yOffset;
        // Fluctuating candle body height for active motion
        const dynamicH = c.height + Math.sin(t * 2 + i) * 8;

        ctx.shadowBlur = 10;
        if (c.isGreen) {
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
          ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
          ctx.shadowColor = '#34d399';
        } else {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
          ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
          ctx.shadowColor = '#f59e0b';
        }

        // Wick
        ctx.beginPath();
        ctx.moveTo(x, y - dynamicH * 1.3);
        ctx.lineTo(x, y + dynamicH * 1.3);
        ctx.stroke();

        // Body
        ctx.fillRect(x - 5, y - dynamicH * 0.5, 10, Math.max(4, dynamicH));
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* Background Image: Bitcoin man in flower field with wind swaying effect */}
      <div className="absolute inset-0 w-full h-full wind-swaying-flowers">
        <img
          src="/bitcoin_man_bg.jpg"
          alt="Satosphere Bitcoin Assistance"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
        />
      </div>

      {/* Floating Animated Chart Wave Canvas in Sky (Continuously in lively motion) */}
      <canvas
        ref={chartCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
      />

      {/* Subtle Dreamy Night Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030e18]/45 via-transparent to-[#030e18]/90 pointer-events-none" />

      {/* Drifting Flower Petals blown by wind */}
      <div className="wind-petal bg-amber-200/40 w-3 h-2" style={{ top: '15%', left: '80%', animationDelay: '0s', animationDuration: '12s' }} />
      <div className="wind-petal bg-emerald-200/35 w-2.5 h-1.5" style={{ top: '25%', left: '92%', animationDelay: '2.5s', animationDuration: '15s' }} />
      <div className="wind-petal bg-rose-200/40 w-3 h-2" style={{ top: '35%', left: '70%', animationDelay: '5s', animationDuration: '13s' }} />
      <div className="wind-petal bg-amber-100/50 w-2 h-1.5" style={{ top: '50%', left: '85%', animationDelay: '7.5s', animationDuration: '14s' }} />
      <div className="wind-petal bg-amber-200/40 w-3.5 h-2" style={{ top: '10%', left: '60%', animationDelay: '9s', animationDuration: '16s' }} />

      {/* Random Fireflies lighting up at intervals */}
      <div className="firefly" style={{ top: '64%', left: '18%', animationDelay: '0s' }} />
      <div className="firefly" style={{ top: '76%', left: '34%', animationDelay: '1.8s' }} />
      <div className="firefly" style={{ top: '70%', left: '55%', animationDelay: '3.2s' }} />
      <div className="firefly" style={{ top: '80%', left: '72%', animationDelay: '0.9s' }} />
      <div className="firefly" style={{ top: '62%', left: '85%', animationDelay: '2.4s' }} />
      <div className="firefly" style={{ top: '73%', left: '44%', animationDelay: '4.1s' }} />
    </div>
  );
};
