import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from data.market_data import (
    get_market_data, 
    get_ticker_24h, 
    get_coindesk_news, 
    get_mempool_data,
    get_market_overview_stats
)
from indicators.indicators import calculate_all_indicators
from strategy.consensus_engine import get_master_consensus
from backtesting.backtest import run_comparative_backtest
from ml.model import predictor

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/api/status", methods=["GET"])
def get_status():
    return jsonify({
        "status": "online",
        "engine": "Satosphere",
        "version": "2.1.0",
        "model_trained": predictor.is_trained,
        "metrics": predictor.metrics
    })

@app.route("/api/ticker", methods=["GET"])
def get_ticker():
    symbol = request.args.get("symbol", "BTCUSDT").upper()
    data = get_ticker_24h(symbol)
    return jsonify(data)

@app.route("/api/news", methods=["GET"])
def get_news():
    news = get_coindesk_news()
    return jsonify({
        "status": "success",
        "count": len(news),
        "source": "CoinDesk & Mempool",
        "articles": news
    })

@app.route("/api/mempool", methods=["GET"])
def get_mempool():
    data = get_mempool_data()
    return jsonify(data)

@app.route("/api/overview", methods=["GET"])
def get_overview():
    symbol = request.args.get("symbol", "BTCUSDT").upper()
    ticker = get_ticker_24h(symbol)
    current_price = ticker.get("lastPrice", 84010.55)
    stats = get_market_overview_stats(current_price=current_price)
    return jsonify(stats)

@app.route("/api/analysis", methods=["GET"])
def get_analysis():
    symbol = request.args.get("symbol", "BTCUSDT").upper()
    interval = request.args.get("interval", "1h")
    limit = int(request.args.get("limit", 1000))

    try:
        df = get_market_data(symbol=symbol, interval=interval, limit=limit)
        df = calculate_all_indicators(df)
        result = get_master_consensus(df, symbol=symbol)
        
        # Attach rich telemetry
        ticker = get_ticker_24h(symbol)
        mempool = get_mempool_data()
        overview = get_market_overview_stats(current_price=result["current_price"])

        result["ticker"] = ticker
        result["mempool"] = mempool
        result["overview"] = overview
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/market", methods=["GET"])
def get_market():
    symbol = request.args.get("symbol", "BTCUSDT").upper()
    interval = request.args.get("interval", "1h")
    limit = int(request.args.get("limit", 500))

    try:
        df = get_market_data(symbol=symbol, interval=interval, limit=limit)
        df = calculate_all_indicators(df)

        candles = []
        for _, row in df.iterrows():
            candles.append({
                "time": row["Open Time"].strftime("%Y-%m-%d %H:%M"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": round(float(row["Volume"]), 4),
                "buy_volume": round(float(row.get("Buy Volume", 0)), 4),
                "sma20": round(float(row["SMA20"]), 2) if not pd_isna(row.get("SMA20")) else None,
                "ema50": round(float(row["EMA50"]), 2) if not pd_isna(row.get("EMA50")) else None,
                "ema200": round(float(row["EMA200"]), 2) if not pd_isna(row.get("EMA200")) else None,
                "bb_upper": round(float(row["BB_Upper"]), 2) if not pd_isna(row.get("BB_Upper")) else None,
                "bb_lower": round(float(row["BB_Lower"]), 2) if not pd_isna(row.get("BB_Lower")) else None,
                "rsi14": round(float(row["RSI14"]), 2) if not pd_isna(row.get("RSI14")) else None,
                "macd": round(float(row["MACD"]), 2) if not pd_isna(row.get("MACD")) else None,
                "macd_signal": round(float(row["MACD_Signal"]), 2) if not pd_isna(row.get("MACD_Signal")) else None,
            })

        return jsonify({
            "symbol": symbol,
            "interval": interval,
            "candles": candles
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/backtest", methods=["GET"])
def get_backtest():
    symbol = request.args.get("symbol", "BTCUSDT").upper()
    interval = request.args.get("interval", "1h")
    limit = int(request.args.get("limit", 1000))
    capital = float(request.args.get("capital", 10000.0))

    try:
        df = get_market_data(symbol=symbol, interval=interval, limit=limit)
        df = calculate_all_indicators(df)
        results = run_comparative_backtest(df, starting_balance=capital)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/retrain", methods=["POST"])
def retrain():
    symbol = request.args.get("symbol", "BTCUSDT").upper()
    try:
        df = get_market_data(symbol=symbol, interval="1h", limit=1000)
        df = calculate_all_indicators(df)
        res = predictor.train(df)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def pd_isna(val):
    return val is None or val != val

if __name__ == "__main__":
    print("Satosphere Engine: Pre-fitting neural tree ensemble on 1,000 candles...")
    try:
        init_df = get_market_data("BTCUSDT", "1h", limit=1000)
        init_df = calculate_all_indicators(init_df)
        predictor.train(init_df)
        print("Satosphere Model ready! Accuracy:", predictor.metrics.get("accuracy", "%"))
    except Exception as e:
        print(f"Warning during pre-training: {e}")

    print("Launching Satosphere API server on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False)
