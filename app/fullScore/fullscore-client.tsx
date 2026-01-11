"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { useRef } from "react";
import { getRoundDateInfo } from "@/lib/date";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft } from "lucide-react";
import { Download } from "lucide-react";

type RoundData = {
  course: string;
  totalHoles: number;
  players: string[];
  pars: number[];
  scores: (number | null)[][];
  startTime: number;
  endTime: number;
};

function ScoreBadge({
  score,
  par,
}: {
  score: number | null;
  par: number;
}) {
  if (score === null) return <span className="text-gray-700">-</span>;

  const diff = score - par;

  const base =
  "inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-gray-900 dark:text-gray-100";

  if (diff === -1) {
    return (
      <span
        className={`${base} outline-2 rounded-full`}
      >
        {score}
      </span>
    );
  }
  if (diff === 1) {
    return (
      <span
        className={`${base} outline-2`}
      >
        {score}
      </span>
    );
  }
  if (diff === -2) {
    return (
      <span
        className={`${base} border-2 rounded-full outline-2 outline-offset-1 `}
      >
        {score}
      </span>
    );
  }
  if (diff === 2) {
    return (
      <span
        className={`${base} border-2 outline-2 outline-offset-1`}
      >
        {score}
      </span>
    );
  }
  if (diff > 2) {
    return (
      <span
        className={`${base} text-red-600`}
      >
        {score}
      </span>
    );
  }

  return <span className={`${base}`}>{score}</span>;
}

export default function FullScorePage() {
  const router = useRouter();
  const [data, setData] = useState<RoundData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const cellClass ="px-2 py-2 text-center font-medium text-gray-900 dark:text-gray-100";// consistent cell styling

  const searchParams = useSearchParams();
  const roundId = searchParams.get("roundId");

  useEffect(() => {
  const load = async () => {
    // CASE 1: DB round
    if (roundId) {
      await fetchFromDatabase(roundId);
      return;
    }

    // CASE 2: sessionStorage round
    const stored = sessionStorage.getItem("roundData");
    if (!stored) {
      router.push("/");
      return;
    }

    setData(JSON.parse(stored));
  };

  load();
}, [roundId, router]);

  const fetchFromDatabase = async (roundId: string) => {
    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      router.push("/");
      return;
    }

    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("*")
      .eq("round_id", roundId)
      .order("hole_number");

    if (scoresError || !scores) return;

    const players = Array.from(new Set(scores.map(s => s.golfer_name)));

    const pars: number[] = [];
    const scoreGrid = Array.from(
      { length: round.total_holes },
      () => players.map(() => null)
    );

    scores.forEach((s) => {
      const h = s.hole_number - 1;
      const p = players.indexOf(s.golfer_name);
      pars[h] = s.par;
      scoreGrid[h][p] = s.strokes;
    });

    setData({
      course: round.course_name,
      totalHoles: round.total_holes,
      players,
      pars,
      scores: scoreGrid,
      startTime: new Date(round.start_time).getTime(),
      endTime: new Date(round.end_time).getTime(),
    });
  };

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-700">Loading scorecard…</p>
      </main>
    );
  }

  const roundDate = getRoundDateInfo(data.startTime);

  // Totals per player
  const playerTotals = data.players.map((_, i) =>
    data.scores.reduce(
      (sum, hole) => sum + (hole[i] ?? 0),
      0
    )
  );

  const parTotal = data.pars.reduce((a, b) => a + b, 0);

  const exportAsImage = async () => {
  if (!cardRef.current) return;

  const dataUrl = await toPng(cardRef.current, {
    cacheBust: true,
    pixelRatio: 2, // sharper
    style: {
      width: "390px",  // 9:16 phone width
      height: "780px", // 9:16 phone height
    },
  });

  const link = document.createElement("a");
  link.download = "golf-scorecard.png";
  link.href = dataUrl;
  link.click();
  };

  return (
    <main className="min-h-screen py-6 select-none">
      {/* HEADER */}
        <div className="flex justify-between items-center mb-2 px-4">
          <button
          onClick={() => {
            if (roundId) router.push(`/summary?roundId=${roundId}`);
            else router.push("/summary");
          }}
          className="p-2">
          <ChevronLeft size={30} /> 
          </button>
        <button
        onClick={exportAsImage}
        className="px-3 py-2 font-semibold active:bg-gray-100"
        >
        <Download size={26} className="" />
        </button>
        </div>
      
      {/* FULL IMAGE SCORECARD */}
      <div ref={cardRef} className="px-4 pb-4">
        <div className="mb-4">
           <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
          Full Scorecard
        </h1>
        <p className="py-2 text-center font-semibold text-xl text-gray-500">
          {data.course}
        </p>
        <p className="text-sm text-center text-gray-500 font-light">
          {roundDate.day}, {roundDate.date}
        </p>
        </div>

      {/* SCORE TABLE */}
      <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
        <table className="w-full table-fixed text-sm border-collapse">
          <thead className="bg-slate-500 text-white sticky top-0 z-10">
            <tr>
              <th className={cellClass}>Hole</th>
              <th className={cellClass}>Par</th>
              {data.players.map((p) => (
                <th
                  key={p}
                  className={cellClass}
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: data.totalHoles }).map((_, h) => (
              <tr key={h} className="border-t border-gray-300 dark:border-gray-600">
                <td className={cellClass}>{h + 1}</td>
                <td className={cellClass}>{data.pars[h]}</td>

                {data.players.map((_, i) => {
                  const s = data.scores[h][i];
                  const diff =
                    typeof s === "number"
                      ? s - data.pars[h]
                      : null;

                   return (
                    <td key={`${h}-${i}`} className={cellClass}>
                      <ScoreBadge score={s} par={data.pars[h]} />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* TOTAL ROW */}
            <tr className="border-t bg-gray-50 dark:bg-gray-600 font-bold">
              <td className={cellClass}>TOTAL</td>
              <td className={cellClass}>{parTotal}</td>
              {playerTotals.map((t, i) => (
                <td key={i} className={cellClass}>
                  {t}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>          
      {/* FOOTER ACTIONS */}
      <div className="mt-2 flex gap-4 px-4">
        <button
          onClick={() => router.push(`/summary?roundId=${roundId}`)}
          className="flex-1 py-3 border rounded-lg font-semibold"
        >
          Summary
        </button>
      </div>
    </main>
  );
}
