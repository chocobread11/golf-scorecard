"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { FlagTriangleRight } from "lucide-react";

export default function RoundPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const totalHoles = Number(searchParams.get("holes")) || 18;
  
  // TIMING STATE
  const [startTime, setStartTime] = useState<number | null>(null);

  // SETUP STATE
  const [roundStarted, setRoundStarted] = useState(false);
  const [course, setCourse] = useState("");
  const [players, setPlayers] = useState(["", "", "", ""]);

  // PLAY STATE
  const [currentHole, setCurrentHole] = useState(1);
  const [pars, setPars] = useState(Array(totalHoles).fill(4));
  const [scores, setScores] = useState(
    Array.from({ length: totalHoles }, () => Array(4).fill(null))
  );

  const activePlayers = players.filter(Boolean);

  /* ---------------- SETUP SCREEN ---------------- */
  if (!roundStarted) {
    return (
      <main className="h-screen flex flex-col justify-center px-6 select-none">
        
        <div>
            <button
                onClick={() => router.push("/")}
                className="mb-6 text-sm text-gray-500"
                ><ChevronLeft size={30} /> 
                </button>
        <h1 className="text-2xl font-semibold text-center mb-10">
          Round Setup
        </h1>
        </div>

        <div className="mb-8">
          <label className="block text-sm text-gray-500 mb-2">
            Course
          </label>
          <input
            className="w-full text-lg py-3 border-b border-gray-300
                       focus:outline-none focus:border-black select-text"
            placeholder="Enter course name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>

        <div className="space-y-4 mb-10">
          <p className="text-sm text-gray-500">Players</p>

          {players.map((p, i) => (
            <input
              key={i}
              className="w-full text-lg py-3 border-b border-gray-200
                         focus:outline-none focus:border-black select-text"
              placeholder={`Golfer ${i + 1}`}
              value={p}
              onChange={(e) => {
                const next = [...players];
                next[i] = e.target.value;
                setPlayers(next);
              }}
            />
          ))}
        </div>

        <button
          className="w-full py-4 text-lg font-bold border border-gray-300
                     rounded-md active:bg-gray-100"
          onClick={() => {
                const start = Date.now();
                setStartTime(start);
                setRoundStarted(true);
            }}
        >
          START ROUND
        </button>
      </main>
    );
  }

  /* ---------------- PLAY SCREEN ---------------- */

  const holeIndex = currentHole - 1;

  return (
    <main className="h-screen flex flex-col px-6 select-none">
      {/* HEADER */}
      <div className="pt-6 mb-6 flex justify-between items-start">
        <div>
          <p className="text-xl text-gray-500 mt-4">{course}</p>
          
        </div>
        <div className="flex flex-col">
        <p className="font-bold text-xl">HOLE</p>
        <button
          className="text-4xl font-bold"
          onClick={() => {
            const next = prompt("Go to hole:");
            const n = Number(next);
            if (n >= 1 && n <= totalHoles) setCurrentHole(n);
          }}
        >
          {currentHole}
        </button>
        </div>
      </div>

      <div>
        <p className="text-3xl font-semibold text-center mb-4" 
          onClick={() => {
              const value = prompt("Par:");
              const v = Number(value);
              if (!isNaN(v)) {
                const next = [...pars];
                next[holeIndex] = v;
                setPars(next);
              }}}>PAR {pars[holeIndex]}  <ChevronDown size={20} className="inline-block -mt-1 -ml-2 text-gray-500" /></p>
              
      </div>

      {/* SCORES */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {activePlayers.map((name, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-2xl font-semibold"
            onClick={() => {
              const value = prompt("Score:");
              const v = Number(value);
              if (!isNaN(v)) {
                const next = [...scores];
                next[holeIndex][i] = v;
                setScores(next);
              }
            }}
          >
            <span>{name.toUpperCase()}</span>
            <span className="text-4xl">
              {scores[holeIndex][i] ?? "-"}
            </span>
          </div>
        ))}
      </div>

      {/* NAV */}
        <div className="pb-6 flex justify-between">
            <button
                className="flex justify-center p-4 border-2 rounded-full"
                onClick=
              {() => {
                    if (currentHole === 1) {
                      setRoundStarted(false);
                    } else {
                      setCurrentHole((h) => h - 1);
                    }
                }}
            >
            <ChevronLeft size={30} />
            </button>

        {currentHole < totalHoles ? (
            <button
            className="flex justify-center p-4 border-2 rounded-full"
            onClick={() => setCurrentHole((h) => h + 1)}
            >
            <ChevronRight size={30} />
            </button>
        ) : (
            <button
            className="flex justify-center p-4 border-2 rounded-full text-2xl"
            onClick={async () => {
              const ok = window.confirm(
                "End this round and go to summary?"
              );

              if (!ok) return;

              const end = Date.now();

              sessionStorage.setItem(
                "roundData",
                JSON.stringify({
                  course,
                  totalHoles,
                  players: activePlayers,
                  pars,
                  scores,
                  startTime: startTime ?? end, // fallback safety
                  endTime: end,
                })
              );

              const {
                  data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                  alert("Please sign in to save your round");
                  return;
                }

                const { data: round, error } = await supabase
                .from("rounds")
                .insert({
                  user_id: user.id,
                  course_name: course,
                  total_holes: totalHoles,
                  start_time: new Date(startTime!).toISOString(),
                  end_time: new Date(end).toISOString(),
                })
                .select()
                .single();

                if (error?.code === "23505") {
                  console.log("Duplicate round prevented");
                }

                if (error || !round) {
                  console.error("Round insert error:", error);
                  alert("Failed to save round");
                  return;
                }

                const rows:any[] = [];

                scores.forEach((holeScores, h) => {
                  holeScores.forEach((s, i) => {
                    if (s !== null) {
                      rows.push({
                        round_id: round.id,
                        hole_number: h + 1,
                        par: pars[h],
                        golfer_name: players[i],
                        strokes: s,
                      });
                    }
                  });
                });

                await supabase.from("scores").insert(rows);

              router.push(`/summary?roundId=${round.id}`);
            }}
          > END
            <FlagTriangleRight size={26} className="mt-1" />
          </button>
        )}
        </div>

    </main>
  );
}
