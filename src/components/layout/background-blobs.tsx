export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Red blob - top left */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-red blur-[80px] opacity-35 -top-[150px] -left-[100px] animate-drift"
        style={{ animationDelay: "0s" }}
      />
      {/* Blue blob - bottom right */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full bg-blue blur-[80px] opacity-35 -bottom-[100px] -right-[80px] animate-drift"
        style={{ animationDelay: "-4s" }}
      />
      {/* Teal blob - center */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full bg-teal blur-[80px] opacity-35 top-[40%] left-1/2 animate-drift"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
