import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from '../../hooks/useControls';
import { useGame } from '../../contexts/GameContext';

const SOUNDS = {
  engine: "https://assets.mixkit.co/sfx/preview/mixkit-sports-car-engine-loop-2538.mp3",
  shoot: "https://assets.mixkit.co/sfx/preview/mixkit-laser-weapon-shot-1681.mp3",
  crash: "https://assets.mixkit.co/sfx/preview/mixkit-car-collision-debris-749.mp3",
};

const CAR_CONFIG = {
  width: 1.2,
  height: 0.7,
  front: 1.5,
  mass: 1500,
  wheelRadius: 0.35,
};

const DamagePart = ({ args, position, rotation, color, damage = 0 }: any) => {
  // Simulates denting/deformation based on damage level
  const dent = useMemo(() => ({
    x: (Math.random() - 0.5) * damage * 0.2,
    y: (Math.random() - 0.5) * damage * 0.1,
    z: (Math.random() - 0.5) * damage * 0.2,
    rx: (Math.random() - 0.5) * damage * 0.3,
  }), [damage > 0.5]); // Only recalculate on significant damage

  return (
    <mesh 
      position={[position[0] + dent.x, position[1] + dent.y, position[2] + dent.z]} 
      rotation={[rotation[0] + dent.rx, rotation[1], rotation[2]]}
      castShadow
    >
      <boxGeometry args={args} />
      <meshPhysicalMaterial 
        color={color} 
        metalness={0.6} 
        roughness={0.2}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        emissive={damage > 0.8 ? "red" : "black"}
        emissiveIntensity={damage * 0.5}
      />
    </mesh>
  );
};

export const Car = ({ position = [0, 5, 0], rotation = [0, 0, 0], chassisRef }: { position?: [number, number, number], rotation?: [number, number, number], chassisRef?: React.RefObject<THREE.Group> }) => {
  const { forward, backward, left, right, boost, isDrifting, fire, signalLeft, signalRight, exit } = useControls();
  const { setTelemetry, isPlayerInCar, setIsPlayerInCar } = useGame();
  const [health, setHealth] = useState(100);
  const [indicatorsOn, setIndicatorsOn] = useState(false);
  const [damageZones, setDamageZones] = useState({ front: 0, back: 0, left: 0, right: 0 });
  const velocity = useRef([0, 0, 0]);
  const boostLevel = useRef(100);
  const lastTelemetryUpdate = useRef(0);

  const innerChassisRef = useRef<THREE.Group>(null);
  const activeChassisRef = chassisRef || innerChassisRef;

  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: [CAR_CONFIG.width, CAR_CONFIG.height, CAR_CONFIG.front * 2],
    mass: CAR_CONFIG.mass,
    position,
    rotation,
    onCollide: (e) => {
      const impact = e.contact.impactVelocity;
      if (impact > 5) {
        setHealth(h => Math.max(0, h - impact / 2));
        if (crashSfx.current && !crashSfx.current.isPlaying) {
          crashSfx.current.setVolume(Math.min(1, impact / 20));
          crashSfx.current.play();
        }
        setDamageZones(dz => ({
           ...dz,
           front: Math.min(1, dz.front + impact / 50)
        }));
      }
    }
  }), activeChassisRef);

  // Track velocity from cannon
  useEffect(() => {
    const unsub = chassisApi.velocity.subscribe(v => velocity.current = v);
    return unsub;
  }, [chassisApi]);
  const [bullets, setBullets] = useState<{ id: number, pos: THREE.Vector3, dir: THREE.Vector3 }[]>([]);
  const bulletId = useRef(0);
  const lastFire = useRef<number>(0);

  const engineSfx = useRef<THREE.PositionalAudio>(null);
  const crashSfx = useRef<THREE.PositionalAudio>(null);
  const shootSfx = useRef<THREE.PositionalAudio>(null);

  const wheelInfo = {
    radius: CAR_CONFIG.wheelRadius,
    directionLocal: [0, -1, 0] as [number, number, number],
    suspensionStiffness: 35,
    suspensionRestLength: 0.3,
    maxSuspensionForce: 100000,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    frictionSlip: 5,
    rollInfluence: 0.01,
    axleLocal: [-1, 0, 0] as [number, number, number],
    chassisConnectionPointLocal: [1, 0, 1] as [number, number, number],
  };

  const wheelInfos = [
    { ...wheelInfo, chassisConnectionPointLocal: [-CAR_CONFIG.width / 1.5, -0.2, 1] as [number, number, number], isFrontWheel: true },
    { ...wheelInfo, chassisConnectionPointLocal: [CAR_CONFIG.width / 1.5, -0.2, 1] as [number, number, number], isFrontWheel: true },
    { ...wheelInfo, chassisConnectionPointLocal: [-CAR_CONFIG.width / 1.5, -0.2, -1] as [number, number, number], isFrontWheel: false },
    { ...wheelInfo, chassisConnectionPointLocal: [CAR_CONFIG.width / 1.5, -0.2, -1] as [number, number, number], isFrontWheel: false },
  ];

  const wheels = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody,
    wheelInfos,
    wheels,
  }), useRef<THREE.Group>(null));

  const smokeRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!isPlayerInCar) {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
      vehicleApi.setSteeringValue(0, 0);
      vehicleApi.setSteeringValue(0, 1);
      vehicleApi.setBrake(10, 2); // Apply some parking brake
      vehicleApi.setBrake(10, 3);
      return;
    }

    if (exit) {
      setIsPlayerInCar(false);
      return;
    }

    const force = 1800;
    const steer = 0.5;

    // Handle Boost depletion
    if (boost && boostLevel.current > 0) {
      boostLevel.current = Math.max(0, boostLevel.current - 0.5);
    } else {
      boostLevel.current = Math.min(100, boostLevel.current + 0.1);
    }

    let engineForce = 0;
    if (forward) engineForce = force * (boost && boostLevel.current > 5 ? 2.5 : 1);
    if (backward && !isDrifting) engineForce = -force / 2;

    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);

    const steerValue = left ? steer : right ? -steer : 0;
    vehicleApi.setSteeringValue(steerValue, 0);
    vehicleApi.setSteeringValue(steerValue, 1);

    if (isDrifting) {
      if (left) chassisApi.applyImpulse([500, 0, 0], [0, 0, -1]);
      if (right) chassisApi.applyImpulse([-500, 0, 0], [0, 0, -1]);
      vehicleApi.setBrake(15, 2);
      vehicleApi.setBrake(15, 3);
    } else {
      vehicleApi.setBrake(0, 2);
      vehicleApi.setBrake(0, 3);
    }

    // Firing
    if (fire && state.clock.getElapsedTime() - (lastFire.current || 0) > 0.15) {
      lastFire.current = state.clock.getElapsedTime();
      const pos = new THREE.Vector3();
      chassisBody.current?.getWorldPosition(pos);
      const dir = new THREE.Vector3(0, 0, 1);
      dir.applyQuaternion(chassisBody.current!.quaternion);
      setBullets(prev => [...prev, { id: bulletId.current++, pos: pos.clone().add(dir.clone().multiplyScalar(2)), dir }].slice(-15));
    }

    setBullets(prev => prev.map(b => ({ ...b, pos: b.pos.clone().add(b.dir.clone().multiplyScalar(1.2)) })));

    // Audio modulation
    if (engineSfx.current) {
      const speedFactor = forward ? (boost ? 2.5 : 1.5) : 1;
      engineSfx.current.setPlaybackRate(0.5 + speedFactor * 0.5);
      engineSfx.current.setVolume(0.3 + speedFactor * 0.4);
    }

    if (fire && shootSfx.current && !shootSfx.current.isPlaying) {
      shootSfx.current.stop();
      shootSfx.current.play();
    }

    // Particles logic (Smoke & Fire)
    if (smokeRef.current && health < 50) {
      smokeRef.current.visible = true;
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i+1] += 0.05 * Math.random(); // Rise
        if (positions[i+1] > 2) {
           positions[i+1] = 0;
           positions[i] = (Math.random() - 0.5) * 0.5;
           positions[i+2] = (Math.random() - 0.5) * 0.5;
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Indicator blinking
    setIndicatorsOn(Math.floor(state.clock.getElapsedTime() * 4) % 2 === 0);

    // Telemetry Heartbeat (Throttle to 10 FPS for performance)
    if (state.clock.getElapsedTime() - lastTelemetryUpdate.current > 0.1) {
      const currentPos = new THREE.Vector3();
      chassisBody.current?.getWorldPosition(currentPos);
      
      const speedKmh = Math.sqrt(
        velocity.current[0]**2 + 
        velocity.current[1]**2 + 
        velocity.current[2]**2
      ) * 3.6;

      const distToGym = currentPos.distanceTo(new THREE.Vector3(-25, 0, 40));

      setTelemetry({
        speed: speedKmh,
        health,
        boost: boostLevel.current,
        inCombatZone: distToGym < 15,
        position: [currentPos.x, currentPos.z]
      });
      lastTelemetryUpdate.current = state.clock.getElapsedTime();
    }

    // Fall Reset Logic
    const pos = new THREE.Vector3();
    chassisBody.current?.getWorldPosition(pos);
    if (pos.y < -10) {
      chassisApi.position.set(0, 5, 0);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
      setHealth(100);
    }
  });

  return (
    <group ref={vehicle}>
      <group ref={chassisBody}>
        {/* Detailed Modular Body */}
        <DamagePart args={[1.2, 0.4, 1.2]} position={[0, 0, 0.8]} rotation={[0, 0, 0]} color="#b22222" damage={damageZones.front} />
        <DamagePart args={[1.2, 0.5, 1.5]} position={[0, 0.1, -0.6]} rotation={[0, 0, 0]} color="#b22222" damage={0} />
        <DamagePart args={[1, 0.35, 1.2]} position={[0, 0.45, -0.2]} rotation={[0.1, 0, 0]} color="#0a0a0a" damage={0} />
        
        {/* Lights */}
        <mesh position={[-0.4, 0.1, 1.45]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.4, 0.1, 1.45]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
        </mesh>

        {/* Indicators Front */}
        <mesh position={[-0.55, 0.1, 1.4]}>
          <boxGeometry args={[0.1, 0.08, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={signalLeft && indicatorsOn ? 5 : 0} 
          />
        </mesh>
        <mesh position={[0.55, 0.1, 1.4]}>
          <boxGeometry args={[0.1, 0.08, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={signalRight && indicatorsOn ? 5 : 0} 
          />
        </mesh>

        {/* Brake Lights & Indicators Rear */}
        <mesh position={[-0.45, 0.1, -1.35]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="red" 
            emissive="red" 
            emissiveIntensity={backward ? 5 : 1} 
          />
        </mesh>
        <mesh position={[0.45, 0.1, -1.35]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="red" 
            emissive="red" 
            emissiveIntensity={backward ? 5 : 1} 
          />
        </mesh>
        
        {/* Rear Indicators */}
        <mesh position={[-0.6, 0.1, -1.3]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={signalLeft && indicatorsOn ? 5 : 0} 
          />
        </mesh>
        <mesh position={[0.6, 0.1, -1.3]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={signalRight && indicatorsOn ? 5 : 0} 
          />
        </mesh>

        {/* Gun */}
        <mesh position={[0, 0.65, 0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.6]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Audio Elements */}
        <Suspense fallback={null}>
          <PositionalAudio ref={engineSfx} url={SOUNDS.engine} loop distance={5} />
          <PositionalAudio ref={crashSfx} url={SOUNDS.crash} loop={false} distance={10} />
          <PositionalAudio ref={shootSfx} url={SOUNDS.shoot} loop={false} distance={8} />
        </Suspense>

        {/* Damage Smoke Particles System */}
        <points ref={smokeRef} visible={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array(300).map(() => (Math.random() - 0.5) * 0.5)}
              count={100}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color={health < 20 ? "#ff4400" : "#aaaaaa"} transparent opacity={0.6} />
        </points>
      </group>

      {wheels.map((wheel, index) => (
        <group key={index} ref={wheel}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[CAR_CONFIG.wheelRadius, CAR_CONFIG.wheelRadius, 0.25, 24]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0.5} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[CAR_CONFIG.wheelRadius - 0.1, CAR_CONFIG.wheelRadius - 0.1, 0.26, 16]} />
          <meshStandardMaterial color="#888" roughness={0.2} metalness={1} />
        </mesh>
        </group>
      ))}

      {bullets.map(b => (
        <mesh key={b.id} position={[b.pos.x, b.pos.y, b.pos.z]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={5} />
        </mesh>
      ))}
    </group>
  );
};

