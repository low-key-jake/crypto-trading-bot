import numpy as np
import pandas as pd

def calculate_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes a rich suite of quantitative technical indicators on OHLCV data.
    """
    df = df.copy()

    # Simple Moving Averages
    df["SMA20"] = df["Close"].rolling(window=20).mean()
    df["SMA50"] = df["Close"].rolling(window=50).mean()

    # Exponential Moving Averages
    df["EMA9"] = df["Close"].ewm(span=9, adjust=False).mean()
    df["EMA21"] = df["Close"].ewm(span=21, adjust=False).mean()
    df["EMA50"] = df["Close"].ewm(span=50, adjust=False).mean()
    df["EMA200"] = df["Close"].ewm(span=200, adjust=False).mean()

    # Relative Strength Index (Wilder's Smoothing)
    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-10)
    df["RSI14"] = 100 - (100 / (1 + rs))

    # MACD (12, 26, 9)
    ema12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema26 = df["Close"].ewm(span=26, adjust=False).mean()
    df["MACD"] = ema12 - ema26
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()
    df["MACD_Hist"] = df["MACD"] - df["MACD_Signal"]

    # Bollinger Bands (20, 2 std)
    bb_mean = df["Close"].rolling(window=20).mean()
    bb_std = df["Close"].rolling(window=20).std()
    df["BB_Upper"] = bb_mean + (bb_std * 2.0)
    df["BB_Lower"] = bb_mean - (bb_std * 2.0)
    df["BB_Middle"] = bb_mean
    df["BB_Width"] = (df["BB_Upper"] - df["BB_Lower"]) / (bb_mean + 1e-10)
    df["BB_PctB"] = (df["Close"] - df["BB_Lower"]) / ((df["BB_Upper"] - df["BB_Lower"]) + 1e-10)

    # ATR (14) - Average True Range
    high_low = df["High"] - df["Low"]
    high_close_prev = (df["High"] - df["Close"].shift(1)).abs()
    low_close_prev = (df["Low"] - df["Close"].shift(1)).abs()
    tr = pd.concat([high_low, high_close_prev, low_close_prev], axis=1).max(axis=1)
    df["ATR14"] = tr.rolling(window=14).mean()

    # Stochastic Oscillator (%K 14, %D 3)
    low14 = df["Low"].rolling(window=14).min()
    high14 = df["High"].rolling(window=14).max()
    df["Stoch_K"] = 100 * ((df["Close"] - low14) / ((high14 - low14) + 1e-10))
    df["Stoch_D"] = df["Stoch_K"].rolling(window=3).mean()

    # Volume Indicators
    df["Vol_SMA20"] = df["Volume"].rolling(window=20).mean()
    df["Vol_Ratio"] = df["Volume"] / (df["Vol_SMA20"] + 1e-10)
    
    # On-Balance Volume (OBV)
    obv = [0]
    for i in range(1, len(df)):
        if df["Close"].iloc[i] > df["Close"].iloc[i - 1]:
            obv.append(obv[-1] + df["Volume"].iloc[i])
        elif df["Close"].iloc[i] < df["Close"].iloc[i - 1]:
            obv.append(obv[-1] - df["Volume"].iloc[i])
        else:
            obv.append(obv[-1])
    df["OBV"] = obv

    return df
