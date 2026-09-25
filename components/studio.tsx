"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ForgeView } from "@/components/forge-view";
import { DieSection } from "@/components/die-section";
import { forge, mm, part } from "@/lib/lockbolt";

const stages = [
  { id: "load", label: "1 · Load", at: 0.08 },
  { id: "approach", label: "2 · Approach", at: 0.38 },
  { id: "upset", label: "3 · Upset", at: 0.72 },
  { id: "dwell", label: "4 · Dwell", at: 1 },
] as const;

export function Studio() {
  const [stroke, setStroke] = useState(0.08);
  const [playing, setPlaying] = useState(false);
  const [section, setSection] = useState(true);
  const [showPin, setShowPin] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setStroke((value) => {
        const next = value + dt * 0.18;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const phase =
    stroke < 0.25 ? "Billet in the bore" : stroke < 0.55 ? "Punch approaching" : stroke < 0.95 ? "Head upsetting" : "Cavity full — dwell";

  return (
    <div className="min-h-screen bg-[#14110e] text-[#f3efe6]">
      <header className="border-b border-[#3a342c] px-5 py-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-[#c6a15a]">
              BOLTON CSK 24-XG · CLOSED DIE · 300 t PRESS
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {part.title}, {part.length} mm pin
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#cbbfaa]">
              First operation: hot-head the countersunk pin in one blow. Lock
              grooves, breakneck, and pintail are rolled after this die.
            </p>
          </div>
          <Badge variant="outline" className="border-[#c6a15a] text-[#f0d7b4]">
            {part.partNumber} window
          </Badge>
        </div>
      </header>

      <main className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative min-h-[520px] border-b border-[#3a342c] lg:border-r lg:border-b-0">
          <div className="absolute inset-0">
            <ForgeView stroke={stroke} section={section} showPin={showPin} />
          </div>
          <div className="pointer-events-none absolute top-4 left-4 rounded-md bg-[#14110e]/80 px-3 py-2">
            <p className="font-mono text-[11px] text-[#c6a15a]">RAM</p>
            <p className="text-sm">{phase}</p>
          </div>
          <div className="absolute right-4 bottom-4 left-4 space-y-3 rounded-lg border border-[#3a342c] bg-[#1b1714]/90 p-3 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <Button
                  key={stage.id}
                  size="sm"
                  variant={Math.abs(stroke - stage.at) < 0.08 ? "default" : "outline"}
                  onClick={() => {
                    setPlaying(false);
                    setStroke(stage.at);
                  }}
                >
                  {stage.label}
                </Button>
              ))}
              <Button size="sm" onClick={() => setPlaying((value) => !value)}>
                {playing ? "Pause" : "Play stroke"}
              </Button>
            </div>
            <Slider
              value={[stroke]}
              min={0}
              max={1}
              step={0.005}
              onValueChange={(value) => {
                setPlaying(false);
                setStroke(value[0] ?? 0);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={section ? "default" : "outline"} onClick={() => setSection((v) => !v)}>
                {section ? "Section on" : "Section off"}
              </Button>
              <Button size="sm" variant={showPin ? "default" : "outline"} onClick={() => setShowPin((v) => !v)}>
                Finished pin
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-5 px-5 py-5 md:px-6">
          <ProcessCard />
        </aside>
      </main>

      <section className="space-y-4 border-t border-[#3a342c] px-5 py-6 md:px-8">
        <DieSection />
        <ShopSequence />
      </section>
    </div>
  );
}

function ProcessCard() {
  const rows = [
    ["Catalog family", part.family],
    ["Nearest part", `${part.partNumber} · mark ${part.marking}`],
    ["Overall length", `${part.length} mm (band ${part.lengthMin}–${part.lengthMax})`],
    ["Shank Ø", `${mm(part.shank)} mm (band ${part.shankMin}–${part.shankMax})`],
    ["CSK head", `Ø${mm(part.head)} × ${mm(part.headH)} · ${part.includedAngle}°`],
    ["Grip this die covers", `${part.gripMin}–${part.gripMax} mm`],
    ["Steel", part.steel],
    ["Billet", `Ø${mm(forge.billetDia)} × ${mm(forge.billetLength)} mm`],
    ["Stick-out", `${mm(forge.stickOut)} mm above the die face`],
    ["Heat", `${forge.temperature}°C · die preheat ${forge.diePreheat}°C`],
    ["Guide bore", `Ø${mm(forge.dieBore)} clearance · H13`],
    ["Calculated blow", `${mm(forge.designTonnes, 0)} t (${mm(forge.designKn, 0)} kN)`],
    ["Press limit", `${forge.limitTonnes} t on a ${forge.pressTonnes} t frame`],
    ["Mass", `${mm(forge.massKg * 1000, 0)} g forged blank`],
  ];

  return (
    <div>
      <h2 className="text-sm font-medium tracking-wide text-[#c6a15a]">
        Process sheet
      </h2>
      <dl className="mt-3 divide-y divide-[#3a342c] border-y border-[#3a342c]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[110px_1fr] gap-2 py-2 text-sm">
            <dt className="text-[#9c8f7e]">{label}</dt>
            <dd className="font-mono text-[13px] text-[#f3efe6]">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm leading-relaxed text-[#cbbfaa]">
        Hot flow stress {forge.flowMpa} MPa and a closed-die factor of{" "}
        {forge.constraint} put the head at {mm(forge.upsetKn, 0)} kN. Wall
        friction adds {mm(forge.wallFrictionKn, 0)} kN. Set the press limit at{" "}
        {forge.limitTonnes} t — above that blow, and well under the 300 t
        frame — so a cold bar cannot overload the punch.
      </p>
    </div>
  );
}

function ShopSequence() {
  const steps = [
    `Saw Ø${mm(forge.billetDia)} bar to ${mm(forge.billetLength)} mm. Ends square within 0.3 mm. Deburr the leading end so it enters the bore.`,
    `Induction-heat the upset end to ${forge.temperature}°C. The shank can run 50°C cooler. Check with a pyrometer, not colour alone.`,
    `Brush scale. Graphite-spray the bore and the 100° punch. Die face at ${forge.diePreheat}°C before the first blow.`,
    `Stand the bar in the Ø${mm(forge.dieBore)} bush, ${mm(forge.stickOut)} mm proud of the parting face.`,
    `Close the 300 t press on an ${forge.limitTonnes} t limit (the blow itself is about ${mm(forge.designTonnes, 0)} t). Dwell ${forge.dwellS} s. Contact time under two seconds.`,
    `Raise the ram. Fire the lower ejector (${forge.ejectorTonnes} t, ${forge.ejectorStroke} mm) and lift the blank clear.`,
    `Check head Ø${mm(part.headMin)}–${mm(part.headMax)}, height ${mm(part.headHMin)}–${mm(part.headHMax)}, length ${part.lengthMin}–${part.lengthMax}, and the 100° cone.`,
    "Next dies, not this one: roll five lock grooves, the breakneck, and the pintail; quench and temper to 178 kN tensile; zinc plate 10 μm.",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed">
            <span className="font-mono text-[#c6a15a]">{index + 1}</span>
            <span className="text-[#e7dccb]">{step}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-[#3a342c] bg-[#1b1714] p-4 text-sm leading-relaxed text-[#cbbfaa]">
        <p className="font-medium text-[#f3efe6]">Press envelope this tool needs</p>
        <p className="mt-2">
          Daylight at least {forge.daylightMin} mm. Ram stroke at least{" "}
          {forge.ramStrokeMin} mm. A hydraulic cushion under the bed,{" "}
          {forge.ejectorTonnes} t and {forge.ejectorStroke} mm, ejects the 150 mm
          pin. Inserts are {`H13 at 46–50 HRC`} in a 1045 holder. The finished
          pin drawn to the side of the press is the reference after groove
          rolling — this blow leaves a plain shank.
        </p>
        <p className="mt-3">
          Catalog strength on the finished, heat-treated pin: {part.tensileKn} kN
          tensile, {part.shearKn} kN shear, {part.clampKn} kN clamp, hole{" "}
          {part.holeMax} mm max.
        </p>
      </div>
    </div>
  );
}
