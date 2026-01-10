"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function SummaryPage() {
  const [data, setData] = useState<RoundData | null>(null);

  type RoundData = {
  course: string;
  totalHoles: number;
  players: string[];
  pars: number[];
  scores: number[][];
  startTime: number;
  endTime: number;
  };

  const router = useRouter(); 

  const searchParams = useSearchParams();
  const roundId = searchParams.get("roundId");

  useEffect(() => {
  if (!roundId) {
    router.push("/");
    return;
  }

  const fetchSummary = async () => {
    // fetch round + scores from DB (same logic as FullScore)
    // OR temporarily fetch from sessionStorage IF YOU MUST
    const stored = sessionStorage.getItem("roundData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  };

  fetchSummary();
  }, [roundId, router]);

  if (!data) {
    return (
      <main className="h-screen flex items-center justify-center">
        <p className="text-gray-500">No round data</p>
      </main>
    );
  }

  const totals = data.players.map((_, i) =>
    data.scores.reduce((sum, hole) => sum + (hole[i] ?? 0), 0)
  );

  const parTotal = data.pars.reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen px-6 py-4">
      <h1 className=" text-2xl font-semibold mb-2 text-center">Summary</h1>
    
       <div>
        {/* ROUND INFO */}
        <div className="p-4 mb-2">
            <p className="text-sm text-gray-500">Course</p>
            <p className="text-lg font-semibold">{data.course}</p>

            <p className="text-sm text-gray-500 mt-2">Holes</p>
            <p className="text-lg">{data.totalHoles}</p>

            <p className="text-sm text-gray-500 mt-2">Time</p>
            <p className="text-lg">
            {new Date(data.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
            {" – "}
            {new Date(data.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
            </p>
        </div>

        {/* SCORES */}
        <div className="py-4 px-4">
            <p className="text-sm text-gray-500 mb-4">Scores</p>

            <div className="space-y-3">
            {data.players.map((name, i) => (
                <div
                key={i}
                className="flex justify-between text-lg font-semibold"
                >
                <span>{name}</span>
                <span>
                    {totals[i]} ({totals[i] - parTotal >= 0 ? "+" : ""}
                    {totals[i] - parTotal})
                </span>
                </div>
            ))}
            </div>
        </div>
        </div>

      {/* ACTIONS */}
      <div className="space-y-4 mt-4">
        <button
          className="w-full py-4 border rounded-md font-bold"
          onClick={() => router.push(`/fullScore?roundId=${roundId}`)}
        >
          VIEW FULL SCORECARD
        </button>
        <button
          className="w-full py-4 border rounded-md font-bold border-red-500 text-red-500"
          onClick={() => router.push("/")}
        >
          NEW ROUND
        </button>
      </div>
    </main>
  );
}
