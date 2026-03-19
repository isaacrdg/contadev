function StarMark({ bg }: { bg: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.5 0C6.5 3.59 3.59 6.5 0 6.5C3.59 6.5 6.5 9.41 6.5 13C6.5 9.41 9.41 6.5 13 6.5C9.41 6.5 6.5 3.59 6.5 0Z"
        fill={bg}
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="0.6"
      />
    </svg>
  );
}

export default function SectionDivider({ cross, bg = "#191919" }: { cross?: "left" | "right" | "both"; bg?: string }) {
  const hasLeft = cross === "left" || cross === "both";
  const hasRight = cross === "right" || cross === "both";

  return (
    <div className="relative max-w-[1100px] mx-auto flex items-center" style={{ height: "1px", zIndex: 999, position: "relative" }}>
      {hasLeft && (
        <div className="absolute -left-[10px] -top-[10px] z-10">
          <StarMark bg={bg} />
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.06)",
          marginLeft: hasLeft ? "10px" : "0",
          marginRight: hasRight ? "10px" : "0",
        }}
      />

      {hasRight && (
        <div className="absolute -right-[10px] -top-[10px] z-10">
          <StarMark bg={bg} />
        </div>
      )}
    </div>
  );
}
