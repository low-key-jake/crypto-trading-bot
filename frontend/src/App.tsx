import React, { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { CustomCursor } from './components/CustomCursor';
import { BitcoinManBackground } from './components/BitcoinManBackground';
import { DecisionCard } from './components/DecisionCard';
import { MarketOverviewCard } from './components/MarketOverviewCard';
import { ProbabilityPie } from './components/ProbabilityPie';
import { TradingChart } from './components/TradingChart';
import { TechnicalRadar } from './components/TechnicalRadar';
import { BacktestResults } from './components/BacktestResults';
import { NewsModal } from './components/NewsModal';
import { PlainLiveChartModal } from './components/PlainLiveChartModal';
import { 
  getAnalysis, 
  getMarket, 
  getBacktest, 
  getNews,
  getOverview,
  retrainModel, 
  type AnalysisResponse, 
  type MarketResponse, 
  type BacktestResponse,
  type NewsArticle,
  type MarketOverview
} from './services/api';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [backtest, setBacktest] = useState<BacktestResponse | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [overview, setOverview] = useState<MarketOverview | undefined>(undefined);
  
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [plainChartOpen, setPlainChartOpen] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track window scroll for locked camera sequence
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute scroll camera progress (0 to 1 over the hero pinned stage)
  const heroZoomProgress = Math.min(1, Math.max(0, scrollY / 650));
  // Reveal the locked Bitcoin man background as camera reaches laptop screen
  const secondBgOpacity = Math.min(1, Math.max(0, (scrollY - 200) / 400));

  // Slide-in effect for the "Should You Buy?" DecisionCard
  const decisionSlideProgress = Math.min(1, Math.max(0, (scrollY - 400) / 300));
  const decisionTransformX = (1 - decisionSlideProgress) * 80;
  const decisionOpacity = decisionSlideProgress;

  // Load all telemetry
  const loadData = async (targetSymbol: string = symbol, targetInterval: string = interval) => {
    try {
      setLoading(true);
      const [analysisData, marketData, backtestData, overviewData] = await Promise.all([
        getAnalysis(targetSymbol, targetInterval),
        getMarket(targetSymbol, targetInterval, 200),
        getBacktest(targetSymbol, targetInterval, 10000),
        getOverview(targetSymbol)
      ]);
      setAnalysis(analysisData);
      setMarket(marketData);
      setBacktest(backtestData);
      setOverview(overviewData);
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNews = async () => {
    try {
      setNewsLoading(true);
      const news = await getNews();
      setNewsArticles(news);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    loadData(symbol, interval);
    loadNews();
    const timer = window.setInterval(() => {
      loadData(symbol, interval);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [symbol, interval]);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      await retrainModel(symbol);
      await loadData(symbol, interval);
    } catch (err) {
      console.error('Retrain error:', err);
    } finally {
      setRetraining(false);
    }
  };

  const scrollToTerminal = () => {
    window.scrollTo({
      top: 750,
      behavior: 'smooth'
    });
  };

  const handleOpenLiveChart = () => {
    setPlainChartOpen(true);
  };

  const handleOpenNews = () => {
    setNewsOpen(true);
    if (newsArticles.length === 0) loadNews();
  };

  return (
    <div className="relative min-h-screen bg-[#030e18] text-white overflow-x-hidden selection:bg-[#c9b896]/25 selection:text-white">
      {/* Custom Lerp Cursor (Warm Champagne Gold) */}
      <CustomCursor />

      {/* Locked Atmospheric Background for the rest of website (Bitcoin man with moving chart in sky & fireflies) */}
      <BitcoinManBackground opacity={secondBgOpacity} />

      {/* 1. CINEMATIC PINNED CAMERA SEQUENCE (150vh scroll track) */}
      <div className="relative w-full h-[150vh]">
        <div 
          className="sticky top-0 w-full h-screen overflow-hidden z-20"
          style={{ pointerEvents: heroZoomProgress > 0.9 ? 'none' : 'auto' }}
        >
          <HeroSection 
            onScrollToTerminal={scrollToTerminal}
            onOpenNews={handleOpenNews}
            onOpenLiveChart={handleOpenLiveChart}
            scrollProgress={heroZoomProgress}
          />
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY STICKY HEADER */}
      <div className="sticky top-0 z-30 w-full bg-[#030e18]/90 backdrop-blur-xl border-y border-white/10 px-6 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-white/80">
              <span className="w-2 h-2 rounded-full bg-[#c9b896] animate-pulse" />
              SATOSPHERE TELEMETRY: <strong className="text-white">Bitcoin (BTC)</strong>
            </span>
            {analysis?.ticker && (
              <>
                <span className="hidden sm:inline text-white/50">
                  24h High: <strong className="text-white">${analysis.ticker.highPrice.toLocaleString()}</strong>
                </span>
                <span className="hidden sm:inline text-white/50">
                  24h Low: <strong className="text-white">${analysis.ticker.lowPrice.toLocaleString()}</strong>
                </span>
                <span className={`font-semibold ${analysis.ticker.priceChangePercent >= 0 ? 'text-[#8fae8b]' : 'text-[#c4868a]'}`}>
                  {analysis.ticker.priceChangePercent >= 0 ? '+' : ''}{analysis.ticker.priceChangePercent.toFixed(2)}%
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenLiveChart()}
              data-cursor="Live Chart"
              className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Plain Live Chart</span>
            </button>
            <button
              onClick={() => handleOpenNews()}
              data-cursor="News"
              className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Recent News</span>
            </button>
            <button
              onClick={handleRetrain}
              disabled={retraining}
              data-cursor="Train"
              className="px-3.5 py-1 rounded-full bg-[#8a7040]/15 hover:bg-[#8a7040]/25 text-[#d8ccb0] border border-[#8a7040]/30 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Fitting 1000 Candles...' : 'Re-fit Neural Trees'}</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8fae8b]" />
              <span>1,000 Depth Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN TERMINAL DASHBOARD CONTENT */}
      <main className="relative z-10 space-y-12 pb-24 pt-6">
        {/* A. "Should You Buy?" - Master Output Section (Slides in from side on scroll) */}
        <div 
          className="transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translateX(${decisionTransformX}px)`,
            opacity: decisionOpacity
          }}
        >
          <DecisionCard 
            data={analysis} 
            loading={loading} 
            onRefresh={() => loadData(symbol, interval)} 
            id="decision"
          />
        </div>

        {/* B. Bitcoin Market Overview Card (Matching Screenshot 2) */}
        <section id="market-overview-section" className="w-full max-w-7xl mx-auto px-6">
          <MarketOverviewCard
            overview={overview}
            mempool={analysis?.mempool}
            priceChangePercent={analysis?.ticker?.priceChangePercent}
          />
        </section>

        {/* C. Live Neural Market Chart & ML Probability Distribution (Matching Screenshot 1) */}
        <section className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Expanded Widescreen Neural Market Chart */}
          <div className="lg:col-span-8">
            <TradingChart
              candles={market?.candles || []}
              trades={backtest?.consensus.trades || []}
              symbol={symbol}
              interval={interval}
              verdict={analysis?.verdict}
              consensusScore={analysis?.consensus_score}
              onSymbolChange={(s) => setSymbol(s)}
              onIntervalChange={(i) => setInterval(i)}
            />
          </div>

          {/* ML Probability Distribution Donut Card */}
          <div className="lg:col-span-4">
            <ProbabilityPie
              probabilities={analysis?.ml.probabilities || { buy: 51.6, hold: 43.4, sell: 5.0 }}
              metrics={analysis?.ml.metrics}
            />
          </div>
        </section>

        {/* D. Quantitative Factors & ML Feature Weights */}
        <section className="w-full max-w-7xl mx-auto px-6">
          <TechnicalRadar
            factors={analysis?.quantitative.factors || { trend: 0, momentum: 0, volatility: 0, volume: 0 }}
            reasons={analysis?.quantitative.reasons || []}
            featureImportances={analysis?.ml.feature_importances || {}}
          />
        </section>

        {/* E. Satosphere Consensus Backtest Matrix (Unified reading) */}
        <BacktestResults 
          data={backtest} 
          loading={loading} 
        />
      </main>

      {/* Plain Live Chart Dedicated View / Modal */}
      <PlainLiveChartModal
        isOpen={plainChartOpen}
        onClose={() => setPlainChartOpen(false)}
        candles={market?.candles || []}
        overview={overview}
        currentPrice={analysis?.current_price}
        priceChangePercent={analysis?.ticker?.priceChangePercent}
      />

      {/* Bitcoin News Modal */}
      <NewsModal
        isOpen={newsOpen}
        onClose={() => setNewsOpen(false)}
        articles={newsArticles}
        loading={newsLoading}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-black/70 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/50 font-mono">
          <div className="flex items-center gap-3">
            <span className="satosphere-title text-2xl font-bold">
              Satosphere
            </span>
            <span>— Bitcoin Neural Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Binance Depth (1,000 Klines)</span>
            <span>•</span>
            <span>Mempool Fee Engine</span>
            <span>•</span>
            <span>CoinDesk Wire</span>
            <span>•</span>
            <span className="text-[#8fae8b]">Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
