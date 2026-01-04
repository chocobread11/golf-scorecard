import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen flex flex-col justify-center px-6 select-none">
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
      <div className="flex flex-col justify-center mt-12">
        <p className="text-3xl font-bold text-center">History</p>
        <p className="text-sm font-semibold underline text-center">sign in to save</p>

        <button className="mt-4 mx-4 py-2 px-4 border border-gray-300 rounded-md">
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
