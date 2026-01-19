export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-md min-w-sm px-6">
        {children}
      </div>
    </main>
  );
}
