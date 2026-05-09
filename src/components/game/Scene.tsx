import { Physics, usePlane } from '@react-three/cannon';
import { Sky, ContactShadows, OrbitControls, Environment, PerspectiveCamera, SoftShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useRef } from 'react';
import { Car } from './Car';
import { PlayerCharacter } from './PlayerCharacter';
import { City } from './City';
import { Parkour } from './Parkour';
import { SafeHouse } from './SafeHouse';
import { PoliceCar } from './PoliceCar';
import { Pedestrian } from './Pedestrian';
import { useGame } from '../../contexts/GameContext';
import * as THREE from 'three';

import { useBox } from '@react-three/cannon';

function DeepFloor(props: any) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -2, 0], ...props }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial color="#0a0a0a" />
    </mesh>
  );
}

function CityGround(props: any) {
  const [ref] = useBox(() => ({ type: 'Static', args: [600, 2, 400], position: [0, -1, 0], ...props }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <boxGeometry args={[600, 2, 400]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

const CameraFollow = ({ targetRef }: { targetRef: React.RefObject<THREE.Group> }) => {
  const { camera } = useThree();
  useFrame(() => {
    if (targetRef.current) {
      const pos = new THREE.Vector3();
      targetRef.current.getWorldPosition(pos);
      
      const offset = new THREE.Vector3(0, 8, 12);
      camera.position.lerp(pos.clone().add(offset), 0.1);
      camera.lookAt(pos);
    }
  });
  return null;
};

export const Scene = () => {
  const { gameMode, isPlayerInCar } = useGame();
  const carChassisRef = useRef<THREE.Group>(null);
  const playerCharRef = useRef<THREE.Group>(null);

  const activePlayerRef = isPlayerInCar ? carChassisRef : playerCharRef;

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={50}>
        <audioListener />
      </PerspectiveCamera>
      <CameraFollow targetRef={activePlayerRef} />
      <Suspense fallback={null}>
        <SoftShadows size={10} samples={16} focus={0.5} />
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Environment preset="city" />
        <ambientLight intensity={0.4} />
        <directionalLight 
          castShadow 
          position={[100, 100, 50]} 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />
        
        <Physics gravity={[0, -9.81, 0]} allowSleep={false}>
          {gameMode === 'city' && (
            <>
              <City playerRef={playerCharRef} />
              <Pedestrian startPos={[6, 0.5, 10]} endPos={[6, 0.5, -10]} speed={0.03} />
              <Pedestrian startPos={[-6, 0.5, -10]} endPos={[-6, 0.5, 10]} speed={0.025} />
              <Pedestrian startPos={[10, 0.5, 6]} endPos={[-10, 0.5, 6]} speed={0.02} />
              <Pedestrian startPos={[-10, 0.5, -6]} endPos={[10, 0.5, -6]} speed={0.035} />
            </>
          )}
          {gameMode === 'parkour1' && <Parkour level={1} />}
          {gameMode === 'parkour2' && <Parkour level={2} />}
          {gameMode === 'story' && <SafeHouse />}
          
          <DeepFloor />
          {gameMode === 'city' && <CityGround />}
          <Car position={[0, 2, 0]} chassisRef={carChassisRef} />
          <PlayerCharacter carRef={carChassisRef} activeRef={playerCharRef} />
          
          {/* We'll assume the player car is at 0,0,0 initially for the police to find */}
          {gameMode === 'city' && (
            <PoliceCar playerRef={activePlayerRef} />
          )}
        </Physics>

        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <ContactShadows position={[0, -0.05, 0]} opacity={0.6} scale={60} blur={2} far={4.5} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </Suspense>
    </Canvas>
  );
};
