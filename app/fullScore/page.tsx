"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { useRef } from "react";


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
  if (score === null) return <span className="text-gray-400">-</span>;

  const diff = score - par;

  const base =
    "inline-flex items-center justify-center w-8 h-8 text-sm font-bold";

  if (diff === -1) {
    return (
      <span
        className={`${base} border-2 rounded-full`}
      >
        {score}
      </span>
    );
  }
  if (diff === 1) {
    return (
      <span
        className={`${base} border-2`}
      >
        {score}
      </span>
    );
  }
  if (diff === -2) {
    return (
      <span
        className={`${base} border-2 rounded-full outline-2 outline-offset-2 `}
      >
        {score}
      </span>
    );
  }
  if (diff === 2) {
    return (
      <span
        className={`${base} border-2 outline-2 outline-offset-2`}
      >
        {score}
      </span>
    );
  }

  return <span className="font-semibold">{score}</span>;
}


export default function FullScorePage() {
  const router = useRouter();
  const [data, setData] = useState<RoundData | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("roundData");
    if (!raw) {
      router.push("/");
      return;
    }
    setData(JSON.parse(raw));
  }, [router]);

  if (!data) return null;

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
    backgroundColor: "#ffffff",
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
          onClick={() => router.push("/summary")}
          className="text-sm text-gray-500 mb-2"
        >
          ← Back
        </button>
        <button
        onClick={exportAsImage}
        className="text-sm px-3 py-2 font-semibold active:bg-gray-100"
        >
          Save Image
        </button>
        </div>
      
      {/* FULL IMAGE SCORECARD */}
      <div ref={cardRef} className="px-4 py-4">
        <div className="mb-4">
           <h1 className="text-2xl font-bold text-center">
          Full Scorecard
        </h1>
        <p className="text-center text-gray-500">
          {data.course}
        </p>

        </div>

      {/* SCORE TABLE */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-center">Hole</th>
              <th className="p-2 text-center">Par</th>
              {data.players.map((p) => (
                <th
                  key={p}
                  className="p-2 text-center whitespace-nowrap"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: data.totalHoles }).map((_, h) => (
              <tr key={h} className="border-t">
                <td className="p-2 text-center">{h + 1}</td>
                <td className="p-2 text-center">{data.pars[h]}</td>

                {data.players.map((_, i) => {
                  const s = data.scores[h][i];
                  const diff =
                    typeof s === "number"
                      ? s - data.pars[h]
                      : null;

                  return (
                    <td className="p-2 text-center">
                      <ScoreBadge score={s} par={data.pars[h]} />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* TOTAL ROW */}
            <tr className="border-t bg-gray-50 font-bold">
              <td className="p-2">TOTAL</td>
              <td className="p-2">{parTotal}</td>
              {playerTotals.map((t, i) => (
                <td key={i} className="p-2 text-center">
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
          onClick={() => router.push("/summary")}
          className="flex-1 py-3 border rounded-lg font-semibold"
        >
          Summary
        </button>
      </div>
    </main>
  );
}
