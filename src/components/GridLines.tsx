"use client";

export default function GridLines() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-[40]"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <div className="relative h-full max-w-[1100px] mx-auto">
        {/* Left vertical line */}
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: "1px",
            top: "420px",
            background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 180px, rgba(255,255,255,0.06) 100%)",
          }}
        />
        {/* Right vertical line */}
        <div
          className="absolute bottom-0 right-0"
          style={{
            width: "1px",
            top: "560px",
            background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 80px, rgba(255,255,255,0.06) 100%)",
          }}
        />
      </div>
    </div>
  );
}
