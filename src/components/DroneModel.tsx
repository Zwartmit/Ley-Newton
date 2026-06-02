"use client";

import { useLayoutEffect } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const MODEL_URL = "/models/scene-transformed.glb";

// El cohete viene con geometría desplazada del origen (centro ≈ y −153) y a
// escala nativa muy grande (alto ≈ 26,9 u). Lo recentramos al origen y lo
// reescalamos para integrarlo en la escena. El nozzle de empuje está en
// y = −0.95 (ver NOZZLE_Y), así que apoyamos la base del cohete justo ahí.
const MODEL_CENTER: [number, number, number] = [1.312, -153.314, -392.6];
const MODEL_SCALE = 0.12;
const MODEL_HEIGHT = 26.88; // alto nativo en Y (bbox)
const NOZZLE_Y = -0.95;
// La base del cohete (extremo inferior) queda a la altura del nozzle.
const GROUP_Y = NOZZLE_Y + (MODEL_HEIGHT * MODEL_SCALE) / 2;

/**
 * Carga el modelo GLB del cohete mediante `useGLTF` (caché de drei).
 *
 * El cohete ya está orientado vertical (alto en Y, morro hacia +Y), que coincide
 * con el eje de empuje. Lo recentramos con el `position` del `<Clone>` y aplicamos
 * escala/posición vertical en el grupo contenedor. Usamos `<Clone>` en lugar de
 * `<primitive>` para que cada montaje renderice su propia copia del grafo: así,
 * cuando el `RigidBody` se remonta al cambiar la masa, el modelo se sirve al
 * instante desde la caché y no se muta un objeto compartido.
 */
export default function DroneModel() {
  const { scene } = useGLTF(MODEL_URL);
  const gl = useThree((s) => s.gl);
  const rootScene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  // Precompilamos los shaders del modelo ya montado para evitar el tirón
  // (compilación en GPU) justo cuando el cohete aparece tras el Suspense.
  useLayoutEffect(() => {
    gl.compile(rootScene, camera);
  }, [gl, rootScene, camera, scene]);

  return (
    <group position={[0, GROUP_Y, 0]} scale={MODEL_SCALE}>
      <Clone
        object={scene}
        position={[-MODEL_CENTER[0], -MODEL_CENTER[1], -MODEL_CENTER[2]]}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
