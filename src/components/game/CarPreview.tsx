import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, PresentationControls, Stage } from '@react-three/drei';
import * as THREE from 'three';

const CarModel = ({ color = 'red', type = 'BMW_M5' }: { color?: string, type?: string }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const isTesla = type === 'TESLA_S';

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.2, isTesla ? 0.6 : 0.7, 3]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[0, 0.75, isTesla ? -0.1 : -0.2]}>
        <boxGeometry args={[isTesla ? 1.1 : 1, 0.4, isTesla ? 1.8 : 1.2]} />
        <meshStandardMaterial color="#111" transparent opacity={0.7} />
      </mesh>
      {/* Grill / Accents */}
      {!isTesla && (
        <group position={[0, 0.3, 1.51]}>
           <mesh position={[-0.3, 0, 0]}>
             <boxGeometry args={[0.4, 0.2, 0.05]} />
             <meshStandardMaterial color="#222" />
           </mesh>
           <mesh position={[0.3, 0, 0]}>
             <boxGeometry args={[0.4, 0.2, 0.05]} />
             <meshStandardMaterial color="#222" />
           </mesh>
        </group>
      )}
      {/* Wheels */}
      {[[-0.7, 0.2, 1], [0.7, 0.2, 1], [-0.7, 0.2, -1], [0.7, 0.2, -1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
};

export const CarPreview = ({ color, type }: { color?: string, type?: string }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 35 }}>
        <Suspense fallback={null}>
          <Environment preset="night" />
          <PresentationControls
            global
            snap={true}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
          >
            <Stage environment="city" intensity={0.6} shadows={false}>
              <CarModel color={color} type={type} />
            </Stage>
          </PresentationControls>
          <ContactShadows position={[0, -0.5, 0]} opacity={0.75} scale={10} blur={2.5} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
};

