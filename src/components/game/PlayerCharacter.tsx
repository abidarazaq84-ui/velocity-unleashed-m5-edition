import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import * as THREE from 'three';
import { useControls } from '../../hooks/useControls';
import { useGame } from '../../contexts/GameContext';

export const PlayerCharacter = ({ carRef, activeRef }: { carRef: React.RefObject<THREE.Group>, activeRef: React.RefObject<THREE.Group> }) => {
  const { forward, backward, left, right, exit, punch, kick, grenade } = useControls();
  const { isPlayerInCar, setIsPlayerInCar, setTelemetry, setGameState, profile } = useGame();
  const { scene } = useThree();
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 2, 5],
    fixedRotation: true,
    args: [0.5],
  }), activeRef);

  const velocity = useRef([0, 0, 0]);
  const [oxygen, setOxygen] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [thirst, setThirst] = useState(100);
  const [money, setMoney] = useState(50);
  const [attackState, setAttackState] = useState<'idle' | 'punching' | 'kicking'>('idle');
  const attackTimer = useRef(0);
  
  const isSwimmingRef = useRef(false);
  const lastUpdateRef = useRef(0);

  const lastGrenadeTime = useRef(0);

  const respawn = (reason: string) => {
    alert(`${reason}\nYou woke up at the hospital with empty pockets.`);
    setHunger(100);
    setThirst(100);
    setOxygen(100);
    setMoney(0);
    api.position.set(30, 2, 40); // Outside hospital
    api.velocity.set(0, 0, 0);
  };

  useEffect(() => {
    const unsub = api.velocity.subscribe((v) => (velocity.current = v));
    return unsub;
  }, [api.velocity]);

  useEffect(() => {
    const handleBuyFood = () => {
      setMoney(m => {
        if (m >= 15) {
          setHunger(100);
          return m - 15;
        }
        return m;
      });
    };
    const handleBuyDrink = () => {
      setMoney(m => {
        if (m >= 10) {
          setThirst(100);
          return m - 10;
        }
        return m;
      });
    };
    window.addEventListener('buy-food', handleBuyFood);
    window.addEventListener('buy-drink', handleBuyDrink);
    return () => {
      window.removeEventListener('buy-food', handleBuyFood);
      window.removeEventListener('buy-drink', handleBuyDrink);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHunger(h => {
        const next = Math.max(0, h - 0.2); // ~8 mins to starve
        if (next === 0 && h > 0) {
          setTimeout(() => {
            respawn("You starved to death!");
          }, 100);
        }
        return next;
      });
      setThirst(t => {
        const next = Math.max(0, t - 0.3); // ~5.5 mins to die of thirst
        if (next === 0 && t > 0) {
          setTimeout(() => {
            respawn("You died of thirst!");
          }, 100);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setGameState]);

  useFrame((state) => {
    if (isPlayerInCar) {
      // Hide and disable character when in car
      api.velocity.set(0, 0, 0);
      // Move character to car position so it can exit nearby
      if (carRef.current) {
        const carPos = new THREE.Vector3();
        carRef.current.getWorldPosition(carPos);
        api.position.set(carPos.x - 2, carPos.y + 1, carPos.z);
      }
      return;
    }

    const charPos = new THREE.Vector3();
    ref.current!.getWorldPosition(charPos);
    const currentlySwimming = charPos.y < -0.5;
    const isMoving = forward || backward || left || right;

    // Swimming oxygen logic
    if (currentlySwimming) {
      setOxygen(prev => {
        const next = Math.max(0, prev - 0.15); // Oxygen depletes in ~11 seconds
        if (next === 0 && prev > 0) {
          // Dead
          setTimeout(() => {
            respawn("You drowned!");
          }, 100);
        }
        return next;
      });
      isSwimmingRef.current = true;
    } else if (isMoving && !isPlayerInCar) {
      setOxygen(prev => Math.max(0, prev - 0.05));
      isSwimmingRef.current = false;
    } else {
      if (oxygen < 100) {
        setOxygen(prev => Math.min(100, prev + 0.5)); // Recover fast
      }
      isSwimmingRef.current = false;
    }

    const now = state.clock.getElapsedTime() * 1000;

    // Throw grenade
    if (grenade && profile?.inventory.guns?.includes('grenades')) {
      if (now - lastGrenadeTime.current > 2000) { // 2 second cooldown
        lastGrenadeTime.current = now;
        const event = new CustomEvent('spawn-grenade', {
          detail: {
            position: [charPos.x, charPos.y + 1, charPos.z],
            velocity: [
              Math.sin(ref.current!.rotation.y) * 15,
              5,
              Math.cos(ref.current!.rotation.y) * 15
            ]
          }
        });
        window.dispatchEvent(event);
      }
    }

    if (now - lastUpdateRef.current > 200) {
      setTelemetry({
        isSwimming: currentlySwimming,
        playerOxygen: oxygen,
        hunger,
        thirst,
        money,
        position: [charPos.x, charPos.z]
      });
      lastUpdateRef.current = now;
    }

    const direction = new THREE.Vector3();
    let forwardSpeed = Number(backward) - Number(forward);
    let sideSpeed = Number(left) - Number(right);

    // Handle Attack
    if (attackState === 'idle' && !isSwimmingRef.current && oxygen > 0) {
      if (punch) {
        setAttackState('punching');
        attackTimer.current = now;
        setOxygen(prev => Math.max(0, prev - 5)); // Attack costs stamina
      } else if (kick) {
        setAttackState('kicking');
        attackTimer.current = now;
        setOxygen(prev => Math.max(0, prev - 10)); // Attack costs more stamina
      }
    }

    if (attackState !== 'idle') {
      const elapsed = now - attackTimer.current;
      if (elapsed > 300) {
        setAttackState('idle'); // 300ms attack animation
      } else if (elapsed < 100) {
        // Lunge forward during first 100ms
        forwardSpeed = -2; // Push forward hard to break things
      }
    }

    const frontVector = new THREE.Vector3(0, 0, forwardSpeed);
    const sideVector = new THREE.Vector3(sideSpeed, 0, 0);

    const speed = currentlySwimming ? 2.5 : (attackState !== 'idle' ? 8 : (oxygen > 0 ? 5 : 2)); // Move fast while lunging

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed);

    let vy = velocity.current[1];
    if (currentlySwimming) {
      // Buoyancy / swimming up
      if (forward) vy = 2; // swim up slightly
      else vy = -0.5; // sink slowly
    } else {
      // Climbing logic
      if (isMoving && oxygen > 0 && direction.length() > 0) {
        const rayDirection = direction.clone().normalize();
        const origin = charPos.clone().add(new THREE.Vector3(0, 0.5, 0)); // Chest height
        
        const raycaster = new THREE.Raycaster(origin, rayDirection, 0, 0.6);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        const hitWall = intersects.some(hit => {
          // Ignore own meshes
          let obj: THREE.Object3D | null = hit.object;
          while (obj) {
            if (obj === ref.current) return false;
            obj = obj.parent;
          }
          return true;
        });

        if (hitWall) {
          vy = 3; // Climbing speed up
          setOxygen(prev => Math.max(0, prev - 0.15)); // Uses extra oxygen
        }
      }
    }

    api.velocity.set(direction.x, vy, direction.z);

    // Look direction
    if (direction.length() > 0.1) {
      const angle = Math.atan2(direction.x, direction.z);
      ref.current!.rotation.y = angle;
    }

    // Exit/Enter logic
    if (exit) {
      const charPos = new THREE.Vector3();
      ref.current!.getWorldPosition(charPos);
      
      if (carRef.current) {
        const carPos = new THREE.Vector3();
        carRef.current.getWorldPosition(carPos);
        
        const dist = charPos.distanceTo(carPos);
        if (dist < 3) {
          setIsPlayerInCar(true);
        }
      }
    }
  });

  return (
    <group ref={ref as any} visible={!isPlayerInCar}>
      {/* Body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Eye/Forward indicator */}
      <mesh position={[0, 1.5, 0.2]}>
        <boxGeometry args={[0.3, 0.05, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Punching Arm */}
      {attackState === 'punching' && (
        <mesh position={[0.2, 0.8, 0.6]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
      )}

      {/* Kicking Leg */}
      {attackState === 'kicking' && (
        <mesh position={[0, -0.2, 0.7]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 1.0]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      )}
    </group>
  );
};
