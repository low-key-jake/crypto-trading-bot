from strategy.strategy import generate_signal


def run_backtest(df, starting_balance=10000, fee=0.001):

    # Starting money
    balance = starting_balance

    # BTC currently owned
    btc = 0

    # Current position
    position = False

    # Store completed trades
    trades = []

    # Go through every candle
    for i in range(1, len(df)):

        # Take data up to the current candle
        current_data = df.iloc[:i + 1]

        # Get current candle
        current = df.iloc[i]

        price = current["Close"]

        # Generate signal using our strategy
        signal = generate_signal(current_data)

        # -----------------------------
        # BUY
        # -----------------------------

        if signal == "BUY" and position == False:

            # Calculate fee
            trading_fee = balance * fee

            # Money available after fee
            money_to_trade = balance - trading_fee

            # Buy BTC
            btc = money_to_trade / price

            # Balance becomes zero
            balance = 0

            position = True

            trades.append({
                "type": "BUY",
                "price": price,
                "time": current["Open Time"]
            })

        # -----------------------------
        # SELL
        # -----------------------------

        elif signal == "SELL" and position == True:

            # Sell BTC
            gross_balance = btc * price

            # Calculate fee
            trading_fee = gross_balance * fee

            # Balance after fee
            balance = gross_balance - trading_fee

            btc = 0

            position = False

            trades.append({
                "type": "SELL",
                "price": price,
                "time": current["Open Time"]
            })

    # Calculate final portfolio value
    final_price = df.iloc[-1]["Close"]

    if position:
        final_balance = btc * final_price
    else:
        final_balance = balance

    # Profit/Loss
    profit_loss = final_balance - starting_balance

    # Return percentage
    return_percentage = (
        profit_loss / starting_balance
    ) * 100

    # -----------------------------
    # Trade statistics
    # -----------------------------

    completed_trades = 0
    winning_trades = 0
    losing_trades = 0

    buy_price = None

    for trade in trades:

        if trade["type"] == "BUY":

            buy_price = trade["price"]

        elif trade["type"] == "SELL" and buy_price is not None:

            completed_trades += 1

            if trade["price"] > buy_price:
                winning_trades += 1
            else:
                losing_trades += 1

            buy_price = None

    # Win rate
    if completed_trades > 0:
        win_rate = (
            winning_trades / completed_trades
        ) * 100
    else:
        win_rate = 0

    return {
        "starting_balance": starting_balance,
        "final_balance": final_balance,
        "profit_loss": profit_loss,
        "return_percentage": return_percentage,
        "total_trades": len(trades),
        "completed_trades": completed_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "win_rate": win_rate,
        "trades": trades
    }