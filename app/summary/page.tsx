import { Suspense } from "react";
import SummaryClient from "./summary-client";

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading summary…</p>
        </main>
      }
    >
      <SummaryClient />
    </Suspense>
  );
}
