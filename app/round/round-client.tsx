"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { FlagTriangleRight } from "lucide-react";
import PageContainer from "../component/layout/PageContainer";

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
  const [pars, setPars] = useState<number[]>(() => Array(totalHoles).fill(4));
  const [scores, setScores] = useState<(number | null)[][]>(() =>
  Array.from({ length: totalHoles }, () => Array(4).fill(null)));

  // EDITING STATE
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editingPar, setEditingPar] = useState(false);

  /* ---------------- SETUP SCREEN ---------------- */
  if (!roundStarted) {
    return (
      <PageContainer>
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
          className="w-full mt-10 py-4 text-lg font-bold border border-gray-300
                     rounded-md active:bg-gray-100"
          onClick={() => {
            if (!course.trim()) {
              alert("Please enter course name");
              return;
            }
            if (!players.some(p => p.trim())) {
              alert("Enter at least one player");
              return;
            }
              const start = Date.now();
              setStartTime(start);
              setRoundStarted(true);
            }}
        >
          START ROUND
        </button>
      </PageContainer>
    );
  }

  /* ---------------- PLAY SCREEN ---------------- */

  const holeIndex = currentHole - 1;

  return (
    <PageContainer>
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

      {/* PAR SELECTOR */}
      <div className="flex justify-center text-center mb-4">
        <p className="font-semibold text-3xl px-2">PAR</p>
        {editingPar ? (
          <input
            type="number"
            inputMode="numeric"
            autoFocus
            min={3}
            max={6}
            className="text-3xl font-semibold text-center border rounded w-24"
            value={pars[holeIndex]}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) {
                const next = [...pars];
                next[holeIndex] = v;
                setPars(next);
              }
            }}
            onBlur={() => setEditingPar(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingPar(false);
            }}
          />
        ) : (
          <button
            onClick={() => setEditingPar(true)}
            className="text-3xl font-semibold inline-flex items-center gap-1"
          >
            {pars[holeIndex]}
            <ChevronDown size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      
      {/* SCORES */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {players.map((name, i) => {
          if (!name) return null; // skip empty slots but keep index alignment

          return (
            <div
              key={i}
              className="flex justify-between items-center text-2xl font-semibold"
            >
              <span>{name.toUpperCase()}</span>

              {editingPlayer === i ? (
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  className="w-20 text-4xl text-center border rounded"
                  value={scores[holeIndex][i] ?? ""}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) {
                      const next = [...scores];
                      next[holeIndex][i] = v;
                      setScores(next);
                    }
                  }}
                  onBlur={() => setEditingPlayer(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingPlayer(null);
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingPlayer(i)}
                  className="text-4xl min-w-12 text-center"
                >
                  {scores[holeIndex][i] ?? "-"}
                </button>
              )}
            </div>
          );
        })}
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

              //save only non-empty players and their scores
              const filteredPlayers = players
              .map(p => p.trim())
              .filter(p => p.length > 0);

              const filteredScores = scores.map(hole =>
              hole.filter((_, i) => players[i]?.trim())
              );

              const payload = {
                course,
                totalHoles,
                players: filteredPlayers,
                pars,
                scores: filteredScores,
                startTime: startTime ?? end,
                endTime: end,
              };

              console.log("Saving roundData:", payload);
              sessionStorage.setItem("roundData", JSON.stringify(payload));
              router.push(`/summary`);
            }}  
          > END
          <FlagTriangleRight size={26} className="mt-1" />
          </button>
        )}
        </div>
    </PageContainer>
  );
}
