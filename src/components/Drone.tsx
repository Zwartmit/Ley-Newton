"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import DroneModel from "./DroneModel";
import ThrustArrows from "./ThrustArrows";
import ExhaustParticles from "./ExhaustParticles";
import type { SimParams, Telemetry } from "@/lib/types";
import {
  BURN_SECONDS_PER_KG,
  MAX_FRAME_DT,
  TELEMETRY_INTERVAL,
  THRUST_AXIS,
} from "@/lib/physics";

interface DroneProps {
  params: SimParams;
  ignitionId: number;
  resetId: number;
  onTelemetry: (t: Telemetry) => void;
  onThrustingChange: (thrusting: boolean) => void;
}

export default function Drone({
  params,
  ignitionId,
  resetId,
  onTelemetry,
  onThrustingChange,
}: DroneProps) {
  const body = useRef<RapierRigidBody>(null);
  const [thrusting, setThrusting] = useState(false);

  const burning = useRef(false); // ¿hay encendido activo? (fuente de verdad de la física)
  const burnElapsed = useRef(0); // tiempo (s) acumulado de encendido, integrado por frame
  const prevAxialV = useRef(0); // componente de la velocidad sobre el eje de empuje
  const reportAcc = useRef(0); // acumulador para limitar la frecuencia de telemetría

  // El motor físico es la única fuente de verdad del estado de encendido: lo
  // notificamos hacia arriba para que la interfaz siempre coincida con la física.
  useEffect(() => {
    onThrustingChange(thrusting);
  }, [thrusting, onThrustingChange]);

  // Disparar el encendido cuando cambia ignitionId.
  useEffect(() => {
    if (ignitionId === 0 || !body.current) return;
    burnElapsed.current = 0;
    burning.current = true;
    setThrusting(true);
  }, [ignitionId]);

  // Reiniciar posición/velocidad cuando cambia resetId.
  useEffect(() => {
    const rb = body.current;
    if (!rb) return;
    rb.setTranslation({ x: 0, y: 0, z: 0 }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    burning.current = false;
    burnElapsed.current = 0;
    prevAxialV.current = 0;
    setThrusting(false);
    onTelemetry({ velocity: 0, acceleration: 0 });
  }, [resetId, onTelemetry]);

  useFrame((_, delta) => {
    const rb = body.current;
    if (!rb) return;
    const dt = Math.min(delta, MAX_FRAME_DT);
    const burnDuration = params.propellantMass * BURN_SECONDS_PER_KG;

    if (burning.current) {
      // El encendido se integra por frame (∫F·dt), de modo que el impulso total
      // no depende de la tasa de frames y respeta los cambios de parámetros en vivo.
      burnElapsed.current += dt;
      if (burnElapsed.current < burnDuration) {
        // Reacción: impulso sobre el dron (J = F·dt) en la dirección de empuje.
        const f = params.ejectionForce * dt;
        rb.applyImpulse(
          { x: THRUST_AXIS[0] * f, y: THRUST_AXIS[1] * f, z: THRUST_AXIS[2] * f },
          true,
        );
      } else {
        burning.current = false;
        setThrusting(false);
      }
    }

    // Telemetría: rapidez (módulo) y aceleración a lo largo del eje de empuje.
    const v = rb.linvel();
    const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    const axialV =
      v.x * THRUST_AXIS[0] + v.y * THRUST_AXIS[1] + v.z * THRUST_AXIS[2];
    const accel = dt > 0 ? (axialV - prevAxialV.current) / dt : 0;
    prevAxialV.current = axialV;

    reportAcc.current += dt;
    if (reportAcc.current >= TELEMETRY_INTERVAL) {
      reportAcc.current = 0;
      onTelemetry({ velocity: speed, acceleration: accel });
    }
  });

  return (
    <RigidBody
      ref={body}
      key={params.droneMass} // remontar para aplicar la nueva masa
      colliders={false}
      gravityScale={0}
      linearDamping={0}
      angularDamping={0.6}
    >
      <CuboidCollider args={[0.8, 0.35, 0.8]} mass={params.droneMass} />
      <DroneModel />
      <ThrustArrows visible={thrusting} magnitude={params.ejectionForce} />
      <ExhaustParticles active={thrusting} />
    </RigidBody>
  );
}
