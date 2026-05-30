"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 120;
const NOZZLE_Y = -0.95; // Posición de la tobera respecto al dron.

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface ParticleData {
  particles: Particle[];
  dummy: THREE.Object3D;
}

function spawn(p: Particle) {
  p.pos.set(
    (Math.random() - 0.5) * 0.25,
    NOZZLE_Y,
    (Math.random() - 0.5) * 0.25,
  );
  // Velocidad principal hacia abajo (-Y) con dispersión cónica.
  p.vel.set(
    (Math.random() - 0.5) * 1.6,
    -(3 + Math.random() * 3),
    (Math.random() - 0.5) * 1.6,
  );
  p.maxLife = 0.4 + Math.random() * 0.5;
  p.life = p.maxLife;
}

/**
 * Emisor de partículas ligero: pequeñas esferas que salen por la tobera
 * hacia abajo (-Y) simulando la expulsión de gas. Usa InstancedMesh.
 */
export default function ExhaustParticles({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dataRef = useRef<ParticleData | null>(null);

  useEffect(() => {
    dataRef.current = {
      particles: Array.from({ length: COUNT }, () => ({
        pos: new THREE.Vector3(0, NOZZLE_Y, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
      })),
      dummy: new THREE.Object3D(),
    };
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const { particles, dummy } = data;
    const dt = Math.min(delta, 0.05);
    let spawnBudget = active ? 6 : 0; // partículas nuevas por frame

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      if (p.life <= 0) {
        if (spawnBudget > 0) {
          spawn(p);
          spawnBudget--;
        } else {
          // Oculta la partícula inactiva escalándola a cero.
          dummy.position.set(0, NOZZLE_Y, 0);
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          continue;
        }
      }

      p.life -= dt;
      p.pos.addScaledVector(p.vel, dt);
      const t = Math.max(p.life / p.maxLife, 0);
      const scale = 0.18 * t;

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#fdba74"
        emissive="#fb923c"
        emissiveIntensity={2}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
