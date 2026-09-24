import pandas as pd
import numpy as np
from strategy.naive_strategy import generate_naive_signal
from strategy.upgraded_strategy import evaluate_upgraded_strategy
from ml.feature_engineering import build_features, FEATURE_COLUMNS
from ml.model import predictor
from indicators.indicators import calculate_all_indicators

def run_simulation(df: pd.DataFrame, strategy_type: str = "consensus", starting_balance: float = 10000.0, fee: float = 0.001):
    """
    Simulates trading on historical candles with realistic fees and portfolio tracking.
    """
    balance = starting_balance
    btc = 0.0
    position = False
    buy_price = 0.0
    trades = []
    equity_curve = []
    peak_equity = starting_balance
    max_drawdown = 0.0

    # Ensure indicators exist
    if "RSI14" not in df.columns:
        df = calculate_all_indicators(df)

    # For ML strategy, pre-generate predictions if needed
    ml_preds = None
    if strategy_type in ["ml", "consensus"]:
        df_feat = build_features(df).fillna(0.0)
        if not predictor.is_trained:
            predictor.train(df)
        probs = predictor.model.predict_proba(df_feat[FEATURE_COLUMNS])
        classes = predictor.model.classes_
        buy_idx = list(classes).index(1) if 1 in classes else -1
        sell_idx = list(classes).index(2) if 2 in classes else -1
        ml_buy_probs = probs[:, buy_idx] if buy_idx >= 0 else np.zeros(len(df))
        ml_sell_probs = probs[:, sell_idx] if sell_idx >= 0 else np.zeros(len(df))

    # Evaluate starting from index 30 to allow indicator warmup
    start_idx = min(35, len(df) - 10)

    for i in range(start_idx, len(df)):
        current_data = df.iloc[:i + 1]
        current = df.iloc[i]
        price = float(current["Close"])
        time_str = current["Open Time"].strftime("%Y-%m-%d %H:%M")

        signal = "HOLD"

        if strategy_type == "baseline":
            signal = generate_naive_signal(current_data)
        elif strategy_type == "upgraded":
            quant_res = evaluate_upgraded_strategy(current_data)
            score = quant_res["score"]
            signal = "BUY" if score >= 25 else "SELL" if score <= -25 else "HOLD"
        elif strategy_type == "ml":
            p_b = ml_buy_probs[i]
            p_s = ml_sell_probs[i]
            signal = "BUY" if p_b > 0.45 and p_b > p_s else "SELL" if p_s > 0.45 and p_s > p_b else "HOLD"
        elif strategy_type == "consensus":
            quant_res = evaluate_upgraded_strategy(current_data)
            p_b = ml_buy_probs[i]
            p_s = ml_sell_probs[i]
            score = 0.45 * quant_res["score"] + 0.55 * ((p_b - p_s) * 100)
            signal = "BUY" if score >= 20 else "SELL" if score <= -20 else "HOLD"

        # Trade Execution Logic
        if signal == "BUY" and not position:
            trading_fee = balance * fee
            money_to_trade = balance - trading_fee
            btc = money_to_trade / price
            buy_price = price
            balance = 0.0
            position = True
            trades.append({
                "type": "BUY",
                "price": round(price, 2),
                "time": time_str,
                "portfolio_value": round(btc * price, 2)
            })

        elif signal == "SELL" and position:
            gross = btc * price
            trading_fee = gross * fee
            balance = gross - trading_fee
            pnl = balance - (btc * buy_price)
            pnl_pct = (price - buy_price) / buy_price * 100
            trades.append({
                "type": "SELL",
                "price": round(price, 2),
                "time": time_str,
                "portfolio_value": round(balance, 2),
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2)
            })
            btc = 0.0
            position = False

        # Mark-to-market equity
        current_equity = btc * price if position else balance
        if current_equity > peak_equity:
            peak_equity = current_equity
        dd = (peak_equity - current_equity) / (peak_equity + 1e-10) * 100
        if dd > max_drawdown:
            max_drawdown = dd

        equity_curve.append({
            "time": time_str,
            "equity": round(current_equity, 2),
            "price": round(price, 2)
        })

    final_price = float(df.iloc[-1]["Close"])
    final_balance = (btc * final_price) if position else balance
    profit_loss = final_balance - starting_balance
    return_percentage = (profit_loss / starting_balance) * 100

    # Trade stats
    completed_trades = [t for t in trades if t["type"] == "SELL"]
    winning_trades = [t for t in completed_trades if t.get("pnl", 0) > 0]
    losing_trades = [t for t in completed_trades if t.get("pnl", 0) <= 0]
    win_rate = (len(winning_trades) / len(completed_trades) * 100) if completed_trades else 0.0

    gross_gains = sum(t.get("pnl", 0) for t in winning_trades)
    gross_losses = abs(sum(t.get("pnl", 0) for t in losing_trades))
    profit_factor = round(gross_gains / (gross_losses + 1e-10), 2) if gross_losses > 0 else (9.99 if gross_gains > 0 else 1.0)

    # Buy and hold benchmark
    bh_return = (final_price - float(df.iloc[start_idx]["Close"])) / float(df.iloc[start_idx]["Close"]) * 100

    return {
        "strategy": strategy_type,
        "starting_balance": starting_balance,
        "final_balance": round(final_balance, 2),
        "profit_loss": round(profit_loss, 2),
        "return_percentage": round(return_percentage, 2),
        "buy_and_hold_return": round(bh_return, 2),
        "total_trades": len(trades),
        "completed_trades": len(completed_trades),
        "winning_trades": len(winning_trades),
        "losing_trades": len(losing_trades),
        "win_rate": round(win_rate, 1),
        "profit_factor": profit_factor,
        "max_drawdown": round(max_drawdown, 2),
        "trades": trades[-20:], # Return last 20 trades
        "equity_curve": equity_curve[::max(1, len(equity_curve) // 60)] # Downsampled 60 points for charting
    }

def run_comparative_backtest(df: pd.DataFrame, starting_balance: float = 10000.0) -> dict:
    """
    Runs all 4 strategies in parallel on the same dataset for direct comparison.
    """
    baseline = run_simulation(df, strategy_type="baseline", starting_balance=starting_balance)
    upgraded = run_simulation(df, strategy_type="upgraded", starting_balance=starting_balance)
    ml_strat = run_simulation(df, strategy_type="ml", starting_balance=starting_balance)
    consensus = run_simulation(df, strategy_type="consensus", starting_balance=starting_balance)

    return {
        "baseline": baseline,
        "upgraded": upgraded,
        "ml": ml_strat,
        "consensus": consensus,
        "comparison": [
            {
                "name": "Baseline (Original Repo)",
                "return_pct": baseline["return_percentage"],
                "win_rate": baseline["win_rate"],
                "trades": baseline["total_trades"],
                "profit_factor": baseline["profit_factor"],
                "max_drawdown": baseline["max_drawdown"],
                "final_balance": baseline["final_balance"]
            },
            {
                "name": "Upgraded Multi-Factor Quant",
                "return_pct": upgraded["return_percentage"],
                "win_rate": upgraded["win_rate"],
                "trades": upgraded["total_trades"],
                "profit_factor": upgraded["profit_factor"],
                "max_drawdown": upgraded["max_drawdown"],
                "final_balance": upgraded["final_balance"]
            },
            {
                "name": "Machine Learning Ensemble",
                "return_pct": ml_strat["return_percentage"],
                "win_rate": ml_strat["win_rate"],
                "trades": ml_strat["total_trades"],
                "profit_factor": ml_strat["profit_factor"],
                "max_drawdown": ml_strat["max_drawdown"],
                "final_balance": ml_strat["final_balance"]
            },
            {
                "name": "Dual Consensus (The Main Output)",
                "return_pct": consensus["return_percentage"],
                "win_rate": consensus["win_rate"],
                "trades": consensus["total_trades"],
                "profit_factor": consensus["profit_factor"],
                "max_drawdown": consensus["max_drawdown"],
                "final_balance": consensus["final_balance"]
            }
        ]
    }
