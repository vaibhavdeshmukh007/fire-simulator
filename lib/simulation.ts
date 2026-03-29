import { LifeEvent } from "@/types";

export type ScenarioResult = {
  scenario: string;
  netWorth: number[];
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
      if (event.value) {
        state.currentReturnRate *= (1 - event.value / 100);
      }
      break;

    case "investment_allocation_change":
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
): { results: number[]; retirementYear?: number } {
  const results: number[] = [];
  let retirementYear: number | undefined;

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
    if (state.inflationRate > 0) {
      state.currentExpenses *= 1 + state.inflationRate / 100;
    }

    const eventsThisYear = eventMap.get(year) || [];
    eventsThisYear.forEach((event) => {
      applyLifeEvent(state, event, year, yearlyExpenses);
    });

    let incomeThisYear = state.currentIncome;
    careerBreakEnd.forEach((endYear, startYear) => {
      if (year >= startYear && year < endYear) {
        incomeThisYear = 0;
      }
    });

    let savings: number;
    if (state.isRetired) {
      savings = -(state.fireTarget * 0.04 - state.currentExpenses);
    } else {
      savings = incomeThisYear - state.currentExpenses;
    }

    state.netWorth += savings;
    state.netWorth *= 1 + state.currentReturnRate;

    if (!retirementYear && !state.isRetired && state.netWorth >= state.fireTarget) {
      retirementYear = year;
    }

    results.push(Math.max(0, state.netWorth));
  }

  return { results, retirementYear };
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

    const { results, retirementYear } = simulateSingleScenario(
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
      retirementYear,
      maxNetWorth,
    };
  });

  return scenarios;
}