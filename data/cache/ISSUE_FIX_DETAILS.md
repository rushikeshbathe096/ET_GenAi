# M3 Pipeline - Issue Fix Details

## Issue Discovered During Testing

### Problem Statement
The `explanation_agent.py` was generating reasoning cards that contained the prohibited phrases "buy" and "sell", which violates the requirements that state:
> "max 3–4 sentences, **no 'buy/sell' advice**"

### Root Cause
In the `_build_reasoning_card()` function, the third sentence explicitly mentioned these prohibited words:

```python
# ❌ BEFORE (Had prohibited language)
sentence_3 = (
    f"Historical context is {hist_strength} with {historical_base_rate}, "
    f"so this is a data signal and not buy or sell advice."
)
```

### Fix Applied

**File:** `agents/explanation_agent.py`
**Lines:** 68-72

**Change:**
```python
# ✅ AFTER (No prohibited language)
sentence_3 = (
    f"Historical precedent shows {hist_strength} outcomes ({historical_base_rate}). "
    f"This is presented as analytical data only."
)
```

### Why This Fix Works
1. ✅ Removes all mentions of "buy" and "sell"
2. ✅ Maintains the same meaning (it's data, not investment advice)
3. ✅ Shorter and more direct
4. ✅ Still conveys that historical outcomes should be understood in context
5. ✅ Clarifies this is analytical data (not advice)

### Test Verification
After applying the fix:
- ✅ All 3 signals passed explanation agent validation
- ✅ No "buy/sell" language detected in any reasoning cards
- ✅ Full pipeline executed successfully
- ✅ Final output saved to `data/cache/today.json`

### Example Output (Post-Fix)

**Reasoning Card for TITAN (9.2 confidence):**
```
[
  "TITAN is marked as high confidence confidence due to multiple supporting signals in the current setup.",
  "Why now: Promoter spending personal capital + positive news sentiment.",
  "Historical precedent shows weak outcomes (1/3 events gave >10% return). This is presented as analytical data only."
]
```

✅ All requirements satisfied:
- 3 sentences (within 3-4 range)
- No "buy/sell" advice
- Explains reasoning clearly
- Contextualizes historical data

### Impact Summary
- **Files Modified:** 1 (`agents/explanation_agent.py`)
- **Lines Changed:** 5 (lines 68-72)
- **Tests Before Fix:** 7/8 PASS (1 FAIL)
- **Tests After Fix:** 8/8 PASS
