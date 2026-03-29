"use client";

import { ScenarioResult } from "@/types/index";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Currency = "USD" | "INR" | "EUR" | "GBP";

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

interface NetWorthChartProps {
  scenarios: ScenarioResult[];
  currency: Currency;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export default function NetWorthChart({ scenarios, currency }: NetWorthChartProps) {
  // Combine all scenarios into a single dataset
  const maxYears = Math.max(...scenarios.map((s) => s.netWorth.length));

  const formatLargeNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const chartData = Array.from({ length: maxYears }).map((_, yearIndex) => {
    const dataPoint: any = { year: yearIndex + 1 };

    scenarios.forEach((scenario) => {
      dataPoint[scenario.scenario] = Math.round(scenario.netWorth[yearIndex] || 0);
    });

    // Add contributions only once (same for all scenarios)
    if (scenarios.length > 0) {
      dataPoint["Contributions"] = Math.round(scenarios[0].contributions[yearIndex] || 0);
    }

    return dataPoint;
  });

  return (
    <div className="mt-6">
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: "Year", position: "insideBottom", offset: -5 }}
            />
            <YAxis tickFormatter={(value) => `${currencySymbols[currency]}${formatLargeNumber(value)}`} />
            <Tooltip
              formatter={(value: any) => `${currencySymbols[currency]}${value.toLocaleString('en-US')}`}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            {/* Net Worth lines - one per scenario */}
            {scenarios.map((scenario, idx) => (
              <Line
                key={scenario.scenario}
                type="monotone"
                dataKey={scenario.scenario}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
                name={scenario.scenario}
              />
            ))}
            {/* Contributions line - single for all scenarios */}
            <Line
              type="monotone"
              dataKey="Contributions"
              stroke="#6b7280"
              strokeWidth={1}
              strokeDasharray="5 5"
              strokeOpacity={0.7}
              dot={false}
              connectNulls
              name="Your Contributions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Retirement Milestone Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario, idx) => (
          <div
            key={scenario.scenario}
            className="p-4 border rounded"
            style={{ borderLeftColor: COLORS[idx % COLORS.length], borderLeftWidth: 4 }}
          >
            <h3 className="font-semibold text-sm">{scenario.scenario}</h3>
            <p className="text-xl font-bold mt-2">
              {currencySymbols[currency]}{(scenario.maxNetWorth).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            {scenario.retirementYear ? (
              <p className="text-sm text-green-600 mt-1">
                Can retire in: <span className="font-semibold">{scenario.retirementYear} years</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 mt-1">Target not reached</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}