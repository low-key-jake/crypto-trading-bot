import React, { useRef, useState } from 'react';
import type { Candle, BacktestTrade } from '../services/api';
import { LineChart as ChartIcon, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TradingChartProps {
  candles: Candle[];
  trades?: BacktestTrade[];
  symbol: string;
  interval: string;
  verdict?: string;
  consensusScore?: number;
  onIntervalChange: (interval: string) => void;
  onSymbolChange: (symbol: string) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  trades = [],
  symbol = 'BTCUSDT',
  interval,
  verdict,
  consensusScore,
  onIntervalChange,
  onSymbolChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    ema50: true,
    bollinger: true,
    markers: true
  });

  if (!candles || candles.length === 0) {
    return (
      <div className="glass-panel p-10 rounded-[36px] min-h-[480px] flex items-center justify-center text-white/50 font-mono">
        Loading High-Resolution Candlestick Stream...
      </div>
    );
  }

  // Min and Max prices for chart scaling
  const prices = candles.map(c => c.close);
  const minPrice = Math.min(...prices) * 0.996;
  const maxPrice = Math.max(...prices) * 1.004;
  const priceRange = maxPrice - minPrice || 1;

  // Cinematic Expanded Dimensions
  const height = 480;
  const width = 1200;

  const getY = (price: number) => {
    return height - ((price - minPrice) / priceRange) * (height - 70) - 35;
  };

  const getX = (index: number) => {
    return (index / (candles.length - 1)) * (width - 60) + 30;
  };

  // Generate SVG path for line / area
  const pricePoints = candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ');
  const areaPoints = `${getX(0)},${height} ` + pricePoints + ` ${getX(candles.length - 1)},${height}`;

  const smaPoints = candles
    .filter(c => c.sma20 !== null)
    .map(c => `${getX(candles.indexOf(c))},${getY(c.sma20!)}`)
    .join(' ');

  const emaPoints = candles
    .filter(c => c.ema50 !== null)
    .map(c => `${getX(candles.indexOf(c))},${getY(c.ema50!)}`)
    .join(' ');

  const bbUpperPoints = candles
    .filter(c => c.bb_upper !== null)
    .map(c => `${getX(candles.indexOf(c))},${getY(c.bb_upper!)}`)
    .join(' ');

  const bbLowerPoints = candles
    .filter(c => c.bb_lower !== null)
    .map(c => `${getX(candles.indexOf(c))},${getY(c.bb_lower!)}`)
    .join(' ');

  const hoveredCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];
  const isBuy = verdict?.includes('BUY');
  const isSell = verdict?.includes('SELL');

  return (
    <div id="chart" className="glass-panel p-6 sm:p-10 rounded-[36px] flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-2xl">
      {/* Chart Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-[#c9b896]" />
            <h3 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
              LIVE NEURAL MARKET CHART
            </h3>
          </div>

          {/* Pinned Master Verdict Badge */}
          {verdict && (
            <div 
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide flex items-center gap-2 shadow-md ${
                isBuy
                  ? 'bg-[#2a4030]/80 text-[#d4e0d2] border border-[#4a6e4a]/40'
                  : isSell
                  ? 'bg-[#3a1a1d]/80 text-[#e8cfd0] border border-[#7a3a3d]/40'
                  : 'bg-slate-800/80 text-white/90 border border-white/20'
              }`}
            >
              {isBuy && <TrendingUp className="w-4 h-4 text-[#8fae8b]" />}
              {isSell && <TrendingDown className="w-4 h-4 text-[#c4868a]" />}
              {!isBuy && !isSell && <AlertCircle className="w-4 h-4 text-[#c9b896]" />}
              <span>{verdict}</span>
              {consensusScore !== undefined && (
                <span className="text-[11px] opacity-75">({consensusScore > 0 ? `+${consensusScore}` : consensusScore})</span>
              )}
            </div>
          )}

          {/* Symbol Selectors */}
          <div className="flex items-center rounded-xl bg-white/10 p-1 border border-white/10">
            {['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].map(sym => (
              <button
                key={sym}
                onClick={() => onSymbolChange(sym)}
                data-cursor="Select"
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  symbol === sym ? 'bg-[#a89068] text-black font-semibold shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                {sym.replace('USDT', '')}
              </button>
            ))}
          </div>

          {/* Interval Switcher */}
          <div className="flex items-center rounded-xl bg-white/10 p-1 border border-white/10">
            {['15m', '1h', '4h', '1d'].map(intv => (
              <button
                key={intv}
                onClick={() => onIntervalChange(intv)}
                data-cursor="Interval"
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  interval === intv ? 'bg-white/20 text-white shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                {intv}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowIndicators(p => ({ ...p, sma20: !p.sma20 }))}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showIndicators.sma20 ? 'bg-[#8a7040]/20 border-[#8a7040]/50 text-[#c9b896] font-semibold' : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowIndicators(p => ({ ...p, ema50: !p.ema50 }))}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showIndicators.ema50 ? 'bg-[#4a6080]/20 border-[#4a6080]/50 text-[#9aadc0] font-semibold' : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            EMA 50
          </button>
          <button
            onClick={() => setShowIndicators(p => ({ ...p, bollinger: !p.bollinger }))}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showIndicators.bollinger ? 'bg-[#4a4a70]/20 border-[#4a4a70]/50 text-[#9a8fc0] font-semibold' : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            Bollinger Bands
          </button>
          <button
            onClick={() => setShowIndicators(p => ({ ...p, markers: !p.markers }))}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showIndicators.markers ? 'bg-[#4a6e4a]/20 border-[#4a6e4a]/50 text-[#8fae8b] font-semibold' : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            Trade Signals
          </button>
        </div>
      </div>

      {/* Crosshair Floating Live Value Bar (Matching Reference Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono mb-4 text-white/75 bg-white/5 p-3.5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-5 flex-wrap">
          <span>TIME: <strong className="text-white">{hoveredCandle.time}</strong></span>
          <span>CLOSE: <strong className="text-[#8fae8b] font-semibold">${hoveredCandle.close.toLocaleString()}</strong></span>
          <span>HIGH: <strong className="text-white/80">${hoveredCandle.high.toLocaleString()}</strong></span>
          <span>LOW: <strong className="text-white/80">${hoveredCandle.low.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          {hoveredCandle.rsi14 && <span>RSI 14: <strong className="text-[#c9b896]">{hoveredCandle.rsi14}</strong></span>}
          {hoveredCandle.sma20 && <span>SMA 20: <strong className="text-[#9aadc0]">${hoveredCandle.sma20.toLocaleString()}</strong></span>}
        </div>
      </div>

      {/* High-Resolution SVG Canvas Area */}
      <div 
        ref={containerRef}
        onMouseMove={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const ratio = (e.clientX - rect.left) / rect.width;
          const idx = Math.min(candles.length - 1, Math.max(0, Math.floor(ratio * candles.length)));
          setHoverIndex(idx);
        }}
        onMouseLeave={() => setHoverIndex(null)}
        className="relative w-full aspect-[22/10] min-h-[440px] bg-black/60 rounded-2xl p-3 overflow-hidden border border-white/10 cursor-crosshair select-none"
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradientAesthetic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e5c07b" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e5c07b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
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

          {/* Bollinger Bands */}
          {showIndicators.bollinger && bbUpperPoints && (
            <>
              <polyline points={bbUpperPoints} fill="none" stroke="rgba(253, 246, 226, 0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
              <polyline points={bbLowerPoints} fill="none" stroke="rgba(253, 246, 226, 0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
            </>
          )}

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#chartGradientAesthetic)" />

          {/* SMA 20 */}
          {showIndicators.sma20 && smaPoints && (
            <polyline points={smaPoints} fill="none" stroke="#d97706" strokeWidth="2" />
          )}

          {/* EMA 50 */}
          {showIndicators.ema50 && emaPoints && (
            <polyline points={emaPoints} fill="none" stroke="#93c5fd" strokeWidth="2" />
          )}

          {/* Main Price Line in Warm Gold */}
          <polyline points={pricePoints} fill="none" stroke="#e5c07b" strokeWidth="3" />

          {/* Trade Execution Markers (Triangles from original repo upgraded) */}
          {showIndicators.markers && trades.map((trade, idx) => {
            const candleIndex = candles.findIndex(c => c.time.startsWith(trade.time.substring(0, 13)));
            if (candleIndex === -1) return null;
            const x = getX(candleIndex);
            const y = getY(trade.price);
            const isBuyTrade = trade.type === 'BUY';

            return (
              <g key={idx} className="cursor-pointer">
                {isBuyTrade ? (
                  <polygon
                    points={`${x},${y - 16} ${x - 8},${y} ${x + 8},${y}`}
                    fill="#8fae8b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="drop-shadow-[0_0_6px_rgba(143,174,139,0.4)]"
                  />
                ) : (
                  <polygon
                    points={`${x},${y + 16} ${x - 8},${y} ${x + 8},${y}`}
                    fill="#c4868a"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="drop-shadow-[0_0_6px_rgba(196,134,138,0.4)]"
                  />
                )}
              </g>
            );
          })}

          {/* Hover Crosshair vertical line */}
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
                r="6"
                fill="#ffffff"
                stroke="#d4af37"
                strokeWidth="2.5"
              />
            </>
          )}
        </svg>
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-white/50 pt-5 mt-2">
        <div className="flex items-center gap-5 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#e5c07b]" /> BTC Price</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#d97706]" /> SMA 20</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#93c5fd]" /> EMA 50</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-white/50" /> Bollinger Bands (20, 2σ)</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1 text-[#8fae8b]">▲ Buy Signal</span>
          <span className="flex items-center gap-1 text-[#c4868a]">▼ Sell Signal</span>
        </div>
      </div>
    </div>
  );
};
