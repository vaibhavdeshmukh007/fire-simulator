"use client";

import { useState } from "react";
import { LifeEvent, EventType } from "@/types";

type Currency = "USD" | "INR" | "EUR" | "GBP";

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

const EVENT_DETAILS: Record<EventType, { label: string; description: string; inputLabel: string; unit: string }> = {
  job_change: { label: "Job Switch", description: "Change to a new job with different income", inputLabel: "New annual income", unit: "currency" },
  child_born: { label: "Child Born", description: "Add annual expenses for a new child", inputLabel: "Annual child expenses", unit: "currency" },
  expense_change: { label: "Expense Change", description: "Adjust total yearly expenses", inputLabel: "New total annual expenses", unit: "currency" },
  salary_raise: { label: "Salary Raise", description: "Get a percentage raise on current income", inputLabel: "Raise percentage", unit: "percent" },
  bonus_windfall: { label: "Bonus/Windfall", description: "One-time money (inheritance, tax return, etc.)", inputLabel: "Amount", unit: "currency" },
  career_break: { label: "Career Break", description: "Take time off work (sabbatical, education, layoff)", inputLabel: "Duration (years)", unit: "years" },
  side_hustle: { label: "Side Hustle", description: "Start earning additional income", inputLabel: "Annual side income", unit: "currency" },
  home_purchase: { label: "Home Purchase", description: "Buy a home (down payment & closing costs)", inputLabel: "Total amount", unit: "currency" },
  vehicle_purchase: { label: "Vehicle Purchase", description: "Buy a car or vehicle", inputLabel: "Vehicle cost", unit: "currency" },
  education_tuition: { label: "Education/Tuition", description: "Pay for education (yours or children's)", inputLabel: "Tuition/education cost", unit: "currency" },
  healthcare_event: { label: "Healthcare Event", description: "Major medical expense not covered by insurance", inputLabel: "Medical expense", unit: "currency" },
  home_renovation: { label: "Home Renovation", description: "Home improvement or renovation costs", inputLabel: "Renovation cost", unit: "currency" },
  retirement: { label: "Retirement", description: "Start drawing from portfolio (4% rule default)", inputLabel: "Custom withdrawal rate % (optional)", unit: "percent" },
  geographic_relocation: { label: "Geographic Relocation", description: "Move to area with different cost of living", inputLabel: "Expense change %", unit: "percent" },
  downsizing: { label: "Downsizing", description: "Move to cheaper home, reduce expenses", inputLabel: "Expense reduction %", unit: "percent" },
  inflation_adjustment: { label: "Inflation Adjustment", description: "Apply annual inflation to expenses", inputLabel: "Annual inflation %", unit: "percent" },
  debt_payoff: { label: "Debt Payoff", description: "Pay off debt (reduces monthly expenses)", inputLabel: "Expense reduction", unit: "currency" },
  market_downturn: { label: "Market Downturn", description: "Temporary market decline affecting returns", inputLabel: "Return reduction %", unit: "percent" },
  investment_allocation_change: { label: "Investment Reallocation", description: "Change portfolio allocation (affects return rate)", inputLabel: "New return rate %", unit: "percent" },
};

interface LifeEventsFormProps {
  onEventsChange: (events: LifeEvent[]) => void;
  currency: Currency;
}

