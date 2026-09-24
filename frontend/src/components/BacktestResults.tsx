import React from 'react';
import type { BacktestResponse } from '../services/api';
import { ArrowUpRight, ArrowDownRight, History, CheckCircle } from 'lucide-react';

interface BacktestResultsProps {
  data: BacktestResponse | null;
  loading: boolean;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div id="backtest" className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="glass-panel p-12 rounded-[36px] flex flex-col items-center justify-center text-white/50 font-mono min-h-[300px]">
          <div className="w-10 h-10 rounded-full border-2 border-[#c9b896] border-t-transparent animate-spin mb-4" />
          <span>Simulating Consensus Strategy Over 1,000 Historical Candles (0.1% fee + slippage)...</span>
        </div>
      </div>
    );
  }

  const consensus = data.consensus;
  const isPositive = consensus.return_percentage >= 0;

  return (
    <section id="backtest" className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#c9b896]/80 font-mono">BACKTEST PROVING GROUND</span>
          <h2 className="text-4xl sm:text-6xl font-normal text-white mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Satosphere Consensus <span className="italic text-white/50">Performance Matrix</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/60">Benchmark Buy & Hold:</span>
          <span className={`text-xs font-mono font-bold ${consensus.buy_and_hold_return >= 0 ? 'text-[#8fae8b]' : 'text-[#b87175]'}`}>
            {consensus.buy_and_hold_return > 0 ? `+${consensus.buy_and_hold_return}%` : `${consensus.buy_and_hold_return}%`}
          </span>
        </div>
      </div>

      {/* Main Unified Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-[24px] border border-white/10">
          <span className="text-xs font-mono text-white/50 block mb-1">Final Portfolio</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            ${consensus.final_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-mono text-white/40">From ${consensus.starting_balance.toLocaleString()}</span>
        </div>

        <div className="glass-panel p-5 rounded-[24px] border border-white/10">
          <span className="text-xs font-mono text-white/50 block mb-1">Total Return</span>
          <div className={`text-xl sm:text-2xl font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-[#8fae8b]' : 'text-[#b87175]'}`}>
            {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {isPositive ? `+${consensus.return_percentage}%` : `${consensus.return_percentage}%`}
          </div>
          <span className="text-[10px] font-mono text-white/40">Net of 0.10% fees</span>
        </div>

        <div className="glass-panel p-5 rounded-[24px] border border-white/10">
          <span className="text-xs font-mono text-white/50 block mb-1">Win Rate</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#c9b896]">
            {consensus.win_rate}%
          </div>
          <span className="text-[10px] font-mono text-white/40">{consensus.winning_trades} wins / {consensus.completed_trades} trades</span>
        </div>

        <div className="glass-panel p-5 rounded-[24px] border border-white/10">
          <span className="text-xs font-mono text-white/50 block mb-1">Profit Factor</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#9aadc0]">
            {consensus.profit_factor}
          </div>
          <span className="text-[10px] font-mono text-white/40">Gross Gains / Losses</span>
        </div>

        <div className="glass-panel p-5 rounded-[24px] border border-white/10">
          <span className="text-xs font-mono text-white/50 block mb-1">Max Drawdown</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#c4868a]">
            -{consensus.max_drawdown}%
          </div>
          <span className="text-[10px] font-mono text-white/40">Peak-to-trough risk</span>
        </div>

        <div className="glass-panel p-5 rounded-[24px] border border-white/10">
          <span className="text-xs font-mono text-white/50 block mb-1">Total Orders</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {consensus.total_trades}
          </div>
          <span className="text-[10px] font-mono text-white/40">Executed on signals</span>
        </div>
      </div>

      {/* Trade Execution Ledger */}
      <div className="glass-panel p-6 sm:p-8 rounded-[36px] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-white/10 gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#c9b896]" />
            <h3 className="text-lg font-bold font-mono tracking-tight text-white uppercase text-sm">
              Consensus Trade Ledger (1,000 Candles Deep Backtest)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8fae8b]">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Multi-Dataset Model Active</span>
          </div>
        </div>

        {/* Trades Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase">
                <th className="pb-3">Action</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Fill Price</th>
                <th className="pb-3">PnL (%)</th>
                <th className="pb-3 text-right">Portfolio Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {consensus.trades.slice(-8).reverse().map((trade, i) => {
                const isBuy = trade.type === 'BUY';
                return (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        isBuy ? 'bg-[#4a6e4a]/20 text-[#8fae8b]' : 'bg-[#5a2a2e]/20 text-[#c4868a]'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 text-white/70">{trade.time}</td>
                    <td className="py-3 text-white font-medium">${trade.price.toLocaleString()}</td>
                    <td className="py-3">
                      {trade.pnl_pct !== undefined ? (
                        <span className={`flex items-center gap-1 font-semibold ${
                          trade.pnl_pct >= 0 ? 'text-[#8fae8b]' : 'text-[#b87175]'
                        }`}>
                          {trade.pnl_pct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {trade.pnl_pct >= 0 ? `+${trade.pnl_pct}%` : `${trade.pnl_pct}%`}
                        </span>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-white font-semibold">
                      ${trade.portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
