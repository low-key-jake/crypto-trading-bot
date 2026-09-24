def generate_naive_signal(df):
    """
    Original baseline strategy from the repo:
    BUY if RSI crosses upwards through 30.
    SELL if RSI crosses downwards through 70.
    """
    if len(df) < 2:
        return "HOLD"

    current = df.iloc[-1]
    previous = df.iloc[-2]

    current_rsi = current.get("RSI14")
    previous_rsi = previous.get("RSI14")

    if pd_isna(current_rsi) or pd_isna(previous_rsi):
        return "HOLD"

    if previous_rsi < 30 and current_rsi >= 30:
        return "BUY"
    elif previous_rsi > 70 and current_rsi <= 70:
        return "SELL"

    return "HOLD"

def pd_isna(val):
    return val is None or val != val
