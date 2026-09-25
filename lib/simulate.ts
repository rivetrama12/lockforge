import { circleArea, forge, part } from "@/lib/lockbolt";

/** Punch face starts this far above the parting plane. */
export const openGapMm = 78;

const approachSpeed = 42;
const upsetSpeed = 6;
const returnSpeed = 55;
const ejectShownMm = 36;
const ejectSpeed = 40;

const contactGap = forge.stickOut - part.headH;
const headStock = forge.stickOut * circleArea(forge.billetDia);

export const cycle = {
  approach: (openGapMm - contactGap) / approachSpeed,
  upset: contactGap / upsetSpeed,
  dwell: forge.dwellS,
  return: openGapMm / returnSpeed,
  eject: ejectShownMm / ejectSpeed,
  contactGap,
  headStock,
  ejectShownMm,
};

export const cycleDuration =
  cycle.approach + cycle.upset + cycle.dwell + cycle.return + cycle.eject;

export type Phase =
  | "approach"
  | "upset"
  | "dwell"
  | "return"
  | "eject"
  | "done";

export type Frame = {
  t: number;
  phase: Phase;
  /** Punch face height above the parting plane, mm. */
  gapMm: number;
  /** 0 at first contact, 1 when the countersink is full. */
  fill: number;
  forceT: number;
  tempC: number;
  /** How far the ejector has lifted the pin, mm. */
  ejectMm: number;
  /** Top of the hot metal above the parting plane, mm. */
  metalTop: number;
  /** Current head diameter, mm. Capped at the cavity. */
  headDia: number;
  /** True once the growing head meets the 100° wall. */
  onWall: boolean;
};

const marks = {
  approachEnd: cycle.approach,
  upsetEnd: cycle.approach + cycle.upset,
  dwellEnd: cycle.approach + cycle.upset + cycle.dwell,
  returnEnd: cycle.approach + cycle.upset + cycle.dwell + cycle.return,
};

function flowMpa(tempC: number) {
  return forge.flowMpa * (1 + 0.0022 * (forge.temperature - tempC));
}

function forceTonnes(area: number, constraint: number, tempC: number) {
  const kn = (flowMpa(tempC) * constraint * area) / 1000;
  return kn / 9.80665;
}

function clamp(value: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, value));
}

/** One sample of the hydraulic cycle. t = 0 is the start of approach. */
export function sample(t: number): Frame {
  const time = clamp(t, 0, cycleDuration);
  const base: Frame = {
    t: time,
    phase: "done",
    gapMm: openGapMm,
    fill: 0,
    forceT: 0,
    tempC: forge.temperature,
    ejectMm: 0,
    metalTop: forge.stickOut,
    headDia: forge.billetDia,
    onWall: false,
  };

  if (time < marks.approachEnd) {
    const u = time / cycle.approach;
    return {
      ...base,
      phase: "approach",
      gapMm: openGapMm + (contactGap - openGapMm) * u,
      forceT: 1.4,
    };
  }

  if (time < marks.upsetEnd) {
    const u = (time - marks.approachEnd) / cycle.upset;
    return upsetFrame(base, u, time);
  }

  if (time < marks.dwellEnd) {
    const u = (time - marks.upsetEnd) / cycle.dwell;
    const seated = upsetFrame(base, 1, time);
    const tempC = forge.temperature - 18 - 22 * u;
    return {
      ...seated,
      phase: "dwell",
      tempC,
      forceT: forceTonnes(circleArea(part.head), forge.constraint, tempC),
    };
  }

  if (time < marks.returnEnd) {
    const u = (time - marks.dwellEnd) / cycle.return;
    const seated = upsetFrame(base, 1, marks.dwellEnd);
    return {
      ...seated,
      phase: "return",
      gapMm: openGapMm * u,
      forceT: u < 0.08 ? seated.forceT * (1 - u / 0.08) : 0,
      tempC: seated.tempC - 8 * u,
    };
  }

  const u = (time - marks.returnEnd) / cycle.eject;
  const seated = upsetFrame(base, 1, marks.dwellEnd);
  return {
    ...seated,
    phase: time >= cycleDuration ? "done" : "eject",
    gapMm: openGapMm,
    forceT: 0,
    ejectMm: ejectShownMm * clamp(u, 0, 1),
    tempC: seated.tempC - 10,
  };
}

function upsetFrame(base: Frame, u: number, t: number): Frame {
  const gapMm = contactGap * (1 - u);
  const metalTop = gapMm + part.headH;
  const diaFree = Math.sqrt((4 * headStock) / (Math.PI * metalTop));
  const onWall = diaFree >= part.head;
  const headDia = Math.min(part.head, diaFree);
  const tempC = forge.temperature - 28 * u;
  // Free barrel uses a low constraint. After the cone wall is touched,
  // the factor rises to the closed-die value used on the process sheet.
  const constraint = onWall
    ? 2.4 + (forge.constraint - 2.4) * clamp((u - 0.45) / 0.55, 0, 1)
    : 2.1;
  const area = onWall ? circleArea(part.head) : circleArea(headDia);
  return {
    ...base,
    t,
    phase: "upset",
    gapMm,
    fill: u,
    forceT: forceTonnes(area, constraint, tempC),
    tempC,
    metalTop,
    headDia,
    onWall,
  };
}

export function trace(step = 0.05): Frame[] {
  const frames: Frame[] = [];
  for (let t = 0; t <= cycleDuration + 1e-6; t += step) frames.push(sample(t));
  return frames;
}

export function phaseLabel(phase: Phase) {
  switch (phase) {
    case "approach":
      return "Approach — no metal contact";
    case "upset":
      return "Upset — head filling the 100° cavity";
    case "dwell":
      return "Dwell — cavity full, load held";
    case "return":
      return "Return — ram rising";
    case "eject":
      return "Eject — cushion lifting the pin";
    case "done":
      return "Cycle complete";
  }
}
