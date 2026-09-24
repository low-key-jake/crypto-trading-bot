export interface AnalysisResponse {
  symbol: string;
  current_price: number;
  verdict: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';
  verdict_color: string;
  confidence: number;
  consensus_score: number;
  action_summary: string;
  recommendation: string;
  risk_level: string;
  trade_levels: {
    entry_price: number;
    stop_loss: number;
    take_profit_1: number;
    take_profit_2: number;
    risk_reward_ratio: string;
  };
  ml: {
    signal: string;
    confidence: number;
    probabilities: {
      buy: number;
      hold: number;
      sell: number;
    };
    metrics: {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      cv_folds: number;
      samples_trained: number;
    };
    feature_importances: Record<string, number>;
  };
  quantitative: {
    score: number;
    signal: string;
    confidence: number;
    factors: {
      trend: number;
      momentum: number;
      volatility: number;
      volume: number;
    };
    reasons: string[];
  };
  indicators: {
    rsi: number;
    sma20: number;
    ema50: number;
    ema200: number;
    macd: number;
    macd_signal: number;
    bb_upper: number;
    bb_lower: number;
    atr14: number;
  };
  ticker?: {
    lastPrice: number;
    priceChange: number;
    priceChangePercent: number;
    highPrice: number;
    lowPrice: number;
    volume: number;
    weightedAvgPrice?: number;
  };
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
  overview?: MarketOverview;
}

export interface MarketOverview {
  symbol: string;
  name: string;
  current_price: number;
  market_cap: string;
  fully_diluted_valuation: string;
  volume_24h: string;
  open_price: number;
  days_range_low: number;
  days_range_high: number;
  week_52_low: number;
  week_52_high: number;
  all_time_high: number;
  all_time_low: number;
  circulating_supply: string;
  max_supply: string;
  volume_market_cap_ratio: string;
  previous_close: number;
  start_date: string;
}

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impact: string;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  buy_volume?: number;
  sma20: number | null;
  ema50: number | null;
  ema200: number | null;
  bb_upper: number | null;
  bb_lower: number | null;
  rsi14: number | null;
  macd: number | null;
  macd_signal: number | null;
}

export interface MarketResponse {
  symbol: string;
  interval: string;
  candles: Candle[];
}

export interface BacktestTrade {
  type: 'BUY' | 'SELL';
  price: number;
  time: string;
  portfolio_value: number;
  pnl?: number;
  pnl_pct?: number;
}

export interface StrategyResult {
  strategy: string;
  starting_balance: number;
  final_balance: number;
  profit_loss: number;
  return_percentage: number;
  buy_and_hold_return: number;
  total_trades: number;
  completed_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  trades: BacktestTrade[];
  equity_curve: { time: string; equity: number; price: number }[];
}

export interface BacktestResponse {
  baseline: StrategyResult;
  upgraded: StrategyResult;
  ml: StrategyResult;
  consensus: StrategyResult;
  comparison: {
    name: string;
    return_pct: number;
    win_rate: number;
    trades: number;
    profit_factor: number;
    max_drawdown: number;
    final_balance: number;
  }[];
}

const API_BASE = '/api';

export async function getAnalysis(symbol: string = 'BTCUSDT', interval: string = '1h'): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analysis?symbol=${symbol}&interval=${interval}&limit=1000`);
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

export async function getMarket(symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 200): Promise<MarketResponse> {
  const res = await fetch(`${API_BASE}/market?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!res.ok) throw new Error(`Market fetch failed: ${res.statusText}`);
  return res.json();
}

export async function getBacktest(symbol: string = 'BTCUSDT', interval: string = '1h', capital: number = 10000): Promise<BacktestResponse> {
  const res = await fetch(`${API_BASE}/backtest?symbol=${symbol}&interval=${interval}&capital=${capital}`);
  if (!res.ok) throw new Error(`Backtest failed: ${res.statusText}`);
  return res.json();
}

export async function getNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE}/news`);
  if (!res.ok) throw new Error(`News failed: ${res.statusText}`);
  const data = await res.json();
  return data.articles || [];
}

export async function getOverview(symbol: string = 'BTCUSDT'): Promise<MarketOverview> {
  const res = await fetch(`${API_BASE}/overview?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Overview failed: ${res.statusText}`);
  return res.json();
}

export async function retrainModel(symbol: string = 'BTCUSDT') {
  const res = await fetch(`${API_BASE}/retrain?symbol=${symbol}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Retraining failed: ${res.statusText}`);
  return res.json();
}
