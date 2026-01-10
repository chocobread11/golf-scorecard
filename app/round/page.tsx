import { Suspense } from "react";
import RoundClient from "./round-client";

export default function RoundPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading round…</p>
        </main>
      }
    >
      <RoundClient />
    </Suspense>
  );
}
