---
name: testing-newton-sim
description: Test the Newton's Third Law 3D simulator (Next.js + R3F + Rapier) end-to-end. Use when verifying physics, telemetry, camera tracking, or responsive/mobile UI changes.
---

# Testing the Newton's Third Law 3D Simulator

Interactive 3D physics sim: a drone ejects propellant and accelerates per `a = F / m` in zero gravity. Stack: Next.js (App Router) + React, @react-three/fiber/drei, @react-three/rapier, Tailwind, GSAP + react-lenis. UI text is in Spanish.

## Run it

```bash
cd /home/ubuntu/repos/Ley-Newton
npm install        # if needed
npm run dev        # serves http://localhost:3000
```

Static checks before/after changes:
```bash
npm run lint
npx tsc --noEmit
npm run build
```
No CI is configured on the repo, so these local checks are the gate.

## Key UI elements (Spanish)

- **Ignición** button: starts the burn. Shows **Encendido…** while thrusting, re-enables when the burn ends (the `Drone` component is the single source of truth for thrust state via `onThrustingChange`).
- **Reiniciar**: re-centers drone, zeroes velocity.
- Sliders: Masa del propelente (burn duration), Fuerza de eyección (force N), Masa del dron (RigidBody mass).
- **Telemetría** panel (top-right on desktop): Velocidad, Aceleración. Hidden on mobile (`hidden md:block`).
- **Análisis del Sistema** panel: appears ONLY after the flight auto-completes (drone crosses `MAX_ALTITUDE` ~Y>40, auto-resets to [0,0,0]). Hidden on Ignición click and on param change.
- Zoom +/- buttons and **Conoce la Teoría ↓** scroll button.

## Physics assertions to verify

- Default 120 N / 8 kg → acceleration reads **15.00 m/s²**.
- Change drone mass to 40 kg → acceleration **3.00 m/s²** (proves mass wired to RigidBody). Adversarial check that distinguishes a real impulse from a hardcoded value.
- After burn ends, acceleration returns to **0.00** (no spike) and velocity holds (1st law, zero gravity).
- The Análisis panel values must match telemetry.

## Camera tracking

The camera follows the drone by **position** (`camera.position.y` lerps toward `baseCamY + droneY`), not just `lookAt` rotation — so the drone stays framed even at high speed. On auto-reset it lerps back to the base height. To test: click Ignición, confirm the drone stays centered/framed through the whole ascent and the view returns to center after auto-reset.

## Mobile / responsive testing (IMPORTANT)

Prefer resizing the **real Chrome window** over DevTools device emulation. When DevTools is docked, its device-mode viewport can be unreliable and may still render desktop-only panels — leading to false negatives. Resize the actual window instead:

```bash
# install once
sudo apt-get install -y wmctrl
# un-maximize, then set a narrow mobile-sized window
wmctrl -r :ACTIVE: -b remove,maximized_vert,maximized_horz
wmctrl -r :ACTIVE: -e 0,60,10,420,730   # x=60,y=10,w=420,h=730
# restore desktop afterwards
wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz
```
Reload the page after resizing so layout/state reset cleanly.

Verify with the console (via browser_console):
```js
// no horizontal overflow
document.documentElement.scrollWidth <= window.innerWidth
// analysis panel centered & not overflowing right (after a flight completes)
const el=[...document.querySelectorAll('div')].find(d=>typeof d.className==='string'&&d.className.includes('bottom-32'));
const r=el.getBoundingClientRect(); ({width:r.width, right:r.right, iw:window.innerWidth, overflowRight:r.right>window.innerWidth});
```

Mobile expectations (breakpoint `md`): control panel narrower/compact, **Telemetría hidden** (absent from DOM), color legend hidden, **Análisis del Sistema** centered at bottom (`fixed bottom-32 left-1/2 -translate-x-1/2 w-[90vw]`) with no right-edge overflow, zoom buttons bottom-right above the theory button. Desktop (`md:`) must keep the original layout (regression check).

Caveat: a very short test window (viewport height < ~700px) can make `bottom-32` panels overlap the top control panel; this is an artifact of the short window, not a real bug — a real phone (height ≥ 800px) has room. Judge horizontal centering/overflow separately from vertical overlap.

## GLTF model note

The drone falls back to primitives (caja + tobera) because `scene.bin` was never provided. Drop `scene.bin` into `public/models/` to enable the real GLTF model — no code change needed. A blank canvas in the past was caused by `dynamic(ssr:false)` losing the WebGL context under Strict Mode; `Scene` is now a static import.

## Recording

Maximize the window before recording desktop tests (`wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`). Annotate camera-tracking, mobile-layout, and regression sections.

## Devin Secrets Needed

None — frontend only, no auth or external services.
