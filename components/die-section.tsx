import { cone, forge, mm, part } from "@/lib/lockbolt";

/** Dimensioned section through the closed die. Units are millimetres. */
export function DieSection() {
  const bore = forge.dieBore;
  const head = part.head;
  const headH = part.headH;
  const shankLen = part.length - part.headH;

  return (
    <figure className="overflow-x-auto rounded-lg border border-[#3a342c] bg-[#211c17] p-4">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#f3efe6]">
          Closed-die section — ram down, cavity full
        </span>
        <span className="font-mono text-xs text-[#b7a48a]">
          Scale schematic · mm · pin axis vertical
        </span>
      </figcaption>
      <svg
        viewBox="0 0 760 460"
        className="h-auto w-full min-w-[680px]"
        role="img"
        aria-label="Section of the countersunk heading die"
      >
        <rect width="760" height="460" fill="#211c17" />
        <SectionDrawing
          bore={bore}
          head={head}
          headH={headH}
          shankLen={shankLen}
        />
      </svg>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#cbbfaa]">
        The lower insert is a solid bush. The countersink lives entirely in
        the punch, so the parting face is the under-head plane. Volume of the
        Ø{mm(forge.billetDia)} billet fills the head with no trim web. After
        the ram returns, the Ø16 ejector lifts the pin clear of the bore.
      </p>
    </figure>
  );
}

function SectionDrawing({
  bore,
  head,
  headH,
  shankLen,
}: {
  bore: number;
  head: number;
  headH: number;
  shankLen: number;
}) {
  // Drawing scale: 1 mm = 1.15 px, shank shortened visually to 150 px
  // so the head stays readable. Axial lengths are labelled true.
  const s = 2.4;
  const cx = 300;
  const partY = 150;
  const boreR = (bore / 2) * s;
  const headR = (head / 2) * s;
  const headPx = headH * s;
  const shankPx = 168;
  const dieOut = 78;
  const punchOut = 68;

  const land = cone.land * s;
  const conePx = cone.coneHeight * s;

  return (
    <g fontFamily="ui-monospace, monospace" fontSize="11" fill="#e7d7c3">
      {/* lower die */}
      <path
        d={`
          M ${cx - dieOut} ${partY}
          L ${cx - boreR} ${partY}
          L ${cx - boreR} ${partY + shankPx}
          L ${cx - 10} ${partY + shankPx}
          L ${cx - 10} ${partY + shankPx + 28}
          L ${cx + 10} ${partY + shankPx + 28}
          L ${cx + 10} ${partY + shankPx}
          L ${cx + boreR} ${partY + shankPx}
          L ${cx + boreR} ${partY}
          L ${cx + dieOut} ${partY}
          L ${cx + dieOut} ${partY + shankPx + 46}
          L ${cx - dieOut} ${partY + shankPx + 46}
          Z
        `}
        fill="#3e4a50"
        stroke="#9eb0b8"
        strokeWidth="1.2"
      />
      {/* punch */}
      <path
        d={`
          M ${cx - punchOut} ${partY}
          L ${cx - headR} ${partY}
          L ${cx - headR} ${partY - land}
          L ${cx - boreR + 1} ${partY - land - conePx}
          L ${cx - boreR + 1} ${partY - headPx}
          L ${cx + boreR - 1} ${partY - headPx}
          L ${cx + boreR - 1} ${partY - land - conePx}
          L ${cx + headR} ${partY - land}
          L ${cx + headR} ${partY}
          L ${cx + punchOut} ${partY}
          L ${cx + punchOut} ${partY - 78}
          L ${cx - punchOut} ${partY - 78}
          Z
        `}
        fill="#6b5138"
        stroke="#e0b07a"
        strokeWidth="1.2"
      />
      {/* forged pin */}
      <path
        d={`
          M ${cx - boreR + 2} ${partY + shankPx - 4}
          L ${cx - boreR + 2} ${partY}
          L ${cx - boreR + 1} ${partY - land - conePx}
          L ${cx - headR + 2} ${partY - land}
          L ${cx - headR + 2} ${partY - headPx + 2}
          L ${cx + headR - 2} ${partY - headPx + 2}
          L ${cx + headR - 2} ${partY - land}
          L ${cx + boreR - 1} ${partY - land - conePx}
          L ${cx + boreR - 2} ${partY}
          L ${cx + boreR - 2} ${partY + shankPx - 4}
          Z
        `}
        fill="#d7c4a4"
        stroke="#f3e6cf"
        strokeWidth="0.8"
      />
      {/* ejector */}
      <rect
        x={cx - 8}
        y={partY + shankPx - 2}
        width={16}
        height={70}
        fill="#8d8070"
        stroke="#d9cbb8"
      />

      <Dim
        x1={cx + headR}
        x2={cx + headR}
        y1={partY - headPx}
        y2={partY}
        label={`${mm(headH)} head`}
        side={1}
        offset={118}
      />
      <Dim
        x1={cx - headR}
        x2={cx + headR}
        y1={partY - headPx}
        y2={partY - headPx}
        label={`Ø${mm(head)}`}
        side={-1}
        offset={28}
      />
      <Dim
        x1={cx - boreR}
        x2={cx + boreR}
        y1={partY + 36}
        y2={partY + 36}
        label={`Ø${mm(bore)} bore`}
        side={1}
        offset={0}
      />
      <text x={cx + dieOut + 14} y={partY + shankPx / 2} fill="#9eb0b8">
        {`shank cavity ${mm(shankLen, 1)} deep`}
      </text>
      <text x={cx + punchOut + 14} y={partY - 48} fill="#e0b07a">
        {`punch · ${part.includedAngle}° CSK`}
      </text>
      <text x={20} y={28} fill="#f3efe6" fontSize="13">
        H13 inserts · parting at under-head face
      </text>
      <text x={20} y={418} fill="#b7a48a">
        {`Billet Ø${mm(forge.billetDia)} × ${mm(forge.billetLength)} cold · stick-out ${mm(forge.stickOut)} · ejector stroke ${forge.ejectorStroke}`}
      </text>
      <text x={20} y={438} fill="#b7a48a">
        {`Calculated blow ${mm(forge.designTonnes, 0)} t · set the press limit at ${forge.limitTonnes} t of ${forge.pressTonnes} t`}
      </text>
      {/* angle arc */}
      <AngleNote cx={cx + headR - 6} cy={partY - land} />
    </g>
  );
}

function Dim({
  x1,
  x2,
  y1,
  y2,
  label,
  side,
  offset,
}: {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  label: string;
  side: number;
  offset: number;
}) {
  const horizontal = Math.abs(y1 - y2) < 1;
  if (horizontal) {
    const y = y1 - side * (18 + offset);
    return (
      <g stroke="#d7b48a" fill="#d7b48a">
        <line x1={x1} y1={y1} x2={x1} y2={y} strokeWidth="0.6" />
        <line x1={x2} y1={y2} x2={x2} y2={y} strokeWidth="0.6" />
        <line x1={x1} y1={y} x2={x2} y2={y} strokeWidth="0.8" />
        <text
          x={(x1 + x2) / 2}
          y={y - 4}
          textAnchor="middle"
          stroke="none"
        >
          {label}
        </text>
      </g>
    );
  }
  const x = x1 + side * (16 + offset);
  const y = (y1 + y2) / 2;
  return (
    <g stroke="#d7b48a" fill="#d7b48a">
      <line x1={x1} y1={y1} x2={x} y2={y1} strokeWidth="0.6" />
      <line x1={x2} y1={y2} x2={x} y2={y2} strokeWidth="0.6" />
      <line x1={x} y1={y1} x2={x} y2={y2} strokeWidth="0.8" />
      <text x={x + 6} y={y} stroke="none">
        {label}
      </text>
    </g>
  );
}

function AngleNote({ cx, cy }: { cx: number; cy: number }) {
  return (
    <text x={cx + 8} y={cy + 14} fill="#f0d7b4">
      100°
    </text>
  );
}
