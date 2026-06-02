"use client";

import { useLayoutEffect } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const MODEL_URL = "/models/scene-transformed.glb";

/**
 * Carga el modelo GLB del dron mediante `useGLTF` (caché de drei).
 *
 * El modelo viene en sistema Z-up, así que lo giramos π rad sobre X para que
 * quede plano (Y-up). Usamos `<Clone>` en lugar de `<primitive>` para que cada
 * montaje renderice su propia copia del grafo de escena: así, cuando el
 * `RigidBody` se remonta al cambiar la masa, el modelo se sirve al instante
 * desde la caché y no se muta un objeto compartido.
 */
export default function DroneModel() {
  const { scene } = useGLTF(MODEL_URL);
  const gl = useThree((s) => s.gl);
  const rootScene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  // Precompilamos los shaders del modelo ya montado para evitar el tirón
  // (compilación en GPU) justo cuando el dron aparece tras el Suspense.
  useLayoutEffect(() => {
    gl.compile(rootScene, camera);
  }, [gl, rootScene, camera, scene]);

  return <Clone object={scene} scale={0.6} rotation={[Math.PI, Math.PI, 0]} />;
}

useGLTF.preload(MODEL_URL);
