"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { cone, forge, part } from "@/lib/lockbolt";

type Props = {
  gapMm: number;
  fill: number;
  tempC: number;
  ejectMm: number;
  metalTop: number;
  headDia: number;
  section: boolean;
  showPin: boolean;
};

export function ForgeView({
  gapMm,
  fill,
  tempC,
  ejectMm,
  metalTop,
  headDia,
  section,
  showPin,
}: Props) {
  return (
    <Canvas
      camera={{ position: [160, 70, 210], fov: 32, near: 0.5, far: 4000 }}
      gl={{ localClippingEnabled: true, antialias: true }}
    >
      <color attach="background" args={["#14110e"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[80, 180, 60]} intensity={1.6} />
      <directionalLight position={[-120, 40, -40]} intensity={0.35} />
      <Scene
        gapMm={gapMm}
        fill={fill}
        tempC={tempC}
        ejectMm={ejectMm}
        metalTop={metalTop}
        headDia={headDia}
        section={section}
        showPin={showPin}
      />
      <OrbitControls target={[0, -20, 0]} maxDistance={600} />
    </Canvas>
  );
}

function Scene({
  gapMm,
  fill,
  tempC,
  ejectMm,
  metalTop,
  headDia,
  section,
  showPin,
}: Props) {
  const clip = useMemo(
    () => [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)],
    [],
  );
  const planes = section ? clip : undefined;
  const hot = tempC > 900;

  return (
    <group>
      <PressFrame />
      <LowerDie planes={planes} />
      <group position={[0, gapMm, 0]}>
        <Punch planes={planes} />
      </group>
      <group position={[0, ejectMm, 0]}>
        <Workpiece
          fill={fill}
          metalTop={metalTop}
          headDia={headDia}
          tempC={tempC}
          hot={hot}
        />
      </group>
      <Ejector ejectMm={ejectMm} />
      {showPin && <FinishedPin />}
      <gridHelper
        args={[420, 14, "#3a332c", "#2a241e"]}
        position={[0, -230, 0]}
      />
    </group>
  );
}

function PressFrame() {
  return (
    <group>
      <mesh position={[0, -210, 0]}>
        <boxGeometry args={[280, 28, 200]} />
        <meshStandardMaterial color="#2c3134" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 150, 0]}>
        <boxGeometry args={[200, 22, 140]} />
        <meshStandardMaterial color="#3a3530" metalness={0.55} roughness={0.45} />
      </mesh>
      {[-120, 120].map((x) => (
        <mesh key={x} position={[x, -30, 0]}>
          <cylinderGeometry args={[10, 10, 340, 20]} />
          <meshStandardMaterial color="#1f2426" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 118, 0]}>
        <boxGeometry args={[70, 36, 70]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.4} roughness={0.45} />
      </mesh>
    </group>
  );
}

function LowerDie({ planes }: { planes?: THREE.Plane[] }) {
  const geom = useMemo(() => {
    const r = forge.dieBore / 2;
    const depth = part.length - part.headH;
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(8, -depth - 22),
      new THREE.Vector2(8, -depth),
      new THREE.Vector2(r, -depth),
      new THREE.Vector2(r, 0),
      new THREE.Vector2(58, 0),
      new THREE.Vector2(58, -depth - 36),
      new THREE.Vector2(22, -depth - 36),
      new THREE.Vector2(22, -depth - 22),
    ];
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial
          color="#5d6c74"
          metalness={0.72}
          roughness={0.32}
          side={THREE.DoubleSide}
          clippingPlanes={planes}
        />
      </mesh>
      <mesh position={[0, -118, 0]}>
        <cylinderGeometry args={[78, 78, 36, 48]} />
        <meshStandardMaterial
          color="#3d4548"
          metalness={0.5}
          roughness={0.5}
          clippingPlanes={planes}
        />
      </mesh>
    </group>
  );
}

