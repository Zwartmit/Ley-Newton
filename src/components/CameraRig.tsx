"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
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
 * valor objetivo y desplaza la cámara (posición + punto de mira) para seguir al
 * dron a medida que asciende, manteniendo un desfase vertical fijo y regresando
 * a la altura inicial cuando el dron se reinicia.
 */
export default function CameraRig({
  fov,
  droneYRef,
  controlsRef,
}: CameraRigProps) {
  // Altura inicial de la cámara, capturada en el primer frame.
  const baseCamYRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    // Suavizado independiente del framerate.
    const k = 1 - Math.pow(0.0015, delta);

    const camera = state.camera as PerspectiveCamera;
    if (baseCamYRef.current === null) {
      baseCamYRef.current = camera.position.y;
    }

    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov += (fov - camera.fov) * k;
      camera.updateProjectionMatrix();
    }

    const droneY = droneYRef.current;

    // Sigue al dron por posición: mantiene el desfase vertical inicial respecto
    // al dron, de modo que no se pierde a altas velocidades. Vuelve a la altura
    // base cuando el dron se reinicia a Y=0.
    const desiredCamY = baseCamYRef.current + droneY;
    camera.position.y += (desiredCamY - camera.position.y) * k;

    const controls = controlsRef.current;
    if (controls) {
      // El punto de mira acompaña al dron para mantenerlo encuadrado.
      controls.target.y += (droneY - controls.target.y) * k;
      controls.update();
    }
  });

  return null;
}
