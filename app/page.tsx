"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getRoundDateInfo } from "@/lib/date";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [rounds, setRounds] = useState<any[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  useEffect(() => {
  if (!user) {
    setRounds([]);
    return;
  }

  const fetchRounds = async () => {
    setLoadingRounds(true);

    const { data, error } = await supabase
      .from("rounds")
      .select("id, course_name, total_holes, start_time")
      .eq("user_id", user.id)
      .order("start_time", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Failed to fetch rounds:", error);
    } else {
      setRounds(data ?? []);
    }

    setLoadingRounds(false);
  };

  fetchRounds();
}, [user]);


  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <main className="h-screen flex flex-col px-6 select-none">

      <div className="pt-8">
      <h1 className="text-8xl font-semibold text-center mb-10">
        Start a Round
      </h1>
      <div className="flex justify-center gap-4 mt-6">
        <Link
          href="/round?holes=9"
          className="w-32 h-20 flex items-center justify-center
                     text-xl font-bold border border-gray-300
                     rounded-md active:bg-gray-100"
        >
          9 HOLES
        </Link>

        <Link
          href="/round?holes=18"
          className="w-32 h-20 flex items-center justify-center
                     text-xl font-bold border border-gray-300
                     rounded-md active:bg-gray-100"
        >
          18 HOLES
        </Link>
      </div>
      </div>

      <div className="flex flex-col mt-12 flex-1 overflow-hidden">
        <p className="text-3xl font-bold text-center">History</p>
        <div className="mt-4 flex-1 overflow-y-auto space-y-3">

        {!user && (
          <p className="text-sm font-semibold underline text-center mb-4">
            sign in to save
          </p>
        )}

        {!user ? (
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 border rounded-lg font-semibold"
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2 text-center">
              Signed in as <b>{user.email}</b>
            </p>

            <button
              onClick={signOut}
              className="w-full py-2 border rounded-lg font-semibold mb-4"
            >
              Sign out
            </button>

            {loadingRounds && (
              <p className="text-center text-gray-400">Loading rounds…</p>
            )}

            {!loadingRounds && rounds.length === 0 && (
              <p className="text-center text-gray-400">
                No rounds saved yet
              </p>
            )}

            <div className="space-y-3">
              {rounds.map((round) => {
                const date = getRoundDateInfo(
                  new Date(round.start_time).getTime()
                );

                return (
                  <div
                      key={round.id}
                      onClick={() => router.push(`/fullScore?roundId=${round.id}`)}
                      className="border rounded-lg px-4 py-3 cursor-pointer active:bg-gray-100"
                    >
                    <p className="font-semibold">
                      {round.course_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {round.total_holes} holes ·{" "}
                      {date.day}, {date.date}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      </div>
    </main>
  );
}