function Punch({ planes }: { planes?: THREE.Plane[] }) {
  const geom = useMemo(() => {
    const shankR = part.shank / 2;
    const headR = part.head / 2;
    const landTop = part.headH - cone.land;
    const coneBottom = landTop - cone.coneHeight;
    const pts = [
      [0.4, part.headH],
      [headR, part.headH],
      [headR, landTop],
      [shankR, coneBottom],
      [shankR, 0.3],
      [46, 0],
      [46, 12],
      [56, 16],
      [56, 86],
      [18, 86],
      [18, part.headH],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  return (
    <mesh geometry={geom} castShadow>
      <meshStandardMaterial
        color="#8d6848"
        metalness={0.68}
        roughness={0.34}
        side={THREE.DoubleSide}
        clippingPlanes={planes}
      />
    </mesh>
  );
}

function Workpiece({
  fill,
  metalTop,
  headDia,
  tempC,
  hot,
}: {
  fill: number;
  metalTop: number;
  headDia: number;
  tempC: number;
  hot: boolean;
}) {
  const geom = useMemo(() => {
    const billetR = forge.billetDia / 2;
    const depth = part.length - part.headH;
    const headR = Math.max(headDia / 2, billetR);
    const top = Math.max(metalTop, 0.4);
    const pts: THREE.Vector2[] = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const y = -depth + ((top + depth) * i) / steps;
      let r = billetR;
      if (y >= 0) {
        const u = y / top;
        if (fill > 0.82) {
          const landStart = 1 - cone.land / part.headH;
          r = u > landStart ? part.head / 2 : THREE.MathUtils.lerp(billetR, part.head / 2, u / landStart);
        } else {
          r = THREE.MathUtils.lerp(billetR, headR, Math.pow(u, 0.7));
        }
      }
      pts.push(new THREE.Vector2(Math.max(r, 0.4), y));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, [fill, metalTop, headDia]);

  const heat = Math.min(1, Math.max(0, (tempC - 900) / 250));
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={hot ? "#ff6a2c" : "#d9cbb6"}
        emissive={hot ? "#ff3b00" : "#000"}
        emissiveIntensity={hot ? 0.25 + heat * 0.35 : 0}
        metalness={hot ? 0.25 : 0.65}
        roughness={hot ? 0.42 : 0.35}
      />
    </mesh>
  );
}

function Ejector({ ejectMm }: { ejectMm: number }) {
  const depth = part.length - part.headH;
  return (
    <mesh position={[0, -depth - 20 + ejectMm, 0]}>
      <cylinderGeometry args={[8, 8, 50, 24]} />
      <meshStandardMaterial color="#b7aa96" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

function FinishedPin() {
  const geom = useMemo(() => pinGeometry(), []);
  return (
    <mesh geometry={geom} position={[90, 20, 0]} rotation={[0, 0, Math.PI / 2]}>
      <meshStandardMaterial color="#c8c2b6" metalness={0.72} roughness={0.28} />
    </mesh>
  );
}

function pinGeometry() {
  const shankR = part.shank / 2;
  const headR = part.head / 2;
  const depth = part.length - part.headH;
  const pts: THREE.Vector2[] = [];
  const push = (r: number, y: number) =>
    pts.push(new THREE.Vector2(r, y));

  push(headR, part.headH);
  push(headR, part.headH - cone.land);
  push(shankR, part.headH - cone.land - cone.coneHeight);
  push(shankR, 0);
  const grooveStart = -(part.gripMax);
  const breakAt = -(part.dToBreakneck - part.headH);
  push(shankR, grooveStart);
  const grooves = 5;
  for (let i = 0; i <= grooves * 8; i++) {
    const u = i / (grooves * 8);
    const y = grooveStart + (breakAt - grooveStart) * u;
    const wave = Math.sin(u * grooves * Math.PI * 2);
    const r = shankR - (wave > 0 ? 0.15 : 1.15);
    push(r, y);
  }
  push(6.7, breakAt - 2.2);
  push(6.7, breakAt - 4.2);
  push(8.5, breakAt - 6);
  const tip = -depth;
  for (let i = 0; i <= 48; i++) {
    const u = i / 48;
    const y = breakAt - 6 + (tip - (breakAt - 6)) * u;
    const wave = Math.sin(u * 14 * Math.PI * 2);
    push(8.5 - (wave > 0 ? 0.1 : 0.7), y);
  }
  return new THREE.LatheGeometry(pts, 40);
}
