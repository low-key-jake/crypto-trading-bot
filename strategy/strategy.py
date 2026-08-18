def generate_signal(df):

    # We need at least 2 candles
    if len(df) < 2:
        return "HOLD"

    # Current and previous candles
    current = df.iloc[-1]
    previous = df.iloc[-2]

    current_rsi = current["RSI14"]
    previous_rsi = previous["RSI14"]

    # Check for missing RSI values
    if (
        current_rsi != current_rsi
        or previous_rsi != previous_rsi
    ):
        return "HOLD"

    # BUY:
    # RSI was below 30 and has now crossed above 30
    if previous_rsi < 30 and current_rsi >= 30:
        return "BUY"

    # SELL:
    # RSI was above 70 and has now crossed below 70
    elif previous_rsi > 70 and current_rsi <= 70:
        return "SELL"

    # Otherwise
    return "HOLD"