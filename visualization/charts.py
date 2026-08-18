import matplotlib.pyplot as plt


def plot_trading_chart(df, trades):

    plt.figure(figsize=(14, 7))

    # BTC price
    plt.plot(
        df["Open Time"],
        df["Close"],
        label="BTC Price"
    )

    # SMA 20
    plt.plot(
        df["Open Time"],
        df["SMA20"],
        label="SMA 20"
    )

    # Plot BUY and SELL points
    for trade in trades:

        if trade["type"] == "BUY":

            plt.scatter(
                trade["time"],
                trade["price"],
                marker="^",
                s=100,
                label="BUY"
            )

        elif trade["type"] == "SELL":

            plt.scatter(
                trade["time"],
                trade["price"],
                marker="v",
                s=100,
                label="SELL"
            )

    plt.xlabel("Time")
    plt.ylabel("BTC Price")

    plt.title(
        "BTC/USDT Trading Strategy Backtest"
    )

    # Remove duplicate legend entries
    handles, labels = plt.gca().get_legend_handles_labels()

    unique = dict(zip(labels, handles))

    plt.legend(
        unique.values(),
        unique.keys()
    )

    plt.grid(True)

    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.show()