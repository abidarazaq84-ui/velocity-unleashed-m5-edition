import { useBox, useSphere } from '@react-three/cannon';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const Building = ({ position, args, color = "#666" }: { position: [number, number, number], args: [number, number, number], color?: string }) => {
  const [ref] = useBox(() => ({ type: 'Static', position, args }));
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} envMapIntensity={1} />
    </mesh>
  );
};

const Tree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
};

const Bush = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.9} metalness={0} />
    </mesh>
  );
};

const GrassPatch = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#3a5f3a" roughness={1} metalness={0} />
    </mesh>
  );
};

const ShadowGrass = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[Math.random() * 8 - 4, 0.25, Math.random() * 8 - 4]} 
          rotation={[Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2]}
          castShadow 
          receiveShadow
        >
          <coneGeometry args={[0.1, 0.6 + Math.random() * 0.4, 3]} />
          <meshStandardMaterial color="#3a5a3a" roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
};

const NPC = ({ position }: { position: [number, number, number] }) => {
  const [ref] = useBox(() => ({ 
    mass: 1000, 
    position,
    args: [1, 1, 2]
  }));

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[1, 1, 2]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  );
};

const VendingMachine = ({ position, playerRef }: { position: [number, number, number], playerRef?: React.RefObject<THREE.Group> }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [ref] = useBox(() => ({ type: 'Static', position, args: [2, 3, 2] }));
  
  useFrame(() => {
    if (playerRef?.current && ref.current) {
      const dist = new THREE.Vector3(...position).distanceTo(playerRef.current.position);
      setShowPrompt(dist < 5);
    }
  });

  return (
    <group ref={ref as any}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color="#ee0000" metalness={0.7} roughness={0.2} />
      </mesh>
      {showPrompt && (
         <Html position={[0, 3, 0]} center zIndexRange={[100, 0]}>
           <div className="bg-black/90 text-white p-4 rounded-xl border border-white/30 flex flex-col gap-2 w-48 shadow-2xl">
             <div className="text-center font-bold text-yellow-500 mb-2">VENDING MACHINE</div>
             <button 
               className="bg-green-600 hover:bg-green-500 px-2 py-2 rounded font-bold pointer-events-auto transition-colors"
               onClick={() => window.dispatchEvent(new CustomEvent('buy-food'))}>
               Buy Food ($15)
             </button>
             <button 
               className="bg-blue-600 hover:bg-blue-500 px-2 py-2 rounded font-bold pointer-events-auto transition-colors"
               onClick={() => window.dispatchEvent(new CustomEvent('buy-drink'))}>
               Buy Drink ($10)
             </button>
           </div>
         </Html>
      )}
    </group>
  );
};

const Hospital = ({ position }: { position: [number, number, number] }) => {
  const [ref] = useBox(() => ({ type: 'Static', position, args: [15, 20, 15] }));
  return (
    <group ref={ref as any}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[15, 20, 15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Front Entrance / Red Cross */}
      <mesh position={[0, 8, 7.6]}>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 8, 7.6]}>
        <boxGeometry args={[1, 4, 0.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Html position={[0, 12, 7.6]} center zIndexRange={[100, 0]}>
        <div className="bg-white text-red-600 px-3 py-1 font-black text-2xl border-4 border-red-600 drop-shadow-md rounded">HOSPITAL</div>
      </Html>
    </group>
  );
};

