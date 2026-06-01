"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "/models/scene.glb";

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

/**
 * Carga el modelo GLB del dron de forma imperativa con GLTFLoader.
 * Mientras carga (o si falla, p. ej. el archivo no existe) se muestra un dron
 * compuesto con primitivas; al cargar correctamente se reemplaza por el modelo.
 */
export default function DroneModel() {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let alive = true;
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (alive) setScene(gltf.scene);
      },
      undefined,
      () => {
        // No se pudo cargar el modelo (p. ej. archivo ausente): usamos primitivas.
        if (alive) setScene(null);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  if (scene) {
    return (
      <primitive object={scene} scale={0.6} rotation={[-Math.PI / 2, 0, 0]} />
    );
  }
  return <PrimitiveDrone />;
}
