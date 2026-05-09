import { useBox } from '@react-three/cannon';
import { useMemo } from 'react';
import * as THREE from 'three';

const Platform = ({ position, args, color = "#ff4400" }: { position: [number, number, number], args: [number, number, number], color?: string }) => {
  const [ref] = useBox(() => ({ type: 'Static', position, args }));
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
};

const Ramp = ({ position, args, rotation, color = "#ff4400" }: { position: [number, number, number], args: [number, number, number], rotation: [number, number, number], color?: string }) => {
  const [ref] = useBox(() => ({ type: 'Static', position, args, rotation }));
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
};

export const Parkour = ({ level = 1 }: { level: number }) => {
  const elements = useMemo(() => {
    if (level === 1) {
      return [
        { type: 'ramp', position: [0, 0.5, 20], args: [10, 1, 10], rotation: [-Math.PI / 8, 0, 0] },
        { type: 'platform', position: [0, 2.5, 40], args: [15, 1, 30], color: '#ff6600' },
        { type: 'ramp', position: [0, 4, 70], args: [10, 1, 20], rotation: [-Math.PI / 12, 0, 0] },
        { type: 'platform', position: [10, 7, 100], args: [20, 1, 20], color: '#ff8800' },
        { type: 'platform', position: [-10, 10, 130], args: [20, 1, 20], color: '#ffaa00' },
        // Obstacles
        { type: 'platform', position: [0, 12, 160], args: [2, 1, 40], color: '#ff0000' }, // Narrow bridge
      ];
    } else {
      return [
        { type: 'platform', position: [0, 5, 20], args: [5, 10, 5], color: '#00ffcc' },
        { type: 'ramp', position: [10, 2, 40], args: [10, 1, 15], rotation: [-Math.PI / 6, 0.2, 0] },
        { type: 'platform', position: [20, 8, 60], args: [10, 1, 10], color: '#00ccff' },
        { type: 'platform', position: [0, 12, 80], args: [10, 1, 10], color: '#0099ff' },
        { type: 'ramp', position: [-20, 15, 100], args: [15, 1, 15], rotation: [0.3, -Math.PI / 4, 0] },
        // Loop-like structure simulation
        { type: 'platform', position: [-30, 20, 130], args: [30, 1, 30], color: '#0066ff' },
      ];
    }
  }, [level]);

  return (
    <group>
      {elements.map((el, i) => (
        el.type === 'platform' ? 
          <Platform key={i} position={el.position as any} args={el.args as any} color={el.color} /> :
          <Ramp key={i} position={el.position as any} args={el.args as any} rotation={el.rotation as any} color={el.color} />
      ))}
      
      {/* Decorative neon lines */}
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[0, 0.1, i * 50]}>
          <planeGeometry args={[100, 0.2]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
};
