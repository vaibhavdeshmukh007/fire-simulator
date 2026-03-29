"use client";

import { useState, useEffect, useCallback } from "react";
import { simulate } from "@/lib/simulation";
import NetWorthChart from "@/components/NetWorthChart";
import LifeEventsForm from "@/components/LifeEventsForm";
import { LifeEvent, ScenarioResult } from "@/types";

type Currency = "USD" | "INR" | "EUR" | "GBP";

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export default function Home() {
  const [years, setYears] = useState(30);
  const [income, setIncome] = useState(100000);
  const [expenses, setExpenses] = useState(50000);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);

  // Recalculate whenever inputs change
  const handleSimulate = useCallback(() => {
    const results = simulate({
      years,
      yearlyIncome: income,
      yearlyExpenses: expenses,
      lifeEvents,
      returnRates: [0.06, 0.08, 0.1], // Conservative, Average, Optimistic
    });
    setScenarios(results);
  }, [years, income, expenses, lifeEvents]);

  // Auto-simulate when inputs change
  useEffect(() => {
    handleSimulate();
  }, [handleSimulate]);

  return (
    <main className="p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">FIRE Simulator</h1>
        <p className="text-gray-600 mt-2">
          Plan your financial independence by simulating life events and market scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT SIDEBAR - LIFE EVENTS */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-10">
            <LifeEventsForm onEventsChange={setLifeEvents} currency={currency} />
          </div>
        </div>

        {/* CENTER/RIGHT SECTION - INPUTS, CHART */}
        <div className="lg:col-span-3 space-y-6">
          {/* BASELINE INPUTS */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Baseline Scenario</h2>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(currencySymbols).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Simulation Period (Years)"
                value={years}
                onChange={(v) => setYears(Number(v))}
                min={1}
                max={50}
              />

              <Input
                label={`Yearly Income (${currencySymbols[currency]})`}
                value={income}
                onChange={(v) => setIncome(Number(v))}
                min={0}
              />

              <Input
                label={`Yearly Expenses (${currencySymbols[currency]})`}
                value={expenses}
                onChange={(v) => setExpenses(Number(v))}
                min={0}
              />
            </div>

            <div className="p-4 bg-blue-100 rounded text-sm">
              <p className="font-semibold text-blue-900">FIRE Number:</p>
              <p className="text-lg font-bold text-blue-900">
                {currencySymbols[currency]}{(expenses * 25).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on 4% withdrawal rule
              </p>
            </div>
          </div>

          {/* SCENARIOS LEGEND */}
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Market Scenarios</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500" />
                <span>Conservative (6%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500" />
                <span>Average (8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500" />
                <span>Optimistic (10%)</span>
              </div>
            </div>
          </div>

          {/* CHART */}
          {scenarios.length > 0 && <NetWorthChart scenarios={scenarios} currency={currency} />}
        </div>
      </div>

      {/* INSIGHTS */}
      {scenarios.length > 0 && (() => {
        const scenariosWithRetirement = scenarios.filter(s => s.retirementYear);
        const earliestRetirement = scenariosWithRetirement.length > 0 
          ? Math.min(...scenariosWithRetirement.map(s => s.retirementYear || Infinity))
          : null;
        const latestRetirement = scenariosWithRetirement.length > 0
          ? Math.max(...scenariosWithRetirement.map(s => s.retirementYear || 0))
          : null;
        
        const earliestScenario = earliestRetirement 
          ? scenarios.find(s => s.retirementYear === earliestRetirement)?.scenario 
          : null;
        const latestScenario = latestRetirement
          ? scenarios.find(s => s.retirementYear === latestRetirement)?.scenario
          : null;

        // Calculate Year 1 adjusted income/expenses after applying any Year 1 events
        let year1Income = income;
        let year1Expenses = expenses;

        lifeEvents.forEach((event) => {
          if (event.year === 1) {
            if (event.type === "job_change" && event.value) {
              year1Income = event.value;
            } else if (event.type === "child_born" && event.value) {
              year1Expenses += event.value;
            } else if (event.type === "expense_change" && event.value) {
              year1Expenses = event.value;
            } else if (event.type === "salary_raise" && event.value) {
              year1Income += year1Income * (event.value / 100);
            } else if (event.type === "side_hustle" && event.value) {
              year1Income += event.value;
            } else if (event.type === "geographic_relocation" && event.value) {
              year1Expenses = year1Expenses * (1 + event.value / 100);
            } else if (event.type === "downsizing" && event.value) {
              year1Expenses = year1Expenses * (1 - event.value / 100);
            } else if (event.type === "debt_payoff" && event.value) {
              year1Expenses -= event.value;
            }
          }
        });

        const annualSavings = year1Income - year1Expenses;
        const savingsRate = (annualSavings / year1Income) * 100;

        return (
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Earliest Retirement</p>
                <p className="text-2xl font-bold">
                  {earliestRetirement ? `${earliestRetirement} years` : "Not possible"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {earliestScenario ? `In ${earliestScenario}` : "No scenario meets goal"}
                </p>
              </div>
              <div className="p-4 bg-white rounded border-l-4 border-gray-500">
                <p className="text-sm text-gray-600">Latest Retirement</p>
                <p className="text-2xl font-bold">
                  {latestRetirement ? `${latestRetirement} years` : "Not possible"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {latestScenario ? `In ${latestScenario}` : "No scenario meets goal"}
                </p>
              </div>
              <div className="p-4 bg-white rounded border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Annual Savings</p>
                <p className="text-2xl font-bold">
                  {currencySymbols[currency]}{annualSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {savingsRate.toFixed(0)}% of income
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

/* Reusable Input Component */
function Input({
  label,
  value,
  onChange,
  min = 0,
  max = 1000000000,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="mt-1 w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}