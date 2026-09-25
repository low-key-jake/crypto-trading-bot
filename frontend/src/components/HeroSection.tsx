import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Newspaper, LineChart } from 'lucide-react';

interface HeroSectionProps {
  onScrollToTerminal: () => void;
  onOpenNews: () => void;
  onOpenLiveChart: () => void;
  scrollProgress: number; // 0 to 1 — driven by page scroll position
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToTerminal,
  onOpenNews,
  onOpenLiveChart,
  scrollProgress
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number>(0);

  // Sync video.currentTime with user's scrollProgress (0 to 1)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 1);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    if (video.duration) setDuration(video.duration);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Smooth scroll scrubbing loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !duration) return;

    // Calculate target frame timestamp in video (leave tiny margin at end)
    const targetTime = Math.min(duration - 0.05, Math.max(0, scrollProgress * duration));

    // Smoothly update video currentTime
    try {
      if (Math.abs(video.currentTime - targetTime) > 0.01) {
        video.currentTime = targetTime;
      }
    } catch {
      // Ignore seek interruptions
    }
  }, [scrollProgress, duration]);

  // UI & Title opacity fade out as scroll begins (first 30% of scroll)
  const textOpacity = Math.max(0, 1 - scrollProgress * 3.5);
  const textBlur = scrollProgress * 12;
  const uiOpacity = Math.max(0, 1 - scrollProgress * 2.8);

  // Video fades out slightly at the very end (last 10%) to cleanly merge into the locked BitcoinManBackground
  const videoOpacity = scrollProgress < 0.90 ? 1 : Math.max(0, 1 - (scrollProgress - 0.90) / 0.10);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#040a17]">
      {/* ─── SCROLL-SYNCED CONTINUOUS ZOOM VIDEO (`bg-zooomin.mp4`) ─── */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-75"
        style={{ opacity: videoOpacity }}
      >
        <video
          ref={videoRef}
          src="/bg-zooomin.mp4"
          preload="auto"
          muted
          playsInline
          className="w-full h-full object-cover brightness-[0.92] contrast-[1.05]"
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
          <span>Scroll to Dive into Terminal</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-amber-200/70" />
        </button>
      </div>
    </div>
  );
};
