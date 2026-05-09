import { useBox, usePlane } from '@react-three/cannon';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const Wall = ({ position, args, color = "#1a1a1a" }: { position: [number, number, number], args: [number, number, number], color?: string }) => {
  const [ref] = useBox(() => ({ type: 'Static', position, args }));
  return (
    <mesh ref={ref as any} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

export const SafeHouse = () => {
  const [floorRef] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }));

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Main Room Walls */}
      <Wall position={[0, 5, -15]} args={[30, 10, 1]} /> {/* Back Wall */}
      <Wall position={[15, 5, 0]} args={[1, 10, 30]} />  {/* Right Wall */}
      <Wall position={[-15, 5, 0]} args={[1, 10, 30]} /> {/* Left Wall */}
      
      {/* WARDROBE / ARMORY AREA */}
      <group position={[-10, 0, -10]}>
        {/* Armory Lockers */}
        <mesh position={[0, 4, -4.4]} receiveShadow castShadow>
          <boxGeometry args={[8, 8, 1]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} emissive="#330000" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Glow Floor for Dressing Spot (Crimson Red) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}>
          <circleGeometry args={[2.5, 32]} />
          <meshStandardMaterial color="#ff2222" transparent opacity={0.2} emissive="#ff2222" emissiveIntensity={1} />
        </mesh>

        <Text
          position={[0, 9, -4.4]}
          fontSize={0.8}
          color="#ff3333"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.ttf"
        >
          WARDROBE & ARMORY
        </Text>
        
        <pointLight position={[0, 8, -2]} intensity={2} color="#ff3333" distance={15} />
      </group>

      {/* Syndicate Planning Area */}
      <group position={[5, 0, 5]}>
        {/* Planning Table */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[6, 0.2, 4]} />
          <meshStandardMaterial color="#4d2b18" roughness={0.8} />
        </mesh>
        {/* Table Legs */}
        <mesh position={[-2.8, 0.75, -1.8]}><boxGeometry args={[0.2, 1.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[2.8, 0.75, -1.8]}><boxGeometry args={[0.2, 1.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[-2.8, 0.75, 1.8]}><boxGeometry args={[0.2, 1.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[2.8, 0.75, 1.8]}><boxGeometry args={[0.2, 1.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>

        {/* Maps / Blueprints on table */}
        <mesh position={[0, 1.61, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#ddccaa" roughness={1} />
        </mesh>

        {/* Stack of Cash */}
        <mesh position={[2, 1.7, 1]} castShadow>
          <boxGeometry args={[0.8, 0.2, 0.4]} />
          <meshStandardMaterial color="#2d5a27" />
        </mesh>

        {/* Suspended Light over Table */}
        <mesh position={[0, 7, 0]}>
          <cylinderGeometry args={[0.5, 1, 1]} />
          <meshStandardMaterial color="#111" emissive="#ffaa00" emissiveIntensity={0.5} />
        </mesh>
        <spotLight position={[0, 6.5, 0]} angle={0.6} penumbra={0.5} intensity={5} color="#ffdd88" distance={10} castShadow />

        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="#ffaa00"
        >
          SYNDICATE PLANNING
        </Text>
      </group>

      {/* Scattered Crates / Props */}
      <group position={[10, 0, -10]}>
         <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[2, 2, 2]} /><meshStandardMaterial color="#333" /></mesh>
         <mesh position={[1, 0.5, 2]} castShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#444" /></mesh>
      </group>

      {/* Ambient Lighting for House */}
      <ambientLight intensity={0.2} />
      <spotLight position={[-10, 15, 10]} angle={0.8} penumbra={1} intensity={1} castShadow />
      <pointLight position={[10, 8, 10]} intensity={0.5} color="#ff3300" />
    </group>
  );
};