export default function LifeEventsForm({ onEventsChange, currency }: LifeEventsFormProps) {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [eventType, setEventType] = useState<EventType>("job_change");
  const [year, setYear] = useState(5);
  const [value, setValue] = useState(100000);

  const handleAddEvent = () => {
    const newEvent: LifeEvent = {
      year,
      type: eventType,
      value,
      description: getEventDescription(eventType, value, year),
    };

    const updated = [...events, newEvent].sort((a, b) => a.year - b.year);
    setEvents(updated);
    onEventsChange(updated);
    // Reset form
    setValue(100000);
  };

  const handleRemoveEvent = (index: number) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    onEventsChange(updated);
  };

  const getEventDescription = (type: EventType, value: number, year: number): string => {
    const symbol = currencySymbols[currency];
    const detail = EVENT_DETAILS[type];

    switch (type) {
      case "job_change":
        return `Year ${year}: New job - ${symbol}${value.toLocaleString('en-US')}/year`;
      case "child_born":
        return `Year ${year}: Child born (+${symbol}${value.toLocaleString('en-US')}/year)`;
      case "expense_change":
        return `Year ${year}: Expenses change to ${symbol}${value.toLocaleString('en-US')}/year`;
      case "salary_raise":
        return `Year ${year}: ${value}% salary raise`;
      case "bonus_windfall":
        return `Year ${year}: Bonus/windfall of ${symbol}${value.toLocaleString('en-US')}`;
      case "career_break":
        return `Year ${year}: Career break for ${value} year(s)`;
      case "side_hustle":
        return `Year ${year}: Start side hustle - ${symbol}${value.toLocaleString('en-US')}/year`;
      case "home_purchase":
        return `Year ${year}: Home purchase - ${symbol}${value.toLocaleString('en-US')}`;
      case "vehicle_purchase":
        return `Year ${year}: Vehicle purchase - ${symbol}${value.toLocaleString('en-US')}`;
      case "education_tuition":
        return `Year ${year}: Education costs - ${symbol}${value.toLocaleString('en-US')}`;
      case "healthcare_event":
        return `Year ${year}: Healthcare expense - ${symbol}${value.toLocaleString('en-US')}`;
      case "home_renovation":
        return `Year ${year}: Home renovation - ${symbol}${value.toLocaleString('en-US')}`;
      case "retirement":
        return `Year ${year}: Retire${value ? ` (${value}% withdrawal rate)` : " (4% default)"}`;
      case "geographic_relocation":
        return `Year ${year}: Relocate (expenses ${value > 0 ? "+" : ""}${value}%)`;
      case "downsizing":
        return `Year ${year}: Downsize (reduce expenses by ${value}%)`;
      case "inflation_adjustment":
        return `Year ${year}: Apply ${value}% annual inflation`;
      case "debt_payoff":
        return `Year ${year}: Pay off debt (save ${symbol}${value.toLocaleString('en-US')}/year)`;
      case "market_downturn":
        return `Year ${year}: Market downturn (return -${value}%)`;
      case "investment_allocation_change":
        return `Year ${year}: Change allocation to ${value}% return`;
      default:
        return "";
    }
  };

  const detail = EVENT_DETAILS[eventType];
  const eventTypeKeys = Object.keys(EVENT_DETAILS) as EventType[];

  return (
    <div className="mt-0 p-0">
      <h3 className="text-lg font-semibold mb-4">Life Events</h3>

      <div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Event Type</label>
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value as EventType);
              setValue(100000); // Reset value on type change
            }}
            className="mt-1 w-full border rounded p-2 text-sm"
          >
            {eventTypeKeys.map((type) => (
              <option key={type} value={type}>
                {EVENT_DETAILS[type].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">{detail.description}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 w-full border rounded p-2"
            min="1"
            max="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            {detail.inputLabel}
            {detail.unit === "currency" && ` (${currencySymbols[currency]})`}
            {detail.unit === "percent" && " (%)"}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="mt-1 w-full border rounded p-2"
            min={detail.unit === "percent" ? -100 : 0}
            step={detail.unit === "percent" ? 0.1 : 1}
          />
        </div>

        <button
          onClick={handleAddEvent}
          className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 font-medium"
        >
          Add Event
        </button>
      </div>

      {events.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Scheduled Events ({events.length}):</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event, idx) => (
              <div key={idx} className="bg-white p-3 rounded flex justify-between items-start border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{EVENT_DETAILS[event.type].label}</p>
                </div>
                <button
                  onClick={() => handleRemoveEvent(idx)}
                  className="text-red-600 hover:text-red-800 text-sm ml-2 whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

