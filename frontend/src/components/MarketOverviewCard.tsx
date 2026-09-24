import React from 'react';
import type { MarketOverview } from '../services/api';
import { Bitcoin, Info, Activity, Database, Zap } from 'lucide-react';

interface MarketOverviewCardProps {
  overview?: MarketOverview;
  mempool?: {
    recommended_fees: {
      fastestFee: number;
      halfHourFee: number;
      hourFee: number;
      minimumFee: number;
    };
    mempool_tx_count: number;
    hashrate_ehs: number;
    block_height: number;
  };
  priceChangePercent?: number;
}

export const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({
  overview,
  mempool,
  priceChangePercent = -2.2
}) => {
  if (!overview) return null;

  const isPositive = priceChangePercent >= 0;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-[36px] border border-white/10 mb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#8a7040]/20 border border-[#8a7040]/40 flex items-center justify-center text-[#c9b896]">
            <Bitcoin className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
              <span>Cryptocurrency</span>
              <span>•</span>
              <span>USD</span>
              <span>•</span>
              <span className="text-[#c9b896]">#1 by Market Cap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Bitcoin USD Price (BTC-USD)</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
          <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
            ${overview.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-mono font-semibold flex items-center gap-1.5 ${isPositive ? 'text-[#8fae8b]' : 'text-[#b87175]'}`}>
            <span>{isPositive ? '+' : ''}{(overview.current_price * (priceChangePercent / 100)).toFixed(2)}</span>
            <span>({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Market Statistics (Matching Screenshot 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-2">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-mono text-white/40 mb-1">
            <span>Market Cap</span>
            <Info className="w-3 h-3" />
          </div>
          <div className="text-sm font-mono font-bold text-white">{overview.market_cap}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-mono text-white/40 mb-1">
            <span>24h Volume</span>
            <Info className="w-3 h-3" />
          </div>
          <div className="text-sm font-mono font-bold text-white">{overview.volume_24h}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[11px] font-mono text-white/40 mb-1">Day's Range</div>
          <div className="text-xs font-mono font-semibold text-white/90">
            ${overview.days_range_low.toLocaleString()} - ${overview.days_range_high.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[11px] font-mono text-white/40 mb-1">52 Week Range</div>
          <div className="text-xs font-mono font-semibold text-white/90">
            ${overview.week_52_low.toLocaleString()} - ${overview.week_52_high.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[11px] font-mono text-white/40 mb-1">All-Time High</div>
          <div className="text-sm font-mono font-bold text-[#c9b896]">
            ${overview.all_time_high.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[11px] font-mono text-white/40 mb-1">Circulating Supply</div>
          <div className="text-sm font-mono font-bold text-white/90">
            {overview.circulating_supply}
          </div>
        </div>
      </div>

      {/* On-Chain Mempool Telemetry Row */}
      {mempool && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-white/60 gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#c9b896]" />
            <span>Mempool Fee: <strong className="text-white">{mempool.recommended_fees.fastestFee} sat/vB</strong> (Priority)</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#9aadc0]" />
            <span>Unconfirmed Transactions: <strong className="text-white">{mempool.mempool_tx_count.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#8fae8b]" />
            <span>Hashrate: <strong className="text-white">{mempool.hashrate_ehs} EH/s</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
