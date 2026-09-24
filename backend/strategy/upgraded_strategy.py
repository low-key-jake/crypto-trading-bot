import pandas as pd
import numpy as np

def evaluate_upgraded_strategy(df: pd.DataFrame) -> dict:
    """
    Multi-Factor Quantitative Trading Strategy.
    Evaluates Trend, Momentum, Volatility, and Volume indicators.
    Returns composite score (-100 to +100), signal, factor breakdowns, and reasoning.
    """
    if len(df) < 50:
        return {
            "score": 0,
            "signal": "HOLD",
            "confidence": 50.0,
            "factors": {"trend": 0, "momentum": 0, "volatility": 0, "volume": 0},
            "reasons": ["Insufficient data points for full multi-factor evaluation."]
        }

    latest = df.iloc[-1]
    prev = df.iloc[-2]
    prev2 = df.iloc[-3]

    price = latest["Close"]
    reasons = []

    # ----------------------------------------------------
    # 1. TREND FACTOR (-35 to +35)
    # ----------------------------------------------------
    trend_score = 0
    ema9 = latest.get("EMA9", price)
    ema21 = latest.get("EMA21", price)
    ema50 = latest.get("EMA50", price)
    ema200 = latest.get("EMA200", price)

    # Long-term trend against 200 EMA
    if price > ema200:
        trend_score += 15
        reasons.append(f"Price (${price:,.0f}) is trading above the 200 EMA (${ema200:,.0f}) — Macro Bullish Regime.")
    else:
        trend_score -= 15
        reasons.append(f"Price (${price:,.0f}) is below the 200 EMA (${ema200:,.0f}) — Macro Bearish Pressure.")

    # Medium-term trend: EMA 50 vs EMA 200
    if ema50 > ema200:
        trend_score += 10
    else:
        trend_score -= 10

    # Short-term trend: EMA 9 vs EMA 21
    if ema9 > ema21:
        trend_score += 10
        if prev["EMA9"] <= prev["EMA21"]:
            reasons.append("Recent Bullish Golden Crossover: EMA 9 crossed above EMA 21.")
    else:
        trend_score -= 10
        if prev["EMA9"] >= prev["EMA21"]:
            reasons.append("Recent Bearish Death Crossover: EMA 9 crossed below EMA 21.")

    # ----------------------------------------------------
    # 2. MOMENTUM FACTOR (-30 to +30)
    # ----------------------------------------------------
    momentum_score = 0
    rsi = latest.get("RSI14", 50)
    prev_rsi = prev.get("RSI14", 50)

    # RSI Analysis
    if rsi < 30:
        momentum_score += 12
        reasons.append(f"RSI ({rsi:.1f}) is heavily oversold — High probability bounce zone.")
    elif rsi < 42 and rsi > prev_rsi:
        momentum_score += 8
        reasons.append(f"RSI ({rsi:.1f}) rebounding upward from lower zone.")
    elif rsi > 70:
        momentum_score -= 12
        reasons.append(f"RSI ({rsi:.1f}) is overbought — Elevated risk of pullbacks.")
    elif rsi > 58 and rsi < prev_rsi:
        momentum_score -= 8
        reasons.append(f"RSI ({rsi:.1f}) declining from upper threshold.")
    else:
        momentum_score += 2 if rsi >= 50 else -2

    # MACD Analysis
    macd = latest.get("MACD", 0)
    macd_signal = latest.get("MACD_Signal", 0)
    macd_hist = latest.get("MACD_Hist", 0)
    prev_hist = prev.get("MACD_Hist", 0)

    if macd > macd_signal:
        momentum_score += 9
        if macd_hist > prev_hist:
            momentum_score += 4
            reasons.append("MACD histogram expanding green with accelerating bullish momentum.")
    else:
        momentum_score -= 9
        if macd_hist < prev_hist:
            momentum_score -= 4
            reasons.append("MACD histogram contracting red with accelerating bearish momentum.")

    # Stochastic Oscillator
    stoch_k = latest.get("Stoch_K", 50)
    stoch_d = latest.get("Stoch_D", 50)
    if stoch_k > stoch_d and stoch_k < 40:
        momentum_score += 5
        reasons.append(f"Stochastic Oscillator (%K {stoch_k:.0f}) crossed above %D in the oversold valley.")
    elif stoch_k < stoch_d and stoch_k > 60:
        momentum_score -= 5
        reasons.append(f"Stochastic Oscillator (%K {stoch_k:.0f}) crossed below %D in the peak zone.")

    # ----------------------------------------------------
    # 3. VOLATILITY & MEAN REVERSION (-20 to +20)
    # ----------------------------------------------------
    volatility_score = 0
    pct_b = latest.get("BB_PctB", 0.5)
    bb_width = latest.get("BB_Width", 0.05)

    if pct_b < 0.10:
        volatility_score += 15
        reasons.append("Price touching lower Bollinger Band (%B < 0.10) — Favorable mean-reversion setup.")
    elif pct_b > 0.90:
        volatility_score -= 15
        reasons.append("Price extended beyond upper Bollinger Band (%B > 0.90) — Overextended excursion.")
    elif pct_b > 0.5:
        volatility_score += 5
    else:
        volatility_score -= 5

    # ----------------------------------------------------
    # 4. VOLUME CONFIRMATION (-15 to +15)
    # ----------------------------------------------------
    volume_score = 0
    vol_ratio = latest.get("Vol_Ratio", 1.0)
    candle_return = (latest["Close"] - latest["Open"]) / (latest["Open"] + 1e-10)

    if vol_ratio > 1.3:
        if candle_return > 0:
            volume_score += 15
            reasons.append(f"High Volume Surge ({vol_ratio:.1f}x of 20-MA) confirming aggressive buyers.")
        else:
            volume_score -= 15
            reasons.append(f"High Volume Sell Pressure ({vol_ratio:.1f}x of 20-MA) on downward candle.")
    else:
        volume_score += 3 if candle_return > 0 else -3

    # Total Score (-100 to +100)
    total_score = int(np.clip(trend_score + momentum_score + volatility_score + volume_score, -100, 100))

    # Signal mapping
    if total_score >= 50:
        signal = "STRONG BUY"
    elif total_score >= 20:
        signal = "BUY"
    elif total_score <= -50:
        signal = "STRONG SELL"
    elif total_score <= -20:
        signal = "SELL"
    else:
        signal = "HOLD"

    confidence = round(min(98.0, max(52.0, abs(total_score) * 0.45 + 50.0)), 1)

    return {
        "score": total_score,
        "signal": signal,
        "confidence": confidence,
        "factors": {
            "trend": trend_score,
            "momentum": momentum_score,
            "volatility": volatility_score,
            "volume": volume_score
        },
        "reasons": reasons[:5]
    }
