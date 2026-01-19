"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import PageContainer from "../component/layout/PageContainer";

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

  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
  const stored = sessionStorage.getItem("roundData");

  if (!stored) {
    router.push("/");
    return;
  }

  setData(JSON.parse(stored));
  }, [router]);

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
    <PageContainer >
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
      <div >
        <div className="space-y-4 mt-4">

        {!user && !loading && (
          <button
            className="w-full py-4 border rounded-md font-bold"
            onClick={signInWithGoogle}
          >
            <img
              src="/googlelogo1.png"
              alt="google"
              className="inline-block w-6 h-6 mr-2 rounded-full align-middle"
            />
            Sign in to save this round
          </button>
        )}

        {user && (
          <button
            disabled={saving}
            className="w-full py-4 border rounded-md font-bold"
            onClick={async () => {
              if (!data) return;

              setSaving(true);

              const { data: round, error } = await supabase
                .from("rounds")
                .insert({
                  user_id: user.id,
                  course_name: data.course,
                  total_holes: data.totalHoles,
                  start_time: new Date(data.startTime).toISOString(),
                  end_time: new Date(data.endTime).toISOString(),
                })
                .select()
                .single();

              if (error || !round) {
                alert("Failed to save round");
                setSaving(false);
                return;
              }

              const rows: any[] = [];

              data.scores.forEach((holeScores, h) => {
                holeScores.forEach((s, i) => {
                  if (s !== null) {
                    rows.push({
                      round_id: round.id,
                      hole_number: h + 1,
                      par: data.pars[h],
                      golfer_name: data.players[i],
                      strokes: s,
                    });
                  }
                });
              });

              await supabase.from("scores").insert(rows);

              sessionStorage.removeItem("roundData");

              router.push(`/fullScore?roundId=${round.id}`);
            }}
          >
            {saving ? "Saving..." : "Save round to account"}
          </button>
        )}

        <button
        className="w-full py-4 border rounded-md font-bold"
        onClick={() => router.push("/fullScore")}
         > FULL SCORECARD
        </button>

        {!user ? (
          <button
            className="w-full py-4 border rounded-md font-bold border-black bg-red-500 text-white"
            onClick={async () => {
              const ok = window.confirm("Permanently delete this round?");
              if (!ok) return;

              sessionStorage.removeItem("roundData");
              router.push("/");
            }}
          >
            NEW ROUND
          </button>
        ) : (
          <button
            className="w-full py-4 border rounded-md font-bold border-red-500 text-red-500"
            onClick={() => router.push("/")}
          >
            NEW ROUND
          </button>
        )}
      </div>
      </div>
    </PageContainer>
  );
}
