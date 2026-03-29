import { simulate } from "@/lib/simulation";

export default function Home() {
  const data = simulate({
    years: 30,
    yearlyIncome: 1000000,
    yearlyExpenses: 500000,
    returnRate: 0.08, 
  });

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">FIRE Simulator</h1>

      <div className="mt-6">
        <h2 className="text-xl">Net Worth Projection</h2>
        <pre className="mt-4 bg-gray-100 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </main>
  );
}