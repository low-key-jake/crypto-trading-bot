import numpy as np
import pandas as pd
from strategy.upgraded_strategy import evaluate_upgraded_strategy
from strategy.naive_strategy import generate_naive_signal
from ml.model import predictor
from indicators.indicators import calculate_all_indicators

def get_master_consensus(df: pd.DataFrame, symbol: str = "BTCUSDT") -> dict:
    """
    Synthesizes the Upgraded Multi-Factor Quantitative Strategy with the
    Supervised Machine Learning Model to produce the definitive decision:
    'Should the user buy or not?'
    """
    if "RSI14" not in df.columns:
        df = calculate_all_indicators(df)

    latest = df.iloc[-1]
    current_price = float(latest["Close"])
    atr = float(latest.get("ATR14", current_price * 0.02))
    if np.isnan(atr) or atr <= 0:
        atr = current_price * 0.02

    # 1. Baseline Strategy (for benchmark)
    baseline_signal = generate_naive_signal(df)

    # 2. Upgraded Quantitative Strategy
    quant_result = evaluate_upgraded_strategy(df)
    quant_score = quant_result["score"]  # -100 to +100

    # 3. Machine Learning Prediction
    ml_result = predictor.predict(df)
    probs = ml_result["probabilities"]
    # ML directional bias (-100 to +100)
    ml_score = (probs["buy"] - probs["sell"])

    # 4. Consensus Weighted Synthesis
    # 45% Quant Multi-factor + 55% Machine Learning
    consensus_score = int(round(0.45 * quant_score + 0.55 * ml_score))
    consensus_score = int(np.clip(consensus_score, -100, 100))

    # Determine Master Verdict
    if consensus_score >= 50:
        verdict = "STRONG BUY"
        action_summary = "High-conviction bullish alignment across quantitative trend factors and machine learning probability."
        recommendation = "Optimal accumulation opportunity. Enter long position or DCA with protective stop-loss."
        verdict_color = "emerald"
    elif consensus_score >= 20:
        verdict = "BUY"
        action_summary = "Favorable risk-reward profile backed by momentum and statistical edge."
        recommendation = "Consider opening or increasing Bitcoin spot allocation."
        verdict_color = "teal"
    elif consensus_score <= -50:
        verdict = "STRONG SELL"
        action_summary = "Strong bearish conviction across indicators and ML forecasting downward trajectory."
        recommendation = "De-risk immediately, tighten stops, or consider taking partial profits to stablecoins."
        verdict_color = "rose"
    elif consensus_score <= -20:
        verdict = "SELL"
        action_summary = "Technical breakdown and negative forward return probability."
        recommendation = "Exercise caution. Reduce exposure or wait for lower support retest."
        verdict_color = "amber"
    else:
        verdict = "HOLD"
        action_summary = "Conflicting signals or consolidation channel. Wait for clear directional breakout."
        recommendation = "Remain patient on the sidelines. Avoid opening high-leverage positions."
        verdict_color = "slate"

    # Consensus Confidence
    confidence = round(min(98.5, max(52.0, abs(consensus_score) * 0.46 + 50.0)), 1)

    # Risk Management Calculation (ATR Based)
    stop_loss = round(current_price - (1.5 * atr) if "BUY" in verdict else current_price + (1.5 * atr), 2)
    risk_distance = abs(current_price - stop_loss)
    take_profit_1 = round(current_price + (1.5 * risk_distance) if "BUY" in verdict else current_price - (1.5 * risk_distance), 2)
    take_profit_2 = round(current_price + (2.5 * risk_distance) if "BUY" in verdict else current_price - (2.5 * risk_distance), 2)

    risk_level = "Low" if abs(consensus_score) > 60 else "Moderate" if abs(consensus_score) > 30 else "High (Uncertainty)"

    return {
        "symbol": symbol,
        "current_price": current_price,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "confidence": confidence,
        "consensus_score": consensus_score,
        "action_summary": action_summary,
        "recommendation": recommendation,
        "risk_level": risk_level,
        "trade_levels": {
            "entry_price": current_price,
            "stop_loss": stop_loss,
            "take_profit_1": take_profit_1,
            "take_profit_2": take_profit_2,
            "risk_reward_ratio": "1 : 2.0"
        },
        "ml": {
            "signal": ml_result["signal"],
            "confidence": ml_result["confidence"],
            "probabilities": probs,
            "metrics": ml_result["metrics"],
            "feature_importances": ml_result["feature_importances"]
        },
        "quantitative": {
            "score": quant_score,
            "signal": quant_result["signal"],
            "confidence": quant_result["confidence"],
            "factors": quant_result["factors"],
            "reasons": quant_result["reasons"]
        },
        "baseline_comparison": {
            "naive_signal": baseline_signal,
            "status": "agreement" if (baseline_signal == "BUY" and "BUY" in verdict) or (baseline_signal == "SELL" and "SELL" in verdict) else "divergence"
        },
        "indicators": {
            "rsi": round(float(latest.get("RSI14", 50)), 2),
            "sma20": round(float(latest.get("SMA20", current_price)), 2),
            "ema50": round(float(latest.get("EMA50", current_price)), 2),
            "ema200": round(float(latest.get("EMA200", current_price)), 2),
            "macd": round(float(latest.get("MACD", 0)), 2),
            "macd_signal": round(float(latest.get("MACD_Signal", 0)), 2),
            "bb_upper": round(float(latest.get("BB_Upper", current_price * 1.05)), 2),
            "bb_lower": round(float(latest.get("BB_Lower", current_price * 0.95)), 2),
            "atr14": round(atr, 2)
        }
    }
