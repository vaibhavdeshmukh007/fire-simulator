/**
 * FIRE Simulator - Financial Independence Calculation Engine
 * 
 * CALCULATION METHODOLOGY:
 * 1. Returns are applied to beginning-of-year balance (conservative approach)
 * 2. Savings/withdrawals are added at end of year
 * 3. Net worth is floored at 0 (no negative balances shown)
 * 
 * IMPORTANT BEHAVIORS:
 * - Inflation: Once set, compounds expenses annually for all future years
 * - Market Downturn: Permanently reduces return rate (use allocation change to reset)
 * - Career Break: Zeros income for specified duration
 * - Retirement: Switches to withdrawal mode (expenses drawn from portfolio)
 * 
 * EDGE CASES:
 * - Negative net worth is displayed as 0 in results
 * - Retirement year only detected if FIRE target is reached before manual retirement
 * - FIRE target = expenses * 25 (4% withdrawal rule)
 */

import { LifeEvent } from "@/types";

export type ScenarioResult = {
  scenario: string;
  netWorth: number[];
  contributions: number[];
  retirementYear?: number;
  maxNetWorth: number;
};

type SimulationInput = {
  years: number;
  startingNetWorth?: number;
  yearlyIncome: number;
  yearlyExpenses: number;
  lifeEvents?: LifeEvent[];
  returnRates?: number[];
};

const FIRE_MULTIPLE = 25; // 4% withdrawal rate means need 25x annual expenses

interface SimulationState {
  netWorth: number;
  currentIncome: number;
  currentExpenses: number;
  currentReturnRate: number;
  isRetired: boolean;
  inflationRate: number;
  fireTarget: number;
}

function applyLifeEvent(
  state: SimulationState,
  event: LifeEvent,
  year: number,
  baseYearlyExpenses: number
): void {
  switch (event.type) {
    case "job_change":
      if (event.value) state.currentIncome = event.value;
      break;

    case "child_born":
      if (event.value) state.currentExpenses += event.value;
      break;

    case "expense_change":
      if (event.value) state.currentExpenses = event.value;
      break;

    case "salary_raise":
      if (event.value) {
        state.currentIncome += state.currentIncome * (event.value / 100);
      }
      break;

    case "bonus_windfall":
      if (event.value) state.netWorth += event.value;
      break;

    case "career_break":
      if (event.value) state.currentIncome = 0;
      break;

    case "side_hustle":
      if (event.value) state.currentIncome += event.value;
      break;

    case "home_purchase":
      if (event.value) state.netWorth -= event.value;
      break;

    case "vehicle_purchase":
      if (event.value) state.netWorth -= event.value;
      break;

    case "education_tuition":
      if (event.value) state.netWorth -= event.value;
      break;

    case "healthcare_event":
      if (event.value) state.netWorth -= event.value;
      break;

    case "home_renovation":
      if (event.value) state.netWorth -= event.value;
      break;

    case "retirement":
      state.isRetired = true;
      if (event.value) {
        state.fireTarget = state.currentExpenses * (100 / event.value);
      } else {
        state.fireTarget = state.currentExpenses * FIRE_MULTIPLE;
      }
      break;

    case "geographic_relocation":
      if (event.value) {
        state.currentExpenses = state.currentExpenses * (1 + event.value / 100);
      }
      break;

    case "downsizing":
      if (event.value) {
        state.currentExpenses = state.currentExpenses * (1 - event.value / 100);
      }
      break;

    case "inflation_adjustment":
      // Sets ongoing annual inflation rate that compounds expenses every year
      // Once set, inflation applies to all future years until changed
      // Example: 3% inflation means expenses grow 3% annually from this point forward
      if (event.value) {
        state.inflationRate = event.value;
      }
      break;

    case "debt_payoff":
      if (event.value) {
        state.currentExpenses -= event.value;
      }
      break;

    case "market_downturn":
      // PERMANENT EFFECT: Reduces return rate for all remaining years
      // Example: 20% downturn on 8% returns = 8% * (1 - 0.20) = 6.4% ongoing
      // Use this to model a permanent shift to more conservative investments
      // For temporary downturns, use investment_allocation_change to reset later
      if (event.value) {
        state.currentReturnRate *= (1 - event.value / 100);
      }
      break;

    case "investment_allocation_change":
      // PERMANENT EFFECT: Sets a new return rate for all remaining years
      // Example: Change from 8% to 5% by entering 5 as the value
      // Use this to model portfolio rebalancing or risk tolerance changes
      if (event.value) {
        state.currentReturnRate = event.value / 100;
      }
      break;
  }
}

