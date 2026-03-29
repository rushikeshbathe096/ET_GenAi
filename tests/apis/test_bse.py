from bsedata.bse import BSE
import json

def test_bse_fetch_example():
    """
    Test script to validate bsedata library integration.
    Common scrip codes: 
    - 532540 (TCS)
    - 500209 (INFY)
    - 500325 (RELIANCE)
    """
    b = BSE()
    
    # We use update=True to fetch the latest scrip codes mapped globally
    b.updateScripCodes()
    
    scrip_code = "532540" # TCS Scrip Code
    
    try:
        quote = b.getQuote(scrip_code)
        print(f"\n[BSE Analysis Node] Fetching Data for Code: {scrip_code}")
        print(json.dumps(quote, indent=2))
        
        # Validation checks for the test
        assert "companyName" in quote
        assert "currentValue" in quote
        print("\n✅ BSE Connection and Quote Retrieval Successful!")
        
    except Exception as e:
        print(f"\n❌ BSE Data Error: {e}")

if __name__ == "__main__":
    test_bse_fetch_example()
