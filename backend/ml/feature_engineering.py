import numpy as np
import pandas as pd
from indicators.indicators import calculate_all_indicators

FEATURE_COLUMNS = [
    "ret_1", "ret_3", "ret_6", "ret_12", "ret_24",
    "rsi_norm", "macd_norm", "macd_hist_norm",
    "bb_pct_b", "bb_width",
    "ema_spread_fast", "ema_spread_slow", "dist_ema21", "dist_ema50", "dist_ema200",
    "atr_norm", "stoch_k", "stoch_d", "vol_ratio", "hl_spread_norm"
]

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Constructs stationarized statistical & technical feature matrix for machine learning.
    """
    df = df.copy()

    # Ensure indicators exist
    if "RSI14" not in df.columns:
        df = calculate_all_indicators(df)

    close = df["Close"]
    atr = df["ATR14"].replace(0, np.nan).bfill()

    # Return series
    df["ret_1"] = close.pct_change(1)
    df["ret_3"] = close.pct_change(3)
    df["ret_6"] = close.pct_change(6)
    df["ret_12"] = close.pct_change(12)
    df["ret_24"] = close.pct_change(24)

    # Normalized momentum features
    df["rsi_norm"] = (df["RSI14"] - 50.0) / 50.0
    df["macd_norm"] = df["MACD"] / (close + 1e-10)
    df["macd_hist_norm"] = df["MACD_Hist"] / (close + 1e-10)

    # Bollinger Bands
    df["bb_pct_b"] = df["BB_PctB"]
    df["bb_width"] = df["BB_Width"]

    # Moving Average Spreads
    df["ema_spread_fast"] = (df["EMA9"] - df["EMA21"]) / (close + 1e-10)
    df["ema_spread_slow"] = (df["EMA50"] - df["EMA200"]) / (close + 1e-10)
    df["dist_ema21"] = (close - df["EMA21"]) / (atr + 1e-10)
    df["dist_ema50"] = (close - df["EMA50"]) / (atr + 1e-10)
    df["dist_ema200"] = (close - df["EMA200"]) / (atr + 1e-10)

    # Volatility & Oscillators
    df["atr_norm"] = atr / (close + 1e-10)
    df["stoch_k"] = (df["Stoch_K"] - 50.0) / 50.0
    df["stoch_d"] = (df["Stoch_D"] - 50.0) / 50.0

    # Volume & Range
    df["vol_ratio"] = df["Vol_Ratio"]
    df["hl_spread_norm"] = (df["High"] - df["Low"]) / (atr + 1e-10)

    return df

def prepare_dataset(df: pd.DataFrame, horizon: int = 6, threshold: float = 0.0075):
    """
    Prepares X (features) and y (target labels) for training.
    Target:
      1: BUY (forward return > +threshold)
      0: HOLD (forward return within [-threshold, +threshold])
      2: SELL (forward return < -threshold)
    """
    df_feat = build_features(df)

    # Compute forward returns over horizon
    forward_ret = df_feat["Close"].shift(-horizon) / df_feat["Close"] - 1.0

    # Target assignment: 0: HOLD, 1: BUY, 2: SELL
    target = pd.Series(0, index=df_feat.index)
    target[forward_ret > threshold] = 1
    target[forward_ret < -threshold] = 2

    # Drop warm-up periods and trailing unobserved labels
    valid_idx = ~(df_feat[FEATURE_COLUMNS].isna().any(axis=1) | forward_ret.isna())
    
    X = df_feat.loc[valid_idx, FEATURE_COLUMNS]
    y = target.loc[valid_idx]
    
    return X, y, df_feat
