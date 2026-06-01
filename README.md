# Tercera Ley de Newton — Simulador 3D

Simulación interactiva de física 3D que demuestra la **Tercera Ley de Newton**
(acción y reacción) con un dron/satélite en un entorno de **gravedad cero**.

Al pulsar **Ignición**, el dron expulsa propelente por su tobera (acción) y, por la
Tercera Ley de Newton, recibe un empuje de igual magnitud y sentido opuesto
(reacción). Los vectores de fuerza y un sistema de partículas visualizan el efecto,
mientras un panel de telemetría muestra la velocidad y la aceleración en tiempo real.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** para la interfaz
- **@react-three/fiber** + **@react-three/drei** para la escena 3D
- **@react-three/rapier** como motor de física (gravedad `[0, 0, 0]`)
- **GSAP** + **@studio-freight/react-lenis** para animaciones y scroll suave

## Arquitectura

```
src/
├─ app/
│  ├─ layout.tsx          Metadatos y layout raíz (es)
│  └─ page.tsx            Punto de entrada (renderiza SimulationApp)
├─ components/
│  ├─ SimulationApp.tsx   Cliente: estado, Lenis, GSAP y overlays de UI
│  ├─ Scene.tsx           Canvas, luces, OrbitControls y mundo físico
│  ├─ Drone.tsx           RigidBody dinámico, lógica de impulso y telemetría
│  ├─ DroneModel.tsx      Modelo GLTF (useGLTF) con respaldo a primitivas
│  ├─ ThrustArrows.tsx    Vectores 3D de acción (rojo) y reacción (verde)
│  ├─ ExhaustParticles.tsx Emisor de partículas de gas (InstancedMesh)
│  └─ ui/
│     ├─ ControlPanel.tsx     Sliders, botón de ignición y reinicio
│     └─ TelemetryPanel.tsx   Velocidad y aceleración en tiempo real
└─ lib/
   └─ types.ts            Tipos y constantes compartidas
```

## Física (acción y reacción)

- El mundo de Rapier usa gravedad `[0, 0, 0]`.
- Durante el encendido se aplica un impulso `J = F · dt` al `RigidBody` en la
  dirección de empuje (reacción), donde `F` es la **fuerza de eyección**.
- La **masa del propelente** define la duración del encendido
  (`t = masaPropelente · 0.45 s/kg`).
- La **masa del dron** define la masa del cuerpo rígido, por lo que la
  aceleración resultante es `a = F / m`.
- Sin gravedad ni rozamiento, tras el encendido el dron conserva su velocidad
  (Primera Ley de Newton). Usa **Reiniciar** para devolverlo al centro.

## Modelo 3D del dron

El dron se carga desde `public/models/scene.gltf` con `useGLTF`. Si el modelo no
puede cargarse (por ejemplo, falta el binario `scene.bin`), un *error boundary*
muestra automáticamente un dron compuesto con primitivas (caja + tobera).

> Nota: el archivo `scene.bin` referenciado por `scene.gltf` no se incluyó en el
> adjunto original. Colócalo junto a `scene.gltf` en `public/models/` para activar
> el modelo importado.

## Desarrollo

```bash
npm install        # usa legacy-peer-deps (ver .npmrc)
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run lint       # ESLint
```

> El proyecto incluye un `.npmrc` con `legacy-peer-deps=true` porque
> `@studio-freight/react-lenis` declara peers de React ≤ 18 (está deprecado),
> mientras que el proyecto usa React 19.
