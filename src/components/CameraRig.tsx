"use client";

import { useFrame } from "@react-three/fiber";
import type { OrbitControls } from "@react-three/drei";
import type { ComponentRef, RefObject } from "react";
import type { PerspectiveCamera } from "three";

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

interface CameraRigProps {
  /** Campo de visión objetivo (grados) controlado por los botones de zoom. */
  fov: number;
  /** Altura (Y) actual del dron para el seguimiento dinámico. */
  droneYRef: RefObject<number>;
  controlsRef: RefObject<OrbitControlsRef | null>;
}

/**
 * Ajusta la cámara fuera del ciclo de React: interpola el zoom (FOV) hacia el
 * valor objetivo y desplaza suavemente el punto de mira (`lookAt`) para seguir
 * al dron a medida que asciende, regresando al centro cuando se reinicia.
 */
export default function CameraRig({
  fov,
  droneYRef,
  controlsRef,
}: CameraRigProps) {
  useFrame((state, delta) => {
    // Suavizado independiente del framerate.
    const k = 1 - Math.pow(0.0015, delta);

    const camera = state.camera as PerspectiveCamera;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov += (fov - camera.fov) * k;
      camera.updateProjectionMatrix();
    }

    const controls = controlsRef.current;
    if (controls) {
      // Seguimiento sutil: el objetivo se eleva una fracción de la altura del dron.
      const desiredY = droneYRef.current * 0.6;
      controls.target.y += (desiredY - controls.target.y) * k;
      controls.update();
    }
  });

  return null;
}
