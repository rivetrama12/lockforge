"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ForgeView } from "@/components/forge-view";
import { DieSection } from "@/components/die-section";
import { forge, mm, part } from "@/lib/lockbolt";
import { LoadChart } from "@/components/load-chart";
import {
  cycleDuration,
  phaseLabel,
  sample,
  trace,
  type Phase,
} from "@/lib/simulate";

const stages: { id: Phase; label: string; at: number }[] = [
  { id: "approach", label: "Approach", at: 0.5 },
  { id: "upset", label: "Upset", at: 2.5 },
  { id: "dwell", label: "Dwell", at: 3.8 },
  { id: "eject", label: "Eject", at: 6.0 },
];

const loadTrace = trace(0.08);

export function Studio() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [section, setSection] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const frame = sample(time);

  useEffect(() => {
    if (!playing) return;
    let handle = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((value) => {
        const next = value + dt;
        if (next >= cycleDuration) {
          setPlaying(false);
          return cycleDuration;
        }
        return next;
      });
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [playing]);

  const onStage = (at: number) => {
    setPlaying(false);
    setTime(at);
  };
  const onTogglePlay = () => {
    if (time >= cycleDuration) setTime(0);
    setPlaying((value) => !value);
  };
  const onReset = () => {
    setPlaying(false);
    setTime(0);
  };
  const onScrub = (value: number) => {
    setPlaying(false);
    setTime(value);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#14110e] text-[#f3efe6]">
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
              Hydraulic-press simulation of the first blow. Load, fill, and
              temperature come from the billet volume and the 100° cavity.
            </p>
          </div>
          <Badge variant="outline" className="border-[#c6a15a] text-[#f0d7b4]">
            {part.partNumber} window
          </Badge>
        </div>
      </header>

      <main className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative border-b border-[#3a342c] lg:border-r lg:border-b-0">
          <div className="relative h-[58svh] min-h-[340px] w-full touch-none lg:h-full lg:min-h-[560px]">
            <div className="absolute inset-0">
              <ForgeView
                gapMm={frame.gapMm}
                fill={frame.fill}
                tempC={frame.tempC}
                ejectMm={frame.ejectMm}
                metalTop={frame.metalTop}
                headDia={frame.headDia}
                section={section}
                showPin={showPin}
              />
            </div>
            <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-[#14110e]/80 px-3 py-2">
              <p className="font-mono text-[11px] text-[#c6a15a]">
                {frame.t.toFixed(2)} s · {frame.phase.toUpperCase()}
              </p>
              <p className="text-sm">{phaseLabel(frame.phase)}</p>
            </div>
            <div className="pointer-events-none absolute right-3 bottom-3 left-3 hidden lg:block">
              <Controls
                activePhase={frame.phase}
                time={time}
                playing={playing}
                section={section}
                showPin={showPin}
                onStage={onStage}
                onTogglePlay={onTogglePlay}
                onReset={onReset}
                onScrub={onScrub}
                onToggleSection={() => setSection((v) => !v)}
                onTogglePin={() => setShowPin((v) => !v)}
                className="pointer-events-auto rounded-lg border border-[#3a342c] bg-[#1b1714]/90 p-3 backdrop-blur"
              />
            </div>
          </div>
          <div className="border-t border-[#3a342c] bg-[#1b1714] p-3 lg:hidden">
            <Controls
              activePhase={frame.phase}
              time={time}
              playing={playing}
              section={section}
              showPin={showPin}
              onStage={onStage}
              onTogglePlay={onTogglePlay}
              onReset={onReset}
              onScrub={onScrub}
              onToggleSection={() => setSection((v) => !v)}
              onTogglePin={() => setShowPin((v) => !v)}
            />
          </div>
        </section>

        <aside className="space-y-5 px-5 py-5 md:px-6">
          <Gauges
            forceT={frame.forceT}
            tempC={frame.tempC}
            fill={frame.fill}
            gapMm={frame.gapMm}
            headDia={frame.headDia}
          />
          <LoadChart frames={loadTrace} cursor={time} />
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

function Controls({
  activePhase,
  time,
  playing,
  section,
  showPin,
  onStage,
  onTogglePlay,
  onReset,
  onScrub,
  onToggleSection,
  onTogglePin,
  className = "",
}: {
  activePhase: Phase;
  time: number;
  playing: boolean;
  section: boolean;
  showPin: boolean;
  onStage: (at: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onScrub: (value: number) => void;
  onToggleSection: () => void;
  onTogglePin: () => void;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => (
          <Button
            key={stage.id}
            size="sm"
            variant={activePhase === stage.id ? "default" : "outline"}
            onClick={() => onStage(stage.at)}
          >
            {stage.label}
          </Button>
        ))}
        <Button size="sm" onClick={onTogglePlay}>
          {playing ? "Pause" : "Run cycle"}
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
      <Slider
        value={[time]}
        min={0}
        max={cycleDuration}
        step={0.01}
        onValueChange={(value) => onScrub(value[0] ?? 0)}
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={section ? "default" : "outline"} onClick={onToggleSection}>
          {section ? "Section on" : "Section off"}
        </Button>
        <Button size="sm" variant={showPin ? "default" : "outline"} onClick={onTogglePin}>
          Finished pin
        </Button>
      </div>
    </div>
  );
}

function Gauges({
  forceT,
  tempC,
  fill,
  gapMm,
  headDia,
}: {
  forceT: number;
  tempC: number;
  fill: number;
  gapMm: number;
  headDia: number;
}) {
  const cells = [
    ["Load", `${forceT.toFixed(1)} t`],
    ["Metal", `${tempC.toFixed(0)} °C`],
    ["Fill", `${Math.round(fill * 100)} %`],
    ["Gap", `${gapMm.toFixed(1)} mm`],
    ["Head Ø", `${headDia.toFixed(1)} mm`],
    ["Limit", `${forge.limitTonnes} t`],
  ];
  return (
    <div>
      <h2 className="text-sm font-medium tracking-wide text-[#c6a15a]">
        Blow simulation
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {cells.map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#3a342c] px-2 py-2">
            <p className="text-[11px] text-[#9c8f7e]">{label}</p>
            <p className="font-mono text-sm text-[#f3efe6]">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#9c8f7e]">
        Slab estimate: free upset until the head meets the cone, then the
        constraint rises to {forge.constraint}. Peak must stay under the {forge.limitTonnes} t
        relief. Not a finite-element result.
      </p>
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
