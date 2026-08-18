import pandas as pd

from visualization.charts import plot_trading_chart
from data.market_data import get_market_data
from indicators.indicators import calculate_indicators
from strategy.strategy import generate_signal
from backtesting.backtest import run_backtest


print("================================")
print("       CRYPTO TRADING BOT")
print("================================")

print("\nGetting BTC/USDT market data...")

# Get market data
df = get_market_data(
    symbol="BTCUSDT",
    interval="1h",
    limit=500
)

print("Data received successfully!")

# Calculate indicators
df = calculate_indicators(df)

# -----------------------------
# Current Market Analysis
# -----------------------------

latest = df.iloc[-1]

signal = generate_signal(df)

print("\n------ MARKET ANALYSIS ------")

print("Current BTC Price:", round(latest["Close"], 2))
print("SMA 20:", round(latest["SMA20"], 2))
print("RSI 14:", round(latest["RSI14"], 2))

print("\n------ CURRENT SIGNAL ------")

print("Signal:", signal)

# -----------------------------
# Backtesting
# -----------------------------

print("\nRunning backtest...")

results = run_backtest(
    df,
    starting_balance=10000,
    fee=0.001
)

print("\n========== BACKTEST RESULTS ==========")

print(
    "Starting Balance: $",
    round(results["starting_balance"], 2)
)

print(
    "Final Balance: $",
    round(results["final_balance"], 2)
)

print(
    "Profit/Loss: $",
    round(results["profit_loss"], 2)
)

print(
    "Return:",
    round(results["return_percentage"], 2),
    "%"
)

print(
    "Total Trades:",
    results["total_trades"]
)

print(
    "Completed Trades:",
    results["completed_trades"]
)

print(
    "Winning Trades:",
    results["winning_trades"]
)

print(
    "Losing Trades:",
    results["losing_trades"]
)

print(
    "Win Rate:",
    round(results["win_rate"], 2),
    "%"
)

# -----------------------------
# Trade History
# -----------------------------

print("\n---------- TRADES ----------")

for trade in results["trades"]:

    print(
        trade["type"],
        "| Price:",
        round(trade["price"], 2),
        "| Time:",
        trade["time"]
    )
# -----------------------------
# Strategy Debugging
# -----------------------------

print("\n========== STRATEGY ANALYSIS ==========")

# Lowest and highest RSI
lowest_rsi = df["RSI14"].min()
highest_rsi = df["RSI14"].max()

print(
    "Lowest RSI:",
    round(lowest_rsi, 2)
)

print(
    "Highest RSI:",
    round(highest_rsi, 2)
)

# Count oversold candles
oversold = df[df["RSI14"] < 30]

print(
    "RSI below 30:",
    len(oversold)
)

# Count overbought candles
overbought = df[df["RSI14"] > 70]

print(
    "RSI above 70:",
    len(overbought)
)

# Count candles where price is above SMA
above_sma = df[df["Close"] > df["SMA20"]]

print(
    "Price above SMA20:",
    len(above_sma)
)

# Count candles where price is below SMA
below_sma = df[df["Close"] < df["SMA20"]]

print(
    "Price below SMA20:",
    len(below_sma)
)
# -----------------------------
# Check RSI Crossovers
# -----------------------------

print("\n========== RSI CROSSOVER ANALYSIS ==========")

buy_crossovers = 0
sell_crossovers = 0

buy_with_sma = 0
sell_with_sma = 0

for i in range(1, len(df)):

    previous_rsi = df.iloc[i - 1]["RSI14"]
    current_rsi = df.iloc[i]["RSI14"]

    price = df.iloc[i]["Close"]
    sma = df.iloc[i]["SMA20"]

    # Skip missing values
    if (
        pd.isna(previous_rsi)
        or pd.isna(current_rsi)
        or pd.isna(sma)
    ):
        continue

    # RSI crosses upward through 30
    if previous_rsi < 30 and current_rsi >= 30:

        buy_crossovers += 1

        if price > sma:
            buy_with_sma += 1

    # RSI crosses downward through 70
    if previous_rsi > 70 and current_rsi <= 70:

        sell_crossovers += 1

        if price < sma:
            sell_with_sma += 1


print("RSI upward crosses of 30:", buy_crossovers)
print("BUY opportunities after SMA filter:", buy_with_sma)

print("RSI downward crosses of 70:", sell_crossovers)
print("SELL opportunities after SMA filter:", sell_with_sma)

# -----------------------------
# Trading Chart
# -----------------------------

print("\nCreating trading chart...")

plot_trading_chart(
    df,
    results["trades"]
)