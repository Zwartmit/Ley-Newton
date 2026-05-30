"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Grid } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Drone from "./Drone";
import type { SimParams, Telemetry } from "@/lib/types";

interface SceneProps {
  params: SimParams;
  ignitionId: number;
  resetId: number;
  onTelemetry: (t: Telemetry) => void;
  onThrustingChange: (thrusting: boolean) => void;
}

export default function Scene({
  params,
  ignitionId,
  resetId,
  onTelemetry,
  onThrustingChange,
}: SceneProps) {
  return (
    <Canvas
      camera={{ position: [7, 4, 9], fov: 45 }}
      dpr={1}
      gl={{ antialias: false, powerPreference: "high-performance" }}
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

      {/* Mundo físico en gravedad cero */}
      <Physics gravity={[0, 0, 0]}>
        <Drone
          params={params}
          ignitionId={ignitionId}
          resetId={resetId}
          onTelemetry={onTelemetry}
          onThrustingChange={onThrustingChange}
        />
      </Physics>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={30}
        makeDefault
      />
    </Canvas>
  );
}
