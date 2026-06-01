"use client";

import { useRef } from "react";
import type { ComponentRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Grid } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Drone from "./Drone";
import CameraRig from "./CameraRig";
import { DEFAULT_FOV } from "@/lib/physics";
import type { SimParams, Telemetry } from "@/lib/types";

interface SceneProps {
  params: SimParams;
  ignitionId: number;
  resetId: number;
  fov: number;
  onTelemetry: (t: Telemetry) => void;
  onThrustingChange: (thrusting: boolean) => void;
  onFlightComplete: () => void;
}

export default function Scene({
  params,
  ignitionId,
  resetId,
  fov,
  onTelemetry,
  onThrustingChange,
  onFlightComplete,
}: SceneProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const droneYRef = useRef(0);

  return (
    <Canvas
      camera={{ position: [7, 4, 9], fov: DEFAULT_FOV }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 18, 45]} />

      {/* Iluminación */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 10, 6]} intensity={2.2} />
      <directionalLight position={[-8, -4, -6]} intensity={0.5} color="#60a5fa" />

      {/* Ambiente espacial (vacío) */}
      <Stars radius={80} depth={40} count={1500} factor={4} fade speed={0.5} />
      <Grid
        position={[0, -3.5, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={40}
        infiniteGrid
      />

      {/* Mundo físico en gravedad cero (interpolado para suavizar el movimiento) */}
      <Physics gravity={[0, 0, 0]} interpolate>
        <Drone
          params={params}
          ignitionId={ignitionId}
          resetId={resetId}
          onTelemetry={onTelemetry}
          onThrustingChange={onThrustingChange}
          onFlightComplete={onFlightComplete}
          droneYRef={droneYRef}
        />
      </Physics>

      <CameraRig fov={fov} droneYRef={droneYRef} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        minDistance={4}
        maxDistance={30}
        makeDefault
      />
    </Canvas>
  );
}
