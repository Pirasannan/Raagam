import { cn } from '@/lib/cn';

const STRINGS = [
  { bottom: 72, top: 92 },
  { bottom: 90, top: 97 },
  { bottom: 110, top: 103 },
  { bottom: 128, top: 108 },
];

interface TanpuraArchProps {
  /** Index of the string just plucked by the live drone, with a counter to retrigger it. */
  pluck: { index: number; count: number } | null;
  className?: string;
}

/**
 * Arch framing a stylised tanpura. Strings shimmer on a gentle loop, and
 * vibrate for real when the drone is playing.
 */
export function TanpuraArch({ pluck, className }: TanpuraArchProps) {
  const live = pluck !== null;
  return (
    <div className={cn('relative', className)} aria-hidden>
      <div className="absolute inset-0 rounded-t-full border border-coral/25" />
      <div className="absolute inset-3 overflow-hidden rounded-t-full bg-[linear-gradient(180deg,#ece2d6_0%,#e4d9cc_55%,#dccbb9_100%)] sm:inset-4">
        <div className="absolute inset-x-0 top-[12%] mx-auto h-1/2 w-2/3 rounded-full bg-coral/15 blur-3xl" />
        <svg viewBox="0 0 200 420" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 mx-auto h-[92%] w-full">
          <defs>
            <radialGradient id="gourd" cx="38%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#c27a52" />
              <stop offset="55%" stopColor="#a3552e" />
              <stop offset="100%" stopColor="#5e2a18" />
            </radialGradient>
            <linearGradient id="neck" x1="0" x2="1">
              <stop offset="0%" stopColor="#6b3220" />
              <stop offset="50%" stopColor="#8e4127" />
              <stop offset="100%" stopColor="#6b3220" />
            </linearGradient>
          </defs>
          {/* Neck (dandi) and pegs */}
          <rect x="84" y="8" width="32" height="330" rx="10" fill="url(#neck)" />
          {[40, 70, 100, 130].map((y, i) => (
            <rect key={y} x={i % 2 ? 114 : 76} y={y} width="10" height="7" rx="3" fill="#4a1f17" />
          ))}
          {/* Resonator (kudam) */}
          <ellipse cx="100" cy="372" rx="96" ry="78" fill="url(#gourd)" />
          <ellipse cx="72" cy="345" rx="28" ry="16" fill="#fff" opacity="0.12" />
          {/* Bridge (jawari) */}
          <rect x="64" y="352" width="72" height="8" rx="2" fill="#f0e3cf" />
          {STRINGS.map((s, i) => {
            const plucked = live && pluck.index === i;
            const key = plucked ? `p-${pluck.count}` : live ? 'rest' : 'loop';
            return (
              <g key={`${i}-${key}`}>
                <line
                  x1={s.top}
                  y1="14"
                  x2={s.bottom}
                  y2="354"
                  stroke="#f7efe4"
                  strokeWidth="1.1"
                  style={{ transformBox: 'fill-box', animationDelay: live ? undefined : `${i * 1.1}s` }}
                  className={plucked ? 'animate-pluck-once' : live ? 'opacity-50' : 'animate-pluck'}
                />
                <line
                  x1={s.top}
                  y1="14"
                  x2={s.bottom}
                  y2="354"
                  stroke="#ffb59f"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{ filter: 'blur(2px)', animationDelay: live ? undefined : `${i * 1.1}s` }}
                  className={plucked ? 'animate-string-glow-once' : live ? 'opacity-0' : 'animate-string-glow'}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
