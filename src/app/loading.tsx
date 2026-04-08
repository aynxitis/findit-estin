export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--muted)] border-t-yellow rounded-full animate-spin" />
        <p className="text-sm text-[var(--muted)] font-display">Loading...</p>
      </div>
    </div>
  );
}
