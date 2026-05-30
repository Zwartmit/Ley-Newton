"use client";

import { Component, Suspense, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";

const MODEL_URL = "/models/scene.gltf";

/**
 * Carga el modelo GLTF del dron. Si el modelo no puede cargarse (por ejemplo,
 * falta el binario scene.bin), se usa un dron compuesto con primitivas.
 */
function GltfDrone() {
  const { scene } = useGLTF(MODEL_URL);
  // Escala/orientación para encajar el modelo importado en la escena.
  return <primitive object={scene} scale={0.6} rotation={[-Math.PI / 2, 0, 0]} />;
}

/** Dron compuesto con primitivas de Three.js (cuerpo + tobera). */
export function PrimitiveDrone() {
  return (
    <group>
      {/* Cuerpo principal */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.7, 1.6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Cúpula / sensor */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.3} roughness={0.2} />
      </mesh>
      {/* Brazos/patas */}
      {[
        [0.95, 0, 0.95],
        [-0.95, 0, 0.95],
        [0.95, 0, -0.95],
        [-0.95, 0, -0.95],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Tobera del propulsor (apunta hacia abajo, -Y) */}
      <mesh position={[0, -0.65, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.45, 0.6, 24]} />
        <meshStandardMaterial
          color="#f97316"
          metalness={0.7}
          roughness={0.3}
          emissive="#7c2d12"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

/** Error boundary: si el GLTF falla al cargar, muestra el dron primitivo. */
class ModelErrorBoundary extends Component<BoundaryProps, { hasError: boolean }> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // El modelo no se pudo cargar (p. ej. falta scene.bin); usamos primitivas.
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function DroneModel() {
  return (
    <ModelErrorBoundary fallback={<PrimitiveDrone />}>
      <Suspense fallback={<PrimitiveDrone />}>
        <GltfDrone />
      </Suspense>
    </ModelErrorBoundary>
  );
}
