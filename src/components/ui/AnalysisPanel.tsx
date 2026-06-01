"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { SimParams } from "@/lib/types";

interface AnalysisPanelProps {
  /** Se muestra una vez que ha ocurrido al menos un encendido. */
  show: boolean;
  /** Encendido actualmente activo (resalta el panel). */
  thrusting: boolean;
  params: SimParams;
}

function Line({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <p className="leading-relaxed text-zinc-300">
      <span
        className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em]"
        style={{ color: accent, textShadow: `0 0 8px ${accent}` }}
      >
        {label}
      </span>{" "}
      {children}
    </p>
  );
}

/**
 * "Análisis del Sistema": panel educativo con estética cyberpunk que explica
 * en tiempo real la Tercera Ley de Newton inyectando las variables de estado.
 */
export default function AnalysisPanel({
  show,
  thrusting,
  params,
}: AnalysisPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { propellantMass, ejectionForce, droneMass } = params;
  const acceleration = droneMass > 0 ? ejectionForce / droneMass : 0;

  // Animación de entrada al revelarse el panel.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !show) return;
    const ctx = gsap.context(() => {
      // Solo opacidad/desenfoque para no pisar los `translate` de centrado del
      // modal en móvil (-translate-x-1/2 -translate-y-1/2).
      gsap.fromTo(
        el,
        { opacity: 0, filter: "blur(10px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        el.querySelectorAll("[data-row]"),
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.12,
          delay: 0.15,
        },
      );
    }, el);
    return () => ctx.revert();
  }, [show]);

  if (!show) return null;

  const num = (n: number, d = 2) =>
    n.toLocaleString("es", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

  return (
    <>
      {/* Fondo del modal (solo móvil): desenfoque intenso sobre toda la escena.
          Es puramente visual (pointer-events-none) para no atrapar al usuario. */}
      <div
        className="pointer-events-none fixed inset-0 z-20 bg-black/50 backdrop-blur-md md:hidden"
        aria-hidden
      />
      <div
        ref={rootRef}
        className={`pointer-events-auto fixed left-1/2 top-1/2 z-30 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-zinc-950/80 p-4 shadow-2xl backdrop-blur-2xl transition-colors duration-500 md:static md:left-auto md:top-auto md:z-auto md:w-[22rem] md:max-w-[calc(100vw-2rem)] md:translate-x-0 md:translate-y-0 md:bg-zinc-950/70 md:p-5 md:backdrop-blur-xl ${
          thrusting
            ? "border-fuchsia-400/60 shadow-[0_0_28px_-4px_rgba(232,121,249,0.55)]"
            : "border-cyan-400/30 shadow-[0_0_22px_-8px_rgba(34,211,238,0.5)]"
        }`}
      >
      {/* Línea superior de neón animada */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
          thrusting ? "via-fuchsia-400" : "via-cyan-400"
        }`}
      />

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          Análisis del Sistema
        </h2>
        <span
          className={`flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest ${
            thrusting ? "text-fuchsia-300" : "text-zinc-500"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              thrusting ? "animate-pulse bg-fuchsia-400" : "bg-zinc-600"
            }`}
          />
          {thrusting ? "Activo" : "En espera"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 text-sm">
        <div data-row>
          <Line label="Acción" accent="#f87171">
            El propulsor expulsó{" "}
            <span className="font-mono font-semibold text-white">
              {num(propellantMass, 1)} kg
            </span>{" "}
            de gas con una fuerza de{" "}
            <span className="font-mono font-semibold text-white">
              {num(ejectionForce, 0)} N
            </span>
            .
          </Line>
        </div>

        <div data-row>
          <Line label="Reacción" accent="#34d399">
            Según la Tercera Ley de Newton, se generó una fuerza de empuje
            idéntica de{" "}
            <span className="font-mono font-semibold text-white">
              {num(ejectionForce, 0)} N
            </span>{" "}
            en dirección opuesta sobre la estructura.
          </Line>
        </div>

        <div data-row>
          <Line label="Cinemática" accent="#22d3ee">
            Al tener el dron una masa fija de{" "}
            <span className="font-mono font-semibold text-white">
              {num(droneMass, 0)} kg
            </span>
            , esta fuerza de reacción ha generado una aceleración de{" "}
            <span
              className="font-mono font-bold text-fuchsia-300"
              style={{ textShadow: "0 0 10px rgba(232,121,249,0.7)" }}
            >
              {num(acceleration)} m/s²
            </span>
            .
          </Line>
        </div>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 font-mono text-[0.65rem] tracking-wider text-zinc-500">
        a = F / m = {num(ejectionForce, 0)} N / {num(droneMass, 0)} kg ={" "}
        {num(acceleration)} m/s²
      </div>
      </div>
    </>
  );
}
