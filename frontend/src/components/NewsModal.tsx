import React from 'react';
import type { NewsArticle } from '../services/api';
import { X, ExternalLink, Newspaper, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  loading: boolean;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, articles, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-rise">
      <div className="relative w-full max-w-4xl max-h-[88vh] glass-panel rounded-[36px] p-6 sm:p-8 flex flex-col border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Satosphere Bitcoin Intelligence & News
              </h3>
              <p className="text-xs font-mono text-white/50">
                Curated real-time feeds from CoinDesk, Mempool, and Institutional Dispatches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto space-y-4 py-6 pr-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/50 font-mono text-xs gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <span>Fetching live CoinDesk feeds...</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-white/50 text-sm font-mono">
              No recent dispatches loaded.
            </div>
          ) : (
            articles.map((item, idx) => {
              const isBull = item.sentiment === 'Bullish';
              const isBear = item.sentiment === 'Bearish';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                        {item.source}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 font-semibold ${
                          isBull
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isBear
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {isBull && <TrendingUp className="w-3 h-3" />}
                        {isBear && <TrendingDown className="w-3 h-3" />}
                        {item.sentiment}
                      </span>
                      <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.pubDate}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-medium text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-white/60 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-end sm:self-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black text-white text-xs font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Price Impact Evaluated by Satosphere ML</span>
          </div>
          <span>Updated continuously</span>
        </div>
      </div>
    </div>
  );
};
