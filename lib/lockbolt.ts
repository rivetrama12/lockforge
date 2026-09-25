/** CSK 3/4" lockbolt forging model.
 * Envelope from the Bolton CSK 24-XG sheet. Length is the shop target
 * inside the ERSCSK24-32G overall-length window (148.5–153 mm).
 * Grooves are not forged — they are rolled after this blow.
 */

export const part = {
  family: "CSK 24-XG",
  marking: "24-32",
  partNumber: "ERSCSK24-32G",
  title: '3/4" countersunk lockbolt',
  shankMin: 18.9,
  shankMax: 19.4,
  shank: 19.15,
  headMin: 34.7,
  headMax: 35.3,
  head: 35,
  headHMin: 9.6,
  headHMax: 10,
  headH: 9.8,
  includedAngle: 100,
  length: 150,
  lengthMin: 148.5,
  lengthMax: 153,
  gripMin: 50.8,
  gripMax: 57.15,
  grip: 54,
  dMin: 82.5,
  dMax: 83.5,
  dToBreakneck: 83,
  holeMax: 20.5,
  tensileKn: 178,
  shearKn: 144,
  clampKn: 127,
  pinProtrusionMax: 9.5,
  pinIntrusionMax: 1.6,
  zincUm: 10,
  steel: "SAE 10B38 carbon-boron steel",
} as const;

const PI = Math.PI;

export function circleArea(diameter: number) {
  return (PI * diameter * diameter) / 4;
}

/** 100° included cone: each generator is 50° off the pin axis. */
export const cone = (() => {
  const half = (part.includedAngle / 2) * (PI / 180);
  const land = 1.2;
  const radial = part.head / 2 - part.shank / 2;
  const coneHeight = radial / Math.tan(half);
  const blend = part.headH - land - coneHeight;
  return { halfDeg: 50, land, coneHeight, blend, radial };
})();

export function headVolume() {
  const R = part.head / 2;
  const r = part.shank / 2;
  const land = PI * R * R * cone.land;
  const frustum =
    (PI * cone.coneHeight * (R * R + R * r + r * r)) / 3;
  const blend = PI * r * r * Math.max(cone.blend, 0);
  return land + frustum + blend;
}

export function shankVolume() {
  const shankLength = part.length - part.headH;
  return circleArea(part.shank) * shankLength;
}

export const forge = (() => {
  const temperature = 1100;
  const alpha = 12.8e-6;
  const growth = 1 + alpha * (temperature - 20);
  const hotShank = part.shank * growth;
  // Clearance guide. The shank is the unworked bar, not an extruded bore.
  const dieBore = Number((hotShank + 0.35).toFixed(2));
  const billetDia = part.shank;
  const forgedVolume = headVolume() + shankVolume();
  const scaleVol = 1.015;
  const stickOut = (headVolume() * scaleVol) / circleArea(billetDia);
  const billetLength = part.length - part.headH + stickOut;
  const density = 7.85e-6; // kg/mm³
  const massKg = forgedVolume * density;

  // Hot flow stress for 10B38 near 1100°C, closed-die constraint.
  const flowMpa = 65;
  const constraint = 5;
  const pressureMpa = flowMpa * constraint;
  const headArea = circleArea(part.head);
  const upsetKn = (pressureMpa * headArea) / 1000;
  const wallFrictionKn = upsetKn * 0.22;
  const designKn = upsetKn + wallFrictionKn;
  const pressKn = 300 * 9.80665;
  const designTonnes = designKn / 9.80665;

  return {
    temperature,
    growth,
    hotShank,
    dieBore,
    billetDia,
    forgedVolume,
    billetLength,
    stickOut,
    massKg,
    flowMpa,
    constraint,
    pressureMpa,
    upsetKn,
    wallFrictionKn,
    designKn,
    designTonnes,
    pressKn,
    pressTonnes: 300,
    // Practical relief: above the calculated blow, far below press capacity.
    limitTonnes: 80,
    utilisation: designKn / pressKn,
    dwellS: 0.8,
    diePreheat: 220,
    ejectorStroke: 160,
    ejectorTonnes: 20,
    ramStrokeMin: 200,
    daylightMin: 680,
  };
})();

export const dieSteel = {
  insert: "H13 / 1.2344",
  insertHrc: "46–50 HRC",
  holder: "1045, normalised",
  ejector: "H13 pin, Ø16 mm",
  lube: "Graphite in water, sprayed each blow",
} as const;

export function mm(value: number, digits = 1) {
  return value.toFixed(digits);
}

export function tonnes(kn: number) {
  return kn / 9.80665;
}
