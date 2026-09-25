import { forge } from "@/lib/lockbolt";
import { cycleDuration, type Frame } from "@/lib/simulate";

export function LoadChart({ frames, cursor }: { frames: Frame[]; cursor: number }) {
  const w = 320;
  const h = 150;
  const pad = { l: 28, r: 8, t: 12, b: 22 };
  const maxT = cycleDuration;
  const maxF = forge.limitTonnes;
  const x = (t: number) => pad.l + (t / maxT) * (w - pad.l - pad.r);
  const y = (force: number) =>
    pad.t + (1 - force / maxF) * (h - pad.t - pad.b);

  const line = frames
    .map((frame, i) => `${i === 0 ? "M" : "L"} ${x(frame.t).toFixed(1)} ${y(frame.forceT).toFixed(1)}`)
    .join(" ");
  const past = frames.filter((frame) => frame.t <= cursor);
  const drawn = past
    .map((frame, i) => `${i === 0 ? "M" : "L"} ${x(frame.t).toFixed(1)} ${y(frame.forceT).toFixed(1)}`)
    .join(" ");
  const now = past[past.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Press load against time">
      <rect width={w} height={h} fill="#1b1714" rx="6" />
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={y(forge.limitTonnes)}
        y2={y(forge.limitTonnes)}
        stroke="#c6a15a"
        strokeDasharray="3 3"
      />
      <text x={pad.l + 4} y={y(forge.limitTonnes) - 3} fill="#c6a15a" fontSize="9">
        {forge.limitTonnes} t limit
      </text>
      <path d={line} fill="none" stroke="#3a342c" strokeWidth="1.5" />
      <path d={drawn} fill="none" stroke="#e07a3d" strokeWidth="2" />
      {now && <circle cx={x(now.t)} cy={y(now.forceT)} r="3.5" fill="#f3efe6" />}
      <text x={pad.l} y={h - 6} fill="#9c8f7e" fontSize="9">
        0 s
      </text>
      <text x={w - pad.r} y={h - 6} fill="#9c8f7e" fontSize="9" textAnchor="end">
        {cycleDuration.toFixed(1)} s
      </text>
      <text x={4} y={pad.t + 8} fill="#9c8f7e" fontSize="9">
        t
      </text>
    </svg>
  );
}