function simulateSingleScenario(
  years: number,
  yearlyIncome: number,
  yearlyExpenses: number,
  baseReturnRate: number,
  lifeEvents: LifeEvent[] = [],
  startingNetWorth: number = 0
): { results: number[]; contributions: number[]; retirementYear?: number } {
  const results: number[] = [];
  const contributions: number[] = [];
  let retirementYear: number | undefined;
  let cumulativeContributions = startingNetWorth;

  const eventMap = new Map<number, LifeEvent[]>();
  lifeEvents.forEach((event) => {
    if (!eventMap.has(event.year)) {
      eventMap.set(event.year, []);
    }
    eventMap.get(event.year)!.push(event);
  });

  const careerBreakEnd = new Map<number, number>();
  lifeEvents.forEach((event) => {
    if (event.type === "career_break" && event.value) {
      careerBreakEnd.set(event.year, event.year + event.value);
    }
  });

  const state: SimulationState = {
    netWorth: startingNetWorth,
    currentIncome: yearlyIncome,
    currentExpenses: yearlyExpenses,
    currentReturnRate: baseReturnRate,
    isRetired: false,
    inflationRate: 0,
    fireTarget: yearlyExpenses * FIRE_MULTIPLE,
  };

  for (let year = 1; year <= years; year++) {
    // Apply inflation to expenses (compounds annually if set)
    if (state.inflationRate > 0) {
      state.currentExpenses *= 1 + state.inflationRate / 100;
    }

    // Apply life events for this year
    const eventsThisYear = eventMap.get(year) || [];
    eventsThisYear.forEach((event) => {
      applyLifeEvent(state, event, year, yearlyExpenses);
    });

    // Handle career break income override
    let incomeThisYear = state.currentIncome;
    careerBreakEnd.forEach((endYear, startYear) => {
      if (year >= startYear && year < endYear) {
        incomeThisYear = 0;
      }
    });

    // EDGE CASE VALIDATION: Prevent negative expenses
    if (state.currentExpenses < 0) {
      console.warn(`Year ${year}: Expenses became negative (${state.currentExpenses}). Setting to 0.`);
      state.currentExpenses = 0;
    }

    // Apply investment returns to existing portfolio first
    state.netWorth *= 1 + state.currentReturnRate;

    let savings: number;
    if (state.isRetired) {
      // In retirement, withdraw expenses from portfolio (negative savings)
      savings = -state.currentExpenses;
      
      // EDGE CASE: Warn if portfolio can't sustain withdrawals
      if (state.netWorth + savings < 0) {
        console.warn(`Year ${year}: Portfolio depleted. Net worth: ${state.netWorth.toFixed(2)}, Withdrawal: ${state.currentExpenses.toFixed(2)}`);
      }
    } else {
      savings = incomeThisYear - state.currentExpenses;
    }

    // Track contributions (cumulative positive savings)
    if (savings > 0) {
      cumulativeContributions += savings;
    }

    // Add savings/withdrawals after returns have been applied
    state.netWorth += savings;

    // Check if FIRE target reached (only before manual retirement)
    if (!retirementYear && !state.isRetired && state.netWorth >= state.fireTarget) {
      retirementYear = year;
    }

    // Store results (floor at 0 to avoid showing negative net worth)
    results.push(Math.max(0, state.netWorth));
    contributions.push(Math.max(0, cumulativeContributions));
  }

  return { results, contributions, retirementYear };
}

export function simulate({
  years,
  startingNetWorth = 0,
  yearlyIncome,
  yearlyExpenses,
  lifeEvents = [],
  returnRates = [0.08],
}: SimulationInput): ScenarioResult[] {
  const scenarios = returnRates.map((rate) => {
    const scenarioName =
      rate === 0.08
        ? "Average (8%)"
        : rate === 0.06
          ? "Conservative (6%)"
          : rate === 0.1
            ? "Optimistic (10%)"
            : `${(rate * 100).toFixed(1)}%`;

    const { results, contributions, retirementYear } = simulateSingleScenario(
      years,
      yearlyIncome,
      yearlyExpenses,
      rate,
      lifeEvents,
      startingNetWorth
    );

    const maxNetWorth = Math.max(...results);

    return {
      scenario: scenarioName,
      netWorth: results,
      contributions,
      retirementYear,
      maxNetWorth,
    };
  });

  return scenarios;
}