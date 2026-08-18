import pandas as pd


def calculate_indicators(df):

    # -----------------------------
    # Calculate SMA 20
    # -----------------------------

    df["SMA20"] = df["Close"].rolling(window=20).mean()

    # -----------------------------
    # Calculate RSI 14
    # -----------------------------

    delta = df["Close"].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    average_gain = gain.rolling(window=14).mean()
    average_loss = loss.rolling(window=14).mean()

    rs = average_gain / average_loss

    df["RSI14"] = 100 - (100 / (1 + rs))

    return df


# Test the function
if __name__ == "__main__":

    print("Indicators module loaded successfully!")