import yfinance as yf
indices = ["^NSEI", "^NSEBANK"]
for idx in indices:
    print(f"Fetching {idx}...")
    h = yf.Ticker(idx).history(period="1d")
    print(f"{idx}: {len(h)}")
    
    idx_ns = f"{idx}.NS"
    print(f"Fetching {idx_ns}...")
    h_ns = yf.Ticker(idx_ns).history(period="1d")
    print(f"{idx_ns}: {len(h_ns)}")
