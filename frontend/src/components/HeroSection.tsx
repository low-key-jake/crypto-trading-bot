import React, { useEffect, useRef } from 'react';
import { ArrowDown, Newspaper, LineChart } from 'lucide-react';

interface HeroSectionProps {
  onScrollToTerminal: () => void;
  onOpenNews: () => void;
  onOpenLiveChart: () => void;
  scrollProgress: number; // 0 to 1 — driven by scroll position over the 250vh pinned track
}

const TOTAL_FRAMES = 40;

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToTerminal,
  onOpenNews,
  onOpenLiveChart,
  scrollProgress
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Preload all 40 extracted high-res frames for 60fps flicker-free canvas scrubbing
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = i.toString().padStart(2, '0');
      img.src = `/zoom_frames/zoom_${num}.jpg`;
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
  }, []);

  // Render current frame to canvas based on scrollProgress
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(scrollProgress * TOTAL_FRAMES))
    );

    const img = imagesRef.current[frameIndex];

    const draw = () => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      if (img && img.complete && img.naturalWidth > 0) {
        // Draw image covering screen (cover math)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const screenRatio = w / h;

        let renderW = w;
        let renderH = h;
        let offsetX = 0;
        let offsetY = 0;

        if (screenRatio > imgRatio) {
          renderH = w / imgRatio;
          offsetY = (h - renderH) / 2;
        } else {
          renderW = h * imgRatio;
          offsetX = (w - renderW) / 2;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
      }
    };

    if (img && !img.complete) {
      img.onload = draw;
    } else {
      draw();
    }
  }, [scrollProgress]);

  // UI & Title opacity fade out as scroll begins (first 30% of scroll)
  const textOpacity = Math.max(0, 1 - scrollProgress * 3.5);
  const textBlur = scrollProgress * 12;
  const uiOpacity = Math.max(0, 1 - scrollProgress * 2.8);

  // Hero canvas fades out at the very end (last 10% of scroll) to smoothly reveal the locked BitcoinManBackground
  const canvasOpacity = scrollProgress < 0.90 ? 1 : Math.max(0, 1 - (scrollProgress - 0.90) / 0.10);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#040a17]">
      {/* ─── SCROLL-LOCKED HIGH-PERFORMANCE 60FPS VIDEO ZOOM CANVAS ─── */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-75"
        style={{ opacity: canvasOpacity }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Subtle Dreamcore Night Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040a17]/35 via-transparent to-[#040a17]/65 pointer-events-none" />
      </div>

      {/* ─── Shooting Stars ─── */}
      <div style={{ opacity: uiOpacity }} className="pointer-events-none z-10">
        <div className="shooting-star-1" />
        <div className="shooting-star-2" />
        <div className="shooting-star-3" />
      </div>

      {/* ─── Floating Header Nav ─── */}
      <header
        className="absolute top-0 left-0 right-0 z-30 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-center transition-opacity duration-150"
        style={{ opacity: uiOpacity }}
      >
        <nav className="flex items-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] text-sm font-medium shadow-2xl">
          <a
            href="#hero"
            data-cursor="Home"
            className="px-5 py-1.5 rounded-full bg-white/90 text-[#09152b] font-semibold shadow-md transition-all"
          >
            Home
          </a>
          <button
            onClick={onOpenLiveChart}
            data-cursor="Live Chart"
            className="px-4 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/[0.1] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5 text-amber-200/90" />
            <span>Live Chart</span>
          </button>
          <button
            onClick={onOpenNews}
            data-cursor="News"
            className="px-4 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/[0.1] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Newspaper className="w-3.5 h-3.5 text-sky-200/80" />
            <span>News</span>
          </button>
        </nav>
      </header>

      {/* ─── Main Hero Branding & Quotation ─── */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{
          opacity: textOpacity,
          filter: `blur(${textBlur}px)`,
          transform: `translateY(${-scrollProgress * 50}px)`,
        }}
      >
        <span className="satosphere-title text-7xl sm:text-8xl md:text-[10rem] leading-none select-none py-2 drop-shadow-2xl">
          Satosphere
        </span>
        <span className="text-xs sm:text-sm font-mono tracking-[0.28em] text-sky-100/60 uppercase mt-4 drop-shadow-lg">
          Bitcoin Neural Intelligence & Quantitative Arbiter
        </span>

        {/* H1 Heading */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-[-2px] max-w-5xl font-normal text-white/95 mt-10 drop-shadow-md"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where intelligence <em className="not-italic text-white/40">rises</em> through the silence.
        </h1>
        <p className="text-white/55 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          Dual-engine machine learning and multi-factor quantitative strategies —
          definitive buy and sell precision for Bitcoin.
        </p>
      </div>

      {/* ─── Scroll Prompt ─── */}
      <div
        className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center pointer-events-auto"
        style={{ opacity: textOpacity }}
      >
        <button
          onClick={onScrollToTerminal}
          data-cursor="Scroll Down"
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white flex flex-col items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Scroll to Zoom into Terminal</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-amber-200/70" />
        </button>
      </div>
    </div>
  );
};
