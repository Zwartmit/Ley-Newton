export interface SimParams {
  /** Masa del propelente expulsado (kg). Determina la duración del encendido. */
  propellantMass: number;
  /** Fuerza de eyección del propelente (N). Magnitud de la acción. */
  ejectionForce: number;
  /** Masa de la nave/dron (kg). Define la masa del RigidBody. */
  droneMass: number;
}

export interface Telemetry {
  /** Rapidez actual del dron (m/s). */
  velocity: number;
  /** Aceleración instantánea del dron (m/s²). */
  acceleration: number;
}

/** Señal de encendido: el id se incrementa en cada ignición para disparar el efecto. */
export interface IgnitionSignal {
  id: number;
}

/** Segundos de encendido por cada kg de propelente. */
export const BURN_SECONDS_PER_KG = 0.45;

/** Dirección de empuje (reacción) en el espacio del mundo. */
export const THRUST_AXIS: [number, number, number] = [0, 1, 0];

export const DEFAULT_PARAMS: SimParams = {
  propellantMass: 4,
  ejectionForce: 120,
  droneMass: 8,
};
