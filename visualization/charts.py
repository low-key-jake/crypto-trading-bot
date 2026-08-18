import matplotlib.pyplot as plt


def plot_trading_chart(df, trades):

    plt.figure(figsize=(14, 7))

    # BTC Price
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

    # BUY and SELL points
    buy_label_added = False
    sell_label_added = False

    for trade in trades:

        if trade["type"] == "BUY":

            if not buy_label_added:
                plt.scatter(
                    trade["time"],
                    trade["price"],
                    marker="^",
                    s=100,
                    label="BUY"
                )
                buy_label_added = True
            else:
                plt.scatter(
                    trade["time"],
                    trade["price"],
                    marker="^",
                    s=100
                )

        elif trade["type"] == "SELL":

            if not sell_label_added:
                plt.scatter(
                    trade["time"],
                    trade["price"],
                    marker="v",
                    s=100,
                    label="SELL"
                )
                sell_label_added = True
            else:
                plt.scatter(
                    trade["time"],
                    trade["price"],
                    marker="v",
                    s=100
                )

    plt.xlabel("Time")
    plt.ylabel("BTC Price")

    plt.title("BTC/USDT Trading Strategy Backtest")

    plt.legend()

    plt.grid(True)

    plt.xticks(rotation=45)

    plt.tight_layout()

    # Save graph
    plt.savefig(
        "trading_chart.png",
        dpi=150,
        bbox_inches="tight"
    )

    plt.close()

    print("\nTrading chart saved successfully!")

