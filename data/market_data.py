import requests
import pandas as pd


# Binance API URL
URL = "https://data-api.binance.vision/api/v3/klines"


def get_market_data(symbol="BTCUSDT", interval="1h", limit=500):

    # Parameters we send to Binance
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }

    # Send request to Binance
    response = requests.get(URL, params=params)

    # Check if request was successful
    response.raise_for_status()

    # Convert response into Python data
    data = response.json()

    # Column names
    columns = [
        "Open Time",
        "Open",
        "High",
        "Low",
        "Close",
        "Volume",
        "Close Time",
        "Quote Volume",
        "Trades",
        "Buy Volume",
        "Buy Quote Volume",
        "Ignore"
    ]

    # Convert data into DataFrame
    df = pd.DataFrame(data, columns=columns)

    # Convert price and volume to numbers
    df["Open"] = pd.to_numeric(df["Open"])
    df["High"] = pd.to_numeric(df["High"])
    df["Low"] = pd.to_numeric(df["Low"])
    df["Close"] = pd.to_numeric(df["Close"])
    df["Volume"] = pd.to_numeric(df["Volume"])

    # Convert timestamp into readable date/time
    df["Open Time"] = pd.to_datetime(
        df["Open Time"],
        unit="ms"
    )

    return df


# Test the function
if __name__ == "__main__":

    df = get_market_data()

    print("\nLatest BTC/USDT Data:")
    print(df[["Open Time", "Open", "High", "Low", "Close", "Volume"]].tail())