"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ReactLenis } from "@studio-freight/react-lenis";
import gsap from "gsap";
import ControlPanel from "./ui/ControlPanel";
import TelemetryPanel from "./ui/TelemetryPanel";
import {
  BURN_SECONDS_PER_KG,
  DEFAULT_PARAMS,
  type SimParams,
  type Telemetry,
} from "@/lib/types";

// La escena 3D depende del DOM/WebGL: se carga solo en el cliente.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 grid place-items-center bg-[#05060a] text-zinc-500">
      Cargando escena 3D…
    </div>
  ),
});

export default function SimulationApp() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [ignitionId, setIgnitionId] = useState(0);
  const [resetId, setResetId] = useState(0);
  const [thrusting, setThrusting] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    velocity: 0,
    acceleration: 0,
  });

  const burnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const handleTelemetry = useCallback((t: Telemetry) => setTelemetry(t), []);

  const handleIgnition = useCallback(() => {
    setIgnitionId((n) => n + 1);
    setThrusting(true);
    if (burnTimer.current) clearTimeout(burnTimer.current);
    const burnMs = params.propellantMass * BURN_SECONDS_PER_KG * 1000;
    burnTimer.current = setTimeout(() => setThrusting(false), burnMs);
  }, [params.propellantMass]);

  const handleReset = useCallback(() => {
    setResetId((n) => n + 1);
    setThrusting(false);
    if (burnTimer.current) clearTimeout(burnTimer.current);
    setTelemetry({ velocity: 0, acceleration: 0 });
  }, []);

  useEffect(() => {
    return () => {
      if (burnTimer.current) clearTimeout(burnTimer.current);
    };
  }, []);

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
    });
    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root>
      <main className="relative">
        {/* Escena 3D (fondo fijo) */}
        <Scene
          params={params}
          ignitionId={ignitionId}
          resetId={resetId}
          onTelemetry={handleTelemetry}
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
                onChange={setParams}
                onIgnition={handleIgnition}
                onReset={handleReset}
                thrusting={thrusting}
              />
            </div>
            <div data-anim>
              <TelemetryPanel telemetry={telemetry} />
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
              Arrastra para orbitar · Rueda para acercar
              <div className="mt-1 animate-pulse text-zinc-400">
                ↓ Desplázate para conocer la teoría
              </div>
            </div>
          </div>
        </div>

        {/* Espaciador para revelar la sección teórica al desplazar */}
        <div className="h-screen" aria-hidden />

        {/* Sección teórica (scroll suave con Lenis) */}
        <section
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
