/** Two funnels meeting at a pinch — the bottleneck — in a black rounded tile. */
export default function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[9px] bg-ink text-white ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16l-5.5 7v6L9.5 20v-9L4 4z" fill="currentColor" />
      </svg>
    </span>
  );
}
