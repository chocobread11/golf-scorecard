import { Suspense } from "react";
import FullScoreClient from "./fullScore-client";

export default function FullScorePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading scorecard…</p>
        </main>
      }
    >
      <FullScoreClient />
    </Suspense>
  );
}
