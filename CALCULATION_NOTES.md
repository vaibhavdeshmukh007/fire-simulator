# FIRE Simulator - Calculation Documentation

## Overview
This document explains the financial calculations used in the FIRE Simulator and documents important behavioral decisions.

## Core Calculation Methodology

### 1. Order of Operations (Per Year)
```
1. Apply inflation to expenses (if set)
2. Apply life events for the year
3. Calculate income (with career break overrides)
4. Apply investment returns to EXISTING portfolio balance
5. Calculate savings (income - expenses) or withdrawals (-expenses)
6. Add savings/withdrawals to portfolio
7. Check if FIRE target reached
8. Record results
```

### 2. Investment Returns
**Conservative Approach**: Returns are applied to the **beginning-of-year balance** only.

- New contributions added during the year do NOT earn returns until the following year
- This is more conservative and realistic since contributions happen throughout the year
- Example: $100k portfolio at 8% = $108k, then add $10k savings = $118k end balance

### 3. Retirement Withdrawals
**4% Rule Implementation**: 
- FIRE Target = Annual Expenses × 25
- In retirement: Withdraw annual expenses from portfolio
- Portfolio continues to earn returns on remaining balance
- Net worth floored at $0 (negative balances shown as 0)

## Life Event Behaviors

### Permanent Effects (Apply to All Future Years)

#### Inflation Adjustment
- **Behavior**: Sets ongoing annual inflation rate
- **Effect**: Compounds expenses every year from this point forward
- **Example**: 3% inflation in Year 5 means expenses grow 3% annually in Years 5, 6, 7, etc.
- **To Stop**: Set another inflation_adjustment event with 0%

#### Market Downturn
- **Behavior**: Permanently reduces return rate
- **Effect**: Multiplies current return rate by (1 - downturn%)
- **Example**: 20% downturn on 8% returns = 8% × 0.8 = 6.4% ongoing
- **Use Case**: Model permanent shift to conservative investments
- **To Recover**: Use "Investment Allocation Change" to set new return rate

#### Investment Allocation Change
- **Behavior**: Sets a new return rate for all remaining years
- **Effect**: Replaces current return rate with specified value
- **Example**: Change from 8% to 5% by entering 5
- **Use Case**: Portfolio rebalancing, risk tolerance changes, or recovering from market downturn

### Temporary Effects

#### Career Break
- **Behavior**: Zeros income for specified duration
- **Effect**: Income = 0 for the duration specified
- **Example**: Career break in Year 5 for 2 years = no income in Years 5 and 6
- **Auto-Recovery**: Income resumes automatically after duration ends

## Edge Cases & Validations

### 1. Negative Net Worth
- **Display**: Shown as $0 in charts and results
- **Internal**: Actual value can go negative
- **Warning**: Console warning when portfolio depleted in retirement

### 2. Negative Expenses
- **Validation**: Automatically set to $0 if expenses become negative
- **Warning**: Console warning when this occurs
- **Cause**: Usually from excessive debt payoffs

### 3. Retirement Year Detection
- **Logic**: Only detected if FIRE target reached BEFORE manual retirement event
- **Manual Retirement**: Using "retirement" life event doesn't count as "achieving FIRE"
- **Display**: Shows "Target not reached" if manual retirement used

### 4. FIRE Target Calculation
- **Default**: Current expenses × 25 (4% withdrawal rule)
- **Custom**: Can specify custom withdrawal rate in retirement event
- **Example**: 3% withdrawal = expenses × 33.33

## Common Scenarios

### Modeling a Temporary Market Crash
```
Year 10: Market Downturn (30% reduction)
Year 15: Investment Allocation Change (8% - back to normal)
```

### Modeling Realistic Inflation
```
Year 1: Inflation Adjustment (2.5%)
// Expenses now grow 2.5% annually forever
```

### Modeling Early Retirement with Reduced Expenses
```
Year 15: Downsizing (30% expense reduction)
Year 15: Retirement (4% withdrawal - default)
```

### Modeling Job Loss and Recovery
```
Year 8: Career Break (2 years)
Year 10: Job Change (new income - auto-resumes)
```

## Validation Warnings

The simulator logs console warnings for:
- Negative expenses (auto-corrected to 0)
- Portfolio depletion in retirement
- Any edge cases that might affect accuracy

Check browser console for these warnings during simulation.

## Known Limitations

1. **No sequence of returns risk**: All scenarios use constant return rates
2. **No tax considerations**: All calculations are pre-tax
3. **No Social Security**: Not modeled in retirement income
4. **No healthcare costs**: Must be manually added as life events
5. **Simplified inflation**: Applies uniformly to all expenses

## Recommendations for Accurate Modeling

1. **Use Conservative Scenarios**: The 6% return scenario is more realistic long-term
2. **Add Inflation**: Use 2-3% inflation adjustment for realistic expense growth
3. **Model Major Expenses**: Add home purchases, children, healthcare as life events
4. **Plan for Downturns**: Add market downturn events to stress-test your plan
5. **Check Console**: Review warnings for edge cases in your scenario

---

**Last Updated**: Based on fixes applied on 3/29/2026
**Version**: 2.0 (Post-calculation fixes)
