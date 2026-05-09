import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect, Suspense } from 'react';
import { PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';

export const PoliceCar = ({ playerRef }: { playerRef: React.RefObject<THREE.Group> }) => {
  const [chassisBody, chassisApi] = useBox(() => ({
    mass: 1500,
    position: [10, 5, 10],
  }), useRef<THREE.Group>(null));

  const sirenLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!playerRef.current || !chassisBody.current) return;

    const playerPos = new THREE.Vector3();
    playerRef.current.getWorldPosition(playerPos);

    const policePos = new THREE.Vector3();
    chassisBody.current.getWorldPosition(policePos);

    const direction = playerPos.clone().sub(policePos).normalize();
    const distance = policePos.distanceTo(playerPos);

    // AI logic: Chase if too far, stop if close
    if (distance > 5) {
      const speed = 20;
      chassisApi.velocity.set(direction.x * speed, 0, direction.z * speed);
      
      // Look at player
      const angle = Math.atan2(direction.x, direction.z);
      chassisApi.rotation.set(0, angle, 0);
    } else {
      chassisApi.velocity.set(0, 0, 0);
    }

    // Siren animation
    if (sirenLightRef.current) {
       sirenLightRef.current.intensity = Math.sin(state.clock.elapsedTime * 10) > 0 ? 50 : 0;
       sirenLightRef.current.color.set(Math.sin(state.clock.elapsedTime * 10) > 0 ? 'red' : 'blue');
    }
  });

  return (
    <group ref={chassisBody}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.8, 3]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Visual only siren */}
      <pointLight ref={sirenLightRef} position={[0, 1, 0]} />
      <mesh position={[0, 0.5, 0]}>
         <boxGeometry args={[0.8, 0.1, 0.2]} />
         <meshStandardMaterial color="red" />
      </mesh>
      <Suspense fallback={null}>
        <PositionalAudio
          url="https://assets.mixkit.co/sfx/preview/mixkit-police-siren-loop-1033.mp3"
          loop
          distance={15}
        />
      </Suspense>
    </group>
  );
};
