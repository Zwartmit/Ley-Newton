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

export const DEFAULT_PARAMS: SimParams = {
  propellantMass: 4,
  ejectionForce: 120,
  droneMass: 8,
};
