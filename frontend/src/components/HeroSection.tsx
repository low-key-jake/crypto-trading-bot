import React from 'react';
import { ArrowDown, Newspaper, LineChart } from 'lucide-react';

interface HeroSectionProps {
  onScrollToTerminal: () => void;
  onOpenNews: () => void;
  onOpenLiveChart: () => void;
  scrollProgress: number; // 0 to 1 — driven by scroll position over a spacer div
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToTerminal,
  onOpenNews,
  onOpenLiveChart,
  scrollProgress
}) => {
  // ── Phase 1 (progress 0→0.55): Video zooms towards laptop screen, text fades ──
  // ── Phase 2 (progress 0.55→1.0): Video fades out, Bitcoin man bg shows through ──

  // Zoom: starts at 1x, reaches ~2.4x at full progress
  // transform-origin is set to where the laptop screen sits in the video (~50% X, ~76% Y)
  const zoomScale = 1 + scrollProgress * 1.4;

  // Text fades out quickly in the first 35% of scroll
  const textOpacity = Math.max(0, 1 - scrollProgress * 2.8);
  const textBlur = scrollProgress * 8;

  // Video fades out during phase 2 (progress 0.55 → 1.0), revealing BitcoinManBackground behind
  const videoOpacity = scrollProgress < 0.55
    ? 1
    : Math.max(0, 1 - ((scrollProgress - 0.55) / 0.45));

  // Shooting stars + nav fade with the hero
  const uiOpacity = Math.max(0, 1 - scrollProgress * 1.8);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden">
      {/* ─── Video Background with Zoom Transform ─── */}
      <div
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          transformOrigin: '50% 76%',
          transform: `scale(${zoomScale})`,
          opacity: videoOpacity,
          transition: 'opacity 0.05s linear',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover brightness-[0.82]"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        />
        {/* Night tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d1a]/50 via-transparent to-[#070d1a]/60 pointer-events-none" />
      </div>

      {/* ─── Shooting Stars ─── */}
      <div style={{ opacity: uiOpacity }} className="pointer-events-none">
        <div className="shooting-star-1" />
        <div className="shooting-star-2" />
        <div className="shooting-star-3" />
      </div>

      {/* ─── Navbar ─── */}
      <header
        className="absolute top-0 left-0 right-0 z-30 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-center"
        style={{ opacity: uiOpacity }}
      >
        <nav className="flex items-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] text-sm font-medium shadow-lg">
          <a
            href="#hero"
            data-cursor="Home"
            className="px-5 py-1.5 rounded-full bg-white/90 text-[#1a1a2e] font-semibold shadow-sm transition-all"
          >
            Home
          </a>
          <button
            onClick={onOpenLiveChart}
            data-cursor="Live Chart"
            className="px-4 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5 text-amber-200/70" />
            <span>Live Chart</span>
          </button>
          <button
            onClick={onOpenNews}
            data-cursor="News"
            className="px-4 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Newspaper className="w-3.5 h-3.5 text-white/50" />
            <span>News</span>
          </button>
        </nav>
      </header>

      {/* ─── Central "Satosphere" Title + Tagline ─── */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{
          opacity: textOpacity,
          filter: `blur(${textBlur}px)`,
          transform: `translateY(${-scrollProgress * 40}px)`,
        }}
      >
        <span className="satosphere-title text-7xl sm:text-8xl md:text-[10rem] leading-none select-none py-2">
          Satosphere
        </span>
        <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-white/40 uppercase mt-4 drop-shadow-md">
          Bitcoin Neural Intelligence & Quantitative Arbiter
        </span>

        {/* H1 Heading */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-[-2px] max-w-5xl font-normal text-white/90 mt-12"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where intelligence <em className="not-italic text-white/35">rises</em> through the silence.
        </h1>
        <p className="text-white/45 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          Dual-engine machine learning and multi-factor quantitative strategies —
          definitive buy and sell precision for Bitcoin.
        </p>
      </div>

      {/* ─── Bottom Scroll Prompt ─── */}
      <div
        className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center"
        style={{ opacity: textOpacity }}
      >
        <button
          onClick={onScrollToTerminal}
          data-cursor="Scroll Down"
          className="text-xs uppercase tracking-widest text-white/40 hover:text-white/70 flex flex-col items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-white/30" />
        </button>
      </div>
    </div>
  );
};
