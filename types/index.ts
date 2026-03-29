export type EventType = 
  | "job_change"
  | "child_born"
  | "expense_change"
  | "salary_raise"
  | "bonus_windfall"
  | "career_break"
  | "side_hustle"
  | "home_purchase"
  | "vehicle_purchase"
  | "education_tuition"
  | "healthcare_event"
  | "home_renovation"
  | "retirement"
  | "geographic_relocation"
  | "downsizing"
  | "inflation_adjustment"
  | "debt_payoff"
  | "market_downturn"
  | "investment_allocation_change";

export type LifeEvent = {
  year: number;
  type: EventType;
  value?: number; // Primary value (amount, percentage, etc.)
  value2?: number; // Secondary value for events needing two parameters
  description?: string;
};

export type ScenarioResult = {
  scenario: string;
  netWorth: number[];
  retirementYear?: number;
  maxNetWorth: number;
};

export type SimulationParams = {
  years: number;
  startingNetWorth?: number;
  yearlyIncome: number;
  yearlyExpenses: number;
  lifeEvents?: LifeEvent[];
  returnRates?: number[];
};
