"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import gsap from "gsap";
import Scene from "./Scene";
import ControlPanel from "./ui/ControlPanel";
import TelemetryPanel from "./ui/TelemetryPanel";
import AnalysisPanel from "./ui/AnalysisPanel";
import CanvasControls from "./ui/CanvasControls";
import { DEFAULT_FOV, FOV_STEP, MAX_FOV, MIN_FOV } from "@/lib/physics";
import { DEFAULT_PARAMS, type SimParams, type Telemetry } from "@/lib/types";

const THEORY_ID = "teoria";

export default function SimulationApp() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [ignitionId, setIgnitionId] = useState(0);
  const [resetId, setResetId] = useState(0);
  const [thrusting, setThrusting] = useState(false);
  // El panel de análisis solo se revela cuando concluye el vuelo (auto-reinicio).
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [fov, setFov] = useState(DEFAULT_FOV);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    velocity: 0,
    acceleration: 0,
  });

  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const handleTelemetry = useCallback((t: Telemetry) => setTelemetry(t), []);

  // El estado de encendido lo reporta el motor físico (Drone), de modo que la
  // interfaz siempre coincide con la duración real del empuje aunque se cambien
  // los parámetros a mitad del encendido.
  const handleThrustingChange = useCallback(
    (value: boolean) => setThrusting(value),
    [],
  );

  // El panel queda oculto al iniciar el vuelo; solo reaparece al concluir.
  const handleIgnition = useCallback(() => {
    setIgnitionId((n) => n + 1);
    setShowAnalysis(false);
  }, []);

  const handleReset = useCallback(() => {
    setResetId((n) => n + 1);
    setTelemetry({ velocity: 0, acceleration: 0 });
    setShowAnalysis(false);
  }, []);

  // Cambiar parámetros invalida el informe anterior: se oculta el panel.
  const handleParamsChange = useCallback((next: SimParams) => {
    setParams(next);
    setShowAnalysis(false);
  }, []);

  // El vuelo concluyó (el dron superó la altitud máxima y se reinició solo).
  const handleFlightComplete = useCallback(() => setShowAnalysis(true), []);

  const handleZoomIn = useCallback(
    () => setFov((f) => Math.max(MIN_FOV, f - FOV_STEP)),
    [],
  );
  const handleZoomOut = useCallback(
    () => setFov((f) => Math.min(MAX_FOV, f + FOV_STEP)),
    [],
  );

  // Animaciones de entrada con GSAP.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (overlayRef.current) {
        gsap.from(overlayRef.current.querySelectorAll("[data-anim]"), {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.2,
        });
      }
      if (infoRef.current) {
        gsap.from(infoRef.current.querySelectorAll("[data-card]"), {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.12,
          delay: 0.6,
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root>
      <main ref={rootRef} className="relative">
        {/* Escena 3D (fondo fijo) */}
        <Scene
          params={params}
          ignitionId={ignitionId}
          resetId={resetId}
          fov={fov}
          onTelemetry={handleTelemetry}
          onThrustingChange={handleThrustingChange}
          onFlightComplete={handleFlightComplete}
        />

        {/* Capa de interfaz */}
        <div
          ref={overlayRef}
          className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div data-anim>
              <ControlPanel
                params={params}
                onChange={handleParamsChange}
                onIgnition={handleIgnition}
                onReset={handleReset}
                thrusting={thrusting}
              />
            </div>
            <div className="flex flex-col items-end gap-4">
              <div data-anim>
                <TelemetryPanel telemetry={telemetry} />
              </div>
              <AnalysisPanel
                show={showAnalysis}
                thrusting={thrusting}
                params={params}
              />
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div
              data-anim
              className="pointer-events-auto rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-xs backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-6 rounded-full bg-green-500" />
                <span className="text-zinc-300">Reacción (empuje sobre el dron)</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-block h-2.5 w-6 rounded-full bg-red-500" />
                <span className="text-zinc-300">Acción (gases expulsados)</span>
              </div>
            </div>
            <div
              data-anim
              className="pointer-events-none hidden text-right text-xs text-zinc-500 sm:block"
            >
              Arrastra para orbitar · Usa +/− para acercar
            </div>
          </div>

          {/* Controles flotantes: zoom manual + acceso a la teoría */}
          <CanvasControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            theoryTarget={`#${THEORY_ID}`}
          />
        </div>

        {/* Espaciador para revelar la sección teórica al desplazar */}
        <div className="h-screen" aria-hidden />

        {/* Sección teórica (scroll suave con Lenis) */}
        <section
          id={THEORY_ID}
          ref={infoRef}
          className="relative z-20 border-t border-white/10 bg-zinc-950/85 px-6 py-20 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-3xl">
            <h2 data-card className="text-3xl font-bold text-white">
              La física detrás del experimento
            </h2>
            <p data-card className="mt-4 text-zinc-300">
              La <strong>Tercera Ley de Newton</strong> establece que para toda
              acción existe una reacción de igual magnitud y sentido opuesto.
              Cuando el dron expulsa propelente hacia abajo (la{" "}
              <span className="text-red-400">acción</span>), el propelente empuja
              al dron hacia arriba con la misma fuerza (la{" "}
              <span className="text-green-400">reacción</span>).
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div
                data-card
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="font-semibold text-cyan-300">Acción = Reacción</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  F<sub>gases</sub> = −F<sub>dron</sub>. Las fuerzas son iguales y
                  opuestas, representadas por las flechas roja y verde.
                </p>
              </div>
              <div
                data-card
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="font-semibold text-cyan-300">Aceleración</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  a = F / m. A mayor masa del dron, menor aceleración para la
                  misma fuerza de eyección.
                </p>
              </div>
              <div
                data-card
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="font-semibold text-cyan-300">Gravedad cero</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Sin gravedad ni rozamiento, tras el encendido el dron mantiene
                  su velocidad (Primera Ley de Newton).
                </p>
              </div>
            </div>

            <p data-card className="mt-10 text-sm text-zinc-500">
              Ajusta los parámetros y pulsa <strong>Ignición</strong> para lanzar
              el dron. Usa <strong>Reiniciar</strong> para devolverlo al centro.
            </p>
          </div>
        </section>
      </main>
    </ReactLenis>
  );
}
