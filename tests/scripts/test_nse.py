def check_nse():
    try:
        from nsepython import nse_eq
    except ImportError:
        print("nsepython -> FAILED (not installed)")
        return

    tickers = ["RELIANCE", "TCS", "ICICIBANK","Inavhegfe"]

    print("\n=== NSEPYTHON CHECK ===\n")

    for ticker in tickers:
        try:
            data = nse_eq(ticker)
            if not isinstance(data, dict) or not data:
                print(f"{ticker} -> FAILED")
                continue

            price_info = data.get("priceInfo", {})
            price = price_info.get("lastPrice")
            change = price_info.get("pChange")

            if price is None:
                print(f"{ticker} -> FAILED (no price data)")
            elif change is None:
                print(f"{ticker} -> FAILED (no change data)")
            else:
                print(f"{ticker} -> SUCCESS | lastPrice={price} | pChange={round(change,2)}")
        except Exception:
            print(f"{ticker} -> FAILED")

    print("\n=== CHECK COMPLETE ===\n")


if __name__ == "__main__":
    check_nse()
