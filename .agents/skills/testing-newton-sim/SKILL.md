---
name: testing-newton-sim
description: End-to-end test the Newton's Third Law 3D physics simulation. Use when verifying the 3D scene, ignition/thrust physics, telemetry, or action/reaction visuals.
---

# Testing the Newton's Third Law 3D Simulation

Single-page Next.js (App Router) app. UI is in Spanish. The whole feature is on one page with an always-visible overlay.

## Run it

```bash
npm install   # requires .npmrc legacy-peer-deps=true (react-lenis vs React 19)
npm run dev   # serves on http://localhost:3000
```

Verify it's up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` should return `200`.

## UI map (ControlPanel, top-left)

- Slider "Masa del propelente" (kg): 0.5–8, controls burn duration = `propellantMass * 0.45 s`.
- Slider "Fuerza de eyección" (N): 5–120, the action force F.
- Slider "Masa del dron" (kg): 4–40, sets the RigidBody collider mass (remounts the body via React `key`).
- Button "🔥 Ignición" — starts the burn; becomes "Encendido…" (disabled) while burning.
- Button "Reiniciar" — re-centers the drone and zeroes velocity/telemetry.
- TelemetryPanel (top-right): "Velocidad" (m/s) and "Aceleración" (m/s²), throttled to ~10 Hz.

## Core physics assertion (the thing that proves it works)

During a burn, acceleration must equal **F / m**:
- Defaults 120 N / 8 kg → **15.00 m/s²**.
- Set drone mass 40 kg → **3.00 m/s²** (this is the adversarial check: if mass weren't wired to the RigidBody, accel would stay ~15).

After the burn ends, acceleration → 0 and velocity **holds steady** (zero gravity, no damping = 1st law). Reiniciar returns velocity/acceleration to 0.00.

During a burn you should also see: green arrow up (reacción/thrust), red arrow down (acción/exhaust), and yellow particles ejecting downward from the nozzle.

## Testing tips / gotchas

- The drone accelerates upward (+Y) and flies out of view fast at low mass. To capture the arrows/particles and read a stable acceleration, use a **high drone mass (40 kg)** so it moves slowly and stays in frame. This doubles as the adversarial mass test.
- Read telemetry from the stripped DOM the computer tool returns (Velocidad/Aceleración text) — it's more reliable than reading the rendered numbers off the screenshot.
- Clicking near the bottom of the ControlPanel can accidentally drag a slider — verify the Ignición click landed by checking the button text changed to "Encendido…".
- Telemetry is throttled (~0.1 s), so after clicking Ignición wait ~1 s before screenshotting to catch a nonzero reading.
- **Software WebGL renderer (SwiftShader)** in headless envs can lose the WebGL context with heavy settings. The Scene is tuned for this (no shadows, `dpr=1`, `antialias:false`, reduced star count). If the canvas goes blank, suspect context loss, not logic.
- **Missing `scene.bin`**: the GLTF model intentionally falls back to a primitive drone (box + orange nozzle + cyan dome). A primitive drone is correct behavior, not a bug. The model only loads if `public/models/scene.bin` is present.
- `Scene` must be a **static import** (not `dynamic(..., {ssr:false})`) — the dynamic loading-swap under Strict Mode caused blank-canvas context loss.

## Commands

- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Build: `npm run build`

## Devin Secrets Needed

None. The app runs fully locally with no external services or auth.
