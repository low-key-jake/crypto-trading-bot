import React, { useState, useRef } from 'react';
import type { Candle, MarketOverview } from '../services/api';
import { X, ExternalLink, Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';

interface PlainLiveChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  candles: Candle[];
  overview?: MarketOverview;
  currentPrice?: number;
  priceChangePercent?: number;
}

export const PlainLiveChartModal: React.FC<PlainLiveChartModalProps> = ({
  isOpen,
  onClose,
  candles,
  overview,
  currentPrice = 84350.69,
  priceChangePercent = -2.20
}) => {
  const [activeRange, setActiveRange] = useState('24H');
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const isPositive = priceChangePercent >= 0;

  // Filter candles based on selected range
  const displayedCandles = candles.slice(
    activeRange === '24H' ? -24 : activeRange === '5D' ? -60 : activeRange === '1M' ? -120 : -180
  );

  const prices = displayedCandles.map(c => c.close);
  const minPrice = Math.min(...prices) * 0.997;
  const maxPrice = Math.max(...prices) * 1.003;
  const priceRange = maxPrice - minPrice || 1;

  const height = 420;
  const width = 1100;

  const getY = (p: number) => height - ((p - minPrice) / priceRange) * (height - 60) - 30;
  const getX = (i: number) => (i / (displayedCandles.length - 1)) * (width - 60) + 30;

  const pricePoints = displayedCandles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ');
  const areaPoints = `${getX(0)},${height} ` + pricePoints + ` ${getX(displayedCandles.length - 1)},${height}`;

  const hoveredCandle = hoverIndex !== null && displayedCandles[hoverIndex]
    ? displayedCandles[hoverIndex]
    : displayedCandles[displayedCandles.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-rise">
      <div className="relative w-full max-w-6xl max-h-[92vh] glass-panel rounded-[36px] p-6 sm:p-8 flex flex-col border border-white/20 shadow-2xl overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bitcoin className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span>Cryptocurrency</span>
                <span>•</span>
                <span>USD</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">Live Market Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Bitcoin USD Price (BTC-USD)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:items-end">
              <div className="text-3xl font-mono font-bold text-white tracking-tight">
                ${(hoveredCandle?.close || currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-mono font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isPositive ? '+' : ''}{(currentPrice * (priceChangePercent / 100)).toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <a
              href="https://www.tradingview.com/chart/?symbol=BINANCE%3ABTCUSDT"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Open Tab"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Full TradingView Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeframe Bar (Matching Screenshot 2) */}
        <div className="flex flex-wrap items-center justify-between py-4 border-b border-white/10 gap-4">
          <div className="flex items-center rounded-xl bg-white/10 p-1 border border-white/10 text-xs font-mono">
            {['24H', '5D', '1M', '6M', 'YTD', '1Y', 'All'].map(range => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeRange === range ? 'bg-amber-400 text-black font-bold shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-white/20 border-white/40 text-white font-semibold' : 'border-white/10 text-white/50'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('candles')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                chartType === 'candles' ? 'bg-white/20 border-white/40 text-white font-semibold' : 'border-white/10 text-white/50'
              }`}
            >
              Candles
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div
          ref={containerRef}
          onMouseMove={(e) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const ratio = (e.clientX - rect.left) / rect.width;
            const idx = Math.min(displayedCandles.length - 1, Math.max(0, Math.floor(ratio * displayedCandles.length)));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
          className="relative w-full aspect-[22/10] min-h-[380px] bg-black/60 rounded-2xl p-4 my-4 overflow-hidden border border-white/10 cursor-crosshair select-none"
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="plainChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
              <line
                key={idx}
                x1="30"
                y1={height * ratio}
                x2={width - 30}
                y2={height * ratio}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {chartType === 'area' ? (
              <>
                <polygon points={areaPoints} fill="url(#plainChartGradient)" />
                <polyline points={pricePoints} fill="none" stroke="#e5c07b" strokeWidth="2.5" />
              </>
            ) : (
              displayedCandles.map((c, i) => {
                const x = getX(i);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const isGreen = c.close >= c.open;
                const candleHeight = Math.max(2, Math.abs(yClose - yOpen));
                const topY = Math.min(yOpen, yClose);

                return (
                  <g key={i}>
                    {/* Wick */}
                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={isGreen ? '#34d399' : '#f87171'} strokeWidth="1.2" />
                    {/* Body */}
                    <rect
                      x={x - 4}
                      y={topY}
                      width={8}
                      height={candleHeight}
                      fill={isGreen ? '#10b981' : '#ef4444'}
                    />
                  </g>
                );
              })
            )}

            {/* Crosshair indicator */}
            {hoverIndex !== null && (
              <>
                <line
                  x1={getX(hoverIndex)}
                  y1="10"
                  x2={getX(hoverIndex)}
                  y2={height - 10}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(hoveredCandle.close)}
                  r="5"
                  fill="#ffffff"
                  stroke="#d4af37"
                  strokeWidth="2.5"
                />
              </>
            )}
          </svg>

          {/* Hover values tooltip */}
          {hoverIndex !== null && (
            <div className="absolute top-4 left-6 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-white flex items-center gap-4">
              <span>Time: <strong className="text-amber-300">{hoveredCandle.time}</strong></span>
              <span>Price: <strong className="text-white">${hoveredCandle.close.toLocaleString()}</strong></span>
              <span>Volume: <strong className="text-white/80">{hoveredCandle.volume.toFixed(2)} BTC</strong></span>
            </div>
          )}
        </div>

        {/* Bottom Key Stats Bar (Matching Screenshot 2) */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-white/10 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-white/40 block text-[10px]">MARKET CAP</span>
              <strong className="text-white text-sm">{overview.market_cap}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-white/40 block text-[10px]">24H VOLUME</span>
              <strong className="text-white text-sm">{overview.volume_24h}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-white/40 block text-[10px]">DAY'S RANGE</span>
              <strong className="text-white text-xs">${overview.days_range_low.toLocaleString()} - ${overview.days_range_high.toLocaleString()}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-white/40 block text-[10px]">52W RANGE</span>
              <strong className="text-white text-xs">${overview.week_52_low.toLocaleString()} - ${overview.week_52_high.toLocaleString()}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-white/40 block text-[10px]">ALL-TIME HIGH</span>
              <strong className="text-amber-300 text-sm">${overview.all_time_high.toLocaleString()}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-white/40 block text-[10px]">CIRCULATING SUPPLY</span>
              <strong className="text-white text-sm">{overview.circulating_supply}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
