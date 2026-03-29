type Input = {
  years: number;
  yearlyIncome: number;
  yearlyExpenses: number;
  returnRate: number;
};

export function simulate({
  years,
  yearlyIncome,
  yearlyExpenses,
  returnRate,
}: Input) {
  let netWorth = 0;
  const results: number[] = [];

  for (let i = 0; i < years; i++) {
    const savings = yearlyIncome - yearlyExpenses;
    netWorth += savings;
    netWorth *= 1 + returnRate;

    results.push(netWorth);
  }

  return results;
}