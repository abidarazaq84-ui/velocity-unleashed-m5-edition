import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface PedestrianProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  speed?: number;
}

export const Pedestrian = ({ startPos, endPos, speed = 0.02 }: PedestrianProps) => {
  const [target, setTarget] = useState(new THREE.Vector3(...endPos));
  const start = new THREE.Vector3(...startPos);
  const end = new THREE.Vector3(...endPos);

  const [ref, api] = useBox(() => ({
    type: 'Kinematic',
    args: [0.6, 1.2, 0.4],
    position: startPos,
    onCollide: (e) => {
      // Pedestrians can react to collisions here if needed
    }
  }));

  useFrame((state) => {
    if (!ref.current) return;

    const currentPos = new THREE.Vector3();
    ref.current.getWorldPosition(currentPos);
    
    const direction = target.clone().sub(currentPos).normalize();
    
    // Move towards target
    const vel = direction.multiplyScalar(speed * 60); // Adjust for frame rate
    api.velocity.set(vel.x, 0, vel.z);
    
    // Look towards target
    const lookAtPos = target.clone();
    lookAtPos.y = currentPos.y;
    ref.current.lookAt(lookAtPos);
    
    // Switch target if reached
    if (currentPos.distanceTo(target) < 0.5) {
      setTarget(target.equals(end) ? start : end);
    }
  });

  return (
    <group ref={ref as any}>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Glow highlight */}
      <mesh position={[0, 0.35, 0.08]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};
