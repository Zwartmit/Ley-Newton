# Test Plan — GLB drone model + flat orientation

PR #1 (Zwartmit/Ley-Newton). Scope: load drone from single-file `/models/scene.glb`
and fix orientation so the quadcopter lies flat (`rotation={[Math.PI,0,0]}`), with the
exhaust emitter still at the bottom pointing down.

Environment: local dev server `http://localhost:3000` (already running).

## Test 1 — Model loads and lies flat, properly scaled
Steps:
1. Hard-reload `http://localhost:3000`; wait for the 28 MB GLB to load (primitive shows first, then swaps).
2. Observe the central drone.
Pass/fail:
- PASS if the rendered model is the **GLB quadcopter** (4 ring rotors + central body), NOT the
  primitive fallback (gray box + blue sphere + orange cone).
- PASS if the quadcopter is **flat/horizontal**: the 4 rotor rings appear as flattened
  (horizontal) discs arranged in an X around the body — NOT full circles facing the camera
  (which would mean it's still standing vertical, the bug).
- PASS if scale is reasonable: the model fits within the viewport (not clipping the panels,
  not a tiny dot) — visually ~⅓ of canvas width at default zoom.
- FAIL if rotors face the camera as full circles (vertical), or if only the primitive shows.

## Test 2 — Ignition: exhaust at bottom pointing down + flight
Steps:
1. Click **Ignición**.
2. Observe particles at the drone and the drone's motion; let the flight complete.
Pass/fail:
- PASS if exhaust particles emit from **below** the drone (around local −Y) and travel
  **downward**, while the drone accelerates **upward** (+Y). Telemetry velocity climbs > 0.
- PASS if after crossing the altitude threshold the drone auto-resets to center and the
  "Análisis del Sistema" modal appears.
- FAIL if particles emit from the top/side, or the drone does not move, or the exhaust
  position is visibly detached from the drone's base.

## Regression (quick)
- Telemetry at default 120 N / 8 kg should read acceleration `15,00 m/s²` during burn
  (confirms the rotation/model change didn't disturb physics wiring).
