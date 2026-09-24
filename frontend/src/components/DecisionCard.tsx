import React from 'react';
import type { AnalysisResponse } from '../services/api';
import { TrendingUp, TrendingDown, AlertCircle, ShieldAlert, Crosshair, Target } from 'lucide-react';

interface DecisionCardProps {
  data: AnalysisResponse | null;
  loading: boolean;
  onRefresh: () => void;
  id?: string;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ data, loading, onRefresh, id = "decision" }) => {
  if (loading || !data) {
    return (
      <div id={id} className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="glass-panel p-12 rounded-[40px] flex flex-col items-center justify-center gap-4 text-center min-h-[350px]">
          <div className="w-10 h-10 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
          <p className="text-white/60 text-base font-mono">Synthesizing Machine Learning Weights & Quantitative Market Data...</p>
        </div>
      </div>
    );
  }

  const isBuy = data.verdict.includes('BUY');
  const isSell = data.verdict.includes('SELL');

  return (
    <section id={id} className="w-full max-w-7xl mx-auto px-6 py-12 transition-all duration-500">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#d8ccb0]/80 font-mono">PRIMARY DECISION ENGINE</span>
          <h2 className="text-4xl sm:text-6xl font-normal text-white mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
            The Main Output: <span className="italic text-[#e8dcc8]/60">Should You Buy?</span>
          </h2>
        </div>
        <button
          onClick={onRefresh}
          data-cursor="Re-Analyze"
          className="liquid-glass px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-white hover:scale-105 active:scale-95 transition-transform w-fit cursor-pointer"
        >
          ↻ Refresh Real-time Feed
        </button>
      </div>

      {/* Decision Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Verdict Hero Card */}
        <div className={`lg:col-span-7 glass-panel p-8 sm:p-10 rounded-[36px] flex flex-col justify-between relative overflow-hidden border ${
          isBuy ? 'border-[#4a6e4a]/30' : isSell ? 'border-[#7a3a3d]/30' : 'border-[#8a7040]/30'
        }`}>
          {/* Subtle Ambient Glow */}
          <div 
            className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20 ${
              isBuy ? 'bg-[#4a6e4a]' : isSell ? 'bg-[#7a3a3d]' : 'bg-[#8a7040]'
            }`}
          />

          <div>
            {/* Top telemetry pill bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono border border-white/10">
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                <span className="text-white font-semibold">Bitcoin (BTCUSDT)</span>
                <span className="text-white/40">|</span>
                <span className="text-white/90">${data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-white/40">Risk Assessment:</span>
                <span className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  data.risk_level === 'Low' ? 'bg-[#1a2e1a]/60 text-[#b5c9b2] border border-[#3a5a3a]/40' : 'bg-amber-950/60 text-[#d8ccb0] border border-amber-800/40'
                }`}>
                  {data.risk_level}
                </span>
              </div>
            </div>

            {/* Verdict Display */}
            <div className="flex items-center gap-5 flex-wrap mb-6">
              <div 
                id="master-verdict-badge"
                className={`px-8 py-3.5 rounded-2xl text-3xl sm:text-5xl font-mono font-bold tracking-tight text-white flex items-center gap-4 shadow-xl transition-all duration-300 ${
                  isBuy 
                    ? 'bg-[#1a2e1a]/90 border border-[#4a6e4a]/50 text-[#d4e0d2]' 
                    : isSell 
                    ? 'bg-[#2e1417]/90 border border-[#7a3a3d]/50 text-[#e8cfd0]' 
                    : 'bg-[#2a2218]/90 border border-[#8a7040]/50 text-[#e8dcc8]'
                }`}
              >
                {isBuy && <TrendingUp className="w-9 h-9 text-[#8fae8b]" />}
                {isSell && <TrendingDown className="w-9 h-9 text-[#c4868a]" />}
                {!isBuy && !isSell && <AlertCircle className="w-9 h-9 text-[#c9b896]" />}
                <span>{data.verdict}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-white/50 font-mono">CONSENSUS SCORE</span>
                <span className={`text-2xl font-mono font-bold ${data.consensus_score >= 0 ? 'text-[#8fae8b]' : 'text-[#c4868a]'}`}>
                  {data.consensus_score > 0 ? `+${data.consensus_score}` : data.consensus_score} / 100
                </span>
              </div>
            </div>

            {/* Clear Actionable Recommendation */}
            <p className="text-lg sm:text-xl text-white font-medium leading-relaxed mb-3">
              {data.recommendation}
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              {data.action_summary}
            </p>
          </div>

          {/* Model Confidence Meter Bar */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-white/60">Cross-Validated Predictive Confidence</span>
              <span className="text-[#d8ccb0] font-bold text-sm">{data.confidence}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isBuy 
                    ? 'bg-gradient-to-r from-[#4a6e4a] to-[#6a9a78]' 
                    : isSell 
                    ? 'bg-gradient-to-r from-[#7a3a3d] to-[#8a7040]' 
                    : 'bg-gradient-to-r from-[#5a6070] to-[#a89068]'
                }`}
                style={{ width: `${data.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Dynamic Trade Targets Card */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-[36px] flex flex-col justify-between border border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Crosshair className="w-4 h-4 text-[#c9b896]" />
              <h3 className="text-xl font-bold font-mono tracking-tight text-white uppercase text-sm">
                DYNAMIC ATR TRADE LEVELS
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-white/60 font-mono">Suggested Entry</span>
                <span className="text-base font-mono font-semibold text-white">
                  ${data.trade_levels.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#2e1417]/30 border border-[#5a2a2e]/30">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#b87175]" />
                  <span className="text-xs text-[#d9acae] font-mono">Protective Stop-Loss (1.5x ATR)</span>
                </div>
                <span className="text-base font-mono font-semibold text-[#d9acae]">
                  ${data.trade_levels.stop_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1a2e1a]/30 border border-[#3a5a3a]/30">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#8fae8b]" />
                  <span className="text-xs text-[#b5c9b2] font-mono">Target Profit 1 (1.5R)</span>
                </div>
                <span className="text-base font-mono font-semibold text-[#b5c9b2]">
                  ${data.trade_levels.take_profit_1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1a2e1a]/30 border border-[#3a5a3a]/30">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#8fae8b]" />
                  <span className="text-xs text-[#b5c9b2] font-mono">Target Profit 2 (2.5R Runner)</span>
                </div>
                <span className="text-base font-mono font-semibold text-[#b5c9b2]">
                  ${data.trade_levels.take_profit_2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
            <span>Risk / Reward: <strong className="text-white">1 : 2.0</strong></span>
            <span>Horizon: <strong className="text-white">6-24 Hours</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
