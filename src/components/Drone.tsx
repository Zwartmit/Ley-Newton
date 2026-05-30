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
import {
  BURN_SECONDS_PER_KG,
  THRUST_AXIS,
  type SimParams,
  type Telemetry,
} from "@/lib/types";

interface DroneProps {
  params: SimParams;
  ignitionId: number;
  resetId: number;
  onTelemetry: (t: Telemetry) => void;
}

export default function Drone({
  params,
  ignitionId,
  resetId,
  onTelemetry,
}: DroneProps) {
  const body = useRef<RapierRigidBody>(null);
  const [thrusting, setThrusting] = useState(false);

  const burnStart = useRef(Number.NEGATIVE_INFINITY); // instante (s) de inicio del encendido
  const prevSpeed = useRef(0);
  const reportAcc = useRef(0); // acumulador para limitar la frecuencia de telemetría

  // Disparar el encendido cuando cambia ignitionId.
  useEffect(() => {
    if (ignitionId === 0 || !body.current) return;
    burnStart.current = performance.now() / 1000;
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
    burnStart.current = Number.NEGATIVE_INFINITY;
    prevSpeed.current = 0;
    setThrusting(false);
    onTelemetry({ velocity: 0, acceleration: 0 });
  }, [resetId, onTelemetry]);

  useFrame((_, delta) => {
    const rb = body.current;
    if (!rb) return;
    const dt = Math.min(delta, 0.05);
    const now = performance.now() / 1000;
    const burnDuration = params.propellantMass * BURN_SECONDS_PER_KG;
    const isBurning = now - burnStart.current < burnDuration;

    if (isBurning) {
      // Reacción: impulso sobre el dron (J = F·dt) en la dirección de empuje.
      const f = params.ejectionForce * dt;
      rb.applyImpulse(
        { x: THRUST_AXIS[0] * f, y: THRUST_AXIS[1] * f, z: THRUST_AXIS[2] * f },
        true,
      );
      if (!thrusting) setThrusting(true);
    } else if (thrusting) {
      setThrusting(false);
    }

    // Telemetría: rapidez y aceleración instantánea.
    const v = rb.linvel();
    const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    const accel = dt > 0 ? (speed - prevSpeed.current) / dt : 0;
    prevSpeed.current = speed;

    reportAcc.current += dt;
    if (reportAcc.current >= 0.1) {
      reportAcc.current = 0;
      onTelemetry({ velocity: speed, acceleration: Math.max(accel, 0) });
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
      <CuboidCollider args={[0.8, 0.45, 0.8]} mass={params.droneMass} />
      <DroneModel />
      <ThrustArrows visible={thrusting} magnitude={params.ejectionForce} />
      <ExhaustParticles active={thrusting} />
    </RigidBody>
  );
}
