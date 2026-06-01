# Test Report — GLB drone model + flat orientation (PR #1)

**Commit tested:** `ecbe23b` · **Env:** local dev `http://localhost:3000` · **Result: 2/2 passed**

Scope: load the drone from the single-file `/models/scene.glb` and fix orientation so
the quadcopter lies flat (`rotation={[Math.PI,0,0]}`), with the exhaust emitter still at
the base pointing down.

## Results
- ✅ **Test 1 — GLB loads flat & scaled:** the GLB quadcopter (4 ring rotors + body) renders,
  laid flat/horizontal (rotor rings are horizontal discs, not vertical circles). Properly
  scaled within the viewport.
- ✅ **Test 2 — Ignition / exhaust / flight:** exhaust emits from the drone base pointing
  downward while the drone ascends; auto-resets to center and the Análisis modal appears.
- ✅ **Regression — physics:** acceleration reads `15,00 m/s²` (= 120 N / 8 kg), confirming
  the model/rotation change didn't disturb the physics wiring.

## Evidence

| 🟢 Test 1 — drone laid flat (idle) | 🟢 Test 2 — exhaust at base, ascending |
|---|---|
| ![Flat GLB quadcopter idle](https://app.devin.ai/attachments/08dff2e7-89e9-429c-be7c-69f8120ddc88/screenshot_8803d14b914c48f2bdabd72f7ea79cb0.png) | ![Exhaust at base while climbing](https://app.devin.ai/attachments/c4f3bcf9-1f44-4039-8cfb-7a1e6db386bc/screenshot_6931315a20bf4baf8c8d59fe1beb1437.png) |
| Rotor rings horizontal → flat orientation | Flame + red arrow below body; a=15.00 m/s² |

| 🟢 Auto-reset + Análisis modal |
|---|
| ![Auto-reset and analysis modal](https://app.devin.ai/attachments/82e4c798-6b1f-4f6b-b8f9-065313e20b1c/screenshot_76647792305744e28a135b0e23d62615.png) |
| Drone back at center (flat kept); modal: F=120 N, m=8 kg, a=120/8=15,00 m/s² |

## Notes
- The exhaust emitter (`ExhaustParticles`) is a sibling of the model inside the `RigidBody`,
  emitting from `(0, -0.95, 0)`, so the model's internal rotation does not move it.
- `npm run lint` and `npx tsc --noEmit` pass; CI (Netlify deploy preview) green.