const BreakableCrate = ({ position }: { position: [number, number, number] }) => {
  const [broken, setBroken] = useState(false);
  const [ref, api] = useBox(() => ({
    mass: 5,
    position,
    args: [1.5, 1.5, 1.5],
    onCollide: (e: any) => {
      if (e.contact.impactVelocity > 1.5) {
        setBroken(true);
      }
    }
  }));

  useEffect(() => {
    if (broken) {
      api.position.set(position[0], -100, position[2]);
      api.mass.set(0);
    }
  }, [broken, api, position]);

  if (broken) {
    return (
      <group position={[position[0], 0, position[2]]}>
        <mesh position={[0, 0.2, 0]} rotation={[0.1, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.2, 0.5]} rotation={[-0.2, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.2, 1.5]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
        </mesh>
        <mesh position={[-0.5, 0.2, -0.3]} rotation={[0, 0.8, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.2, 0.6]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
    </mesh>
  );
};

const Grenade = ({ position, velocity, remove }: { position: [number, number, number], velocity: [number, number, number], remove: () => void }) => {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    velocity,
    args: [0.2]
  }));
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExploded(true);
      // "Explosion" impulse would ideally push things, but we just simulate by removing
      setTimeout(remove, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <group ref={ref as any}>
      {!exploded ? (
        <mesh castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#00ff00" metalness={0.8} />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

export const City = ({ playerRef }: { playerRef?: React.RefObject<THREE.Group> }) => {
  const [grenades, setGrenades] = useState<Array<{ id: number, pos: [number, number, number], vel: [number, number, number] }>>([]);
  
  useEffect(() => {
    let grenadeId = 0;
    const handleSpawn = (e: any) => {
      const g = { id: grenadeId++, pos: e.detail.position, vel: e.detail.velocity };
      setGrenades(prev => [...prev, g]);
    };
    window.addEventListener('spawn-grenade', handleSpawn);
    return () => window.removeEventListener('spawn-grenade', handleSpawn);
  }, []);
  const buildings = useMemo(() => {
    const b = [];
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        if (x === 0 && z === 0) continue;
        const height = 5 + Math.random() * 30;
        const width = 10 + Math.random() * 5;
        const depth = 10 + Math.random() * 5;
        b.push({
          position: [x * 50, height / 2, z * 50] as [number, number, number],
          args: [width, height, depth] as [number, number, number],
          color: `hsl(0, 0%, ${20 + Math.random() * 20}%)`
        });
      }
    }
    return b;
  }, []);

  return (
    <group>
      {grenades.map(g => (
        <Grenade 
          key={g.id} 
          position={g.pos} 
          velocity={g.vel} 
          remove={() => setGrenades(prev => prev.filter(x => x.id !== g.id))} 
        />
      ))}
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[20, 2000]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* NPCs (Walking/Driving placeholders) */}
      {[...Array(20)].map((_, i) => (
        <NPC key={i} position={[(Math.random() - 0.5) * 15, 2, (Math.random() - 0.5) * 400]} />
      ))}

      {/* Vending Machines for Food/Drink */}
      <VendingMachine position={[12, 1.5, 0]} playerRef={playerRef} />
      <VendingMachine position={[-12, 1.5, 50]} playerRef={playerRef} />
      <VendingMachine position={[12, 1.5, -50]} playerRef={playerRef} />

      {/* Hospital */}
      <Hospital position={[30, 10, 30]} />

      {/* Breakable Weak Things */}
      <group>
        <BreakableCrate position={[15, 2, 75]} />
        <BreakableCrate position={[15, 4, 75]} />
        <BreakableCrate position={[17, 2, 75]} />
        <BreakableCrate position={[0, 2, 20]} />
        <BreakableCrate position={[0, 4, 20]} />
        <BreakableCrate position={[2, 2, 20]} />
        <BreakableCrate position={[4, 2, 20]} />
        <BreakableCrate position={[-15, 2, 45]} />
        <BreakableCrate position={[-15, 4, 45]} />
        <BreakableCrate position={[-13, 2, 45]} />
      </group>

      {/* Street Lamps */}
      {[...Array(50)].map((_, i) => (
        <group key={i} position={[10, 0, i * 40 - 1000]}>
           <mesh position={[0, 4, 0]}>
             <cylinderGeometry args={[0.1, 0.1, 8]} />
             <meshStandardMaterial color="#111" />
           </mesh>
           <pointLight position={[0, 8, 0]} intensity={50} color="#ffaa44" distance={20} decay={2} />
        </group>
      ))}

      {[...Array(50)].map((_, i) => (
        <group key={i} position={[-10, 0, i * 40 - 1000]}>
           <mesh position={[0, 4, 0]}>
             <cylinderGeometry args={[0.1, 0.1, 8]} />
             <meshStandardMaterial color="#111" />
           </mesh>
           <pointLight position={[0, 8, 0]} intensity={50} color="#ffaa44" distance={20} decay={2} />
        </group>
      ))}

      {/* Buildings & Gym Area */}
      <group position={[15, 0, 80]}>
        <Building position={[0, 3, 0]} args={[12, 6, 8]} color="#050505" />
        <Building position={[0, 6.1, 0]} args={[13, 0.2, 8.5]} color="#00ff88" />
      </group>

      <group position={[-25, 0, 40]}>
        <Building position={[0, 8, 0]} args={[25, 16, 25]} color="#111" />
        <Building position={[0, 0.1, 0]} args={[18, 0.2, 18]} color="#ff0000" />
        <pointLight position={[0, 8, 0]} intensity={50} color="red" />
      </group>

      {/* PARK AREA */}
      <group position={[40, 0, 40]}>
        <GrassPatch position={[0, 0.01, 0]} />
        <Tree position={[-5, 0, -5]} scale={1.2} />
        <Tree position={[5, 0, -3]} scale={0.9} />
        <Tree position={[-2, 0, 6]} scale={1.1} />
        <Bush position={[2, 0.5, 4]} />
        <Bush position={[-6, 0.5, 2]} />
        <ShadowGrass position={[0, 0, 0]} />
        <ShadowGrass position={[-5, 0, 5]} />
        <ShadowGrass position={[6, 0, -6]} />
      </group>

      {/* SEASIDE */}
      <group position={[400, -0.5, 0]}>
        {/* Water */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1000, 2000]} />
        <meshPhysicalMaterial 
          color="#002244" 
          transparent opacity={0.8} 
          metalness={0.1} 
          roughness={0.1} 
          transmission={0.9} 
          ior={1.33} 
          thickness={5} 
        />
        </mesh>
        {/* Beach / Sand */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-50, 0.1, 0]}>
          <planeGeometry args={[100, 2000]} />
          <meshStandardMaterial color="#8B7355" roughness={1} metalness={0} />
        </mesh>
        {/* Seaside Vegetation */}
        <Tree position={[-55, 0.6, 20]} scale={1.5} />
        <Tree position={[-60, 0.6, -20]} scale={1.2} />
        <Tree position={[-50, 0.6, 100]} scale={1.4} />
        <Tree position={[-45, 0.6, -80]} scale={1.1} />
        <Bush position={[-55, 0.5, 25]} />
        <ShadowGrass position={[-55, 0.6, 15]} />
        <ShadowGrass position={[-60, 0.6, -25]} />
      </group>

      {/* RIVER */}
      <group position={[0, -0.4, 300]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2000, 60]} />
          <meshPhysicalMaterial 
            color="#001a33" 
            transparent opacity={0.85} 
            metalness={0.1} 
            roughness={0.2} 
            transmission={0.8} 
            ior={1.33} 
            thickness={3} 
          />
        </mesh>
        {/* River Banks */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, -30]}>
          <planeGeometry args={[2000, 5]} />
          <meshStandardMaterial color="#334433" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 30]}>
          <planeGeometry args={[2000, 5]} />
          <meshStandardMaterial color="#334433" />
        </mesh>
        {/* River Vegetation */}
        <Tree position={[-30, 0.6, -30]} scale={1.5} />
        <Tree position={[30, 0.6, 30]} scale={1.3} />
        <Tree position={[-15, 0.6, 30]} />
        <Tree position={[15, 0.6, -30]} />
        <ShadowGrass position={[-20, 0.6, -30]} />
        <ShadowGrass position={[20, 0.6, 30]} />
        <ShadowGrass position={[-15, 0.6, 30]} />
        <Bush position={[-10, 1.1, -30]} />
        <Bush position={[10, 1.1, 30]} />
      </group>

      {/* Bridge for the Road */}
      <group position={[0, 0.1, 300]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[22, 1, 70]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <Building position={[11, 2, 0]} args={[1, 4, 70]} color="#222" />
        <Building position={[-11, 2, 0]} args={[1, 4, 70]} color="#222" />
      </group>
    </group>
  );
};
