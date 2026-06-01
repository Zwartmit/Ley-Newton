"use client";

import type { SimParams } from "@/lib/types";

interface SliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
  disabled?: boolean;
}

function Slider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  hint,
  disabled,
}: SliderProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        <span className="font-mono text-sm tabular-nums text-cyan-300">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-400 disabled:cursor-not-allowed"
      />
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

interface ControlPanelProps {
  params: SimParams;
  onChange: (params: SimParams) => void;
  onIgnition: () => void;
  onReset: () => void;
  thrusting: boolean;
}

export default function ControlPanel({
  params,
  onChange,
  onIgnition,
  onReset,
  thrusting,
}: ControlPanelProps) {
  const set = (patch: Partial<SimParams>) => onChange({ ...params, ...patch });

  return (
    <div className="pointer-events-auto w-[20rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur-md">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-white">
          Tercera Ley de Newton
        </h1>
        <p className="text-xs text-zinc-400">
          Acción y reacción en gravedad cero
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Slider
          label="Masa del propelente"
          unit="kg"
          value={params.propellantMass}
          min={0.5}
          max={8}
          step={0.5}
          onChange={(v) => set({ propellantMass: v })}
          hint="Más propelente = encendido más largo"
        />
        <Slider
          label="Fuerza de eyección"
          unit="N"
          value={params.ejectionForce}
          min={5}
          max={120}
          step={1}
          onChange={(v) => set({ ejectionForce: v })}
          hint="Magnitud de la acción (gases expulsados)"
        />
        <Slider
          label="Masa del dron"
          unit="kg"
          value={params.droneMass}
          min={4}
          max={40}
          step={1}
          onChange={(v) => set({ droneMass: v })}
          hint="Define la masa del cuerpo rígido (reinicia la nave)"
          disabled={thrusting}
        />
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onIgnition}
          disabled={thrusting}
          className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-orange-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {thrusting ? "Encendido…" : "🔥 Ignición"}
        </button>
        <button
          onClick={onReset}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
