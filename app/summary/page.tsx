"use client";

import { useEffect, useState } from "react";
import { toPng } from "html-to-image";
import { useRef } from "react";


type RoundData = {
  course: string;
  totalHoles: number;
  players: string[];
  pars: number[];
  scores: number[][];
  startTime: number;
  endTime: number;
};

// Helper to format duration
function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m`;
}


export default function SummaryPage() {
  const [data, setData] = useState<RoundData | null>(null);

  const scorecardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("roundData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

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
      <h1 className="text-2xl font-semibold mb-4 text-center">Summary</h1>

       <div>
        {/* ROUND INFO */}
        <div className="border rounded-md p-4 mb-6">
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
        <div className="border rounded-md p-4">
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
            >
            EXPORT FULL SCORECARD (notfunctional yet)
        </button>


        <button
        className="w-full py-4 text-red-600 border rounded-md"
        onClick={() => {
            const ok = window.confirm(
            "Delete this round and reset all scores?"
            );

            if (!ok) return;

            sessionStorage.removeItem("roundData");
            window.location.href = "/";
        }}
        >
        DELETE ROUND & RESET
        </button>
      </div>
    </main>
  );
}
