import { useEffect, useState } from 'react';

export const useControls = () => {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    fire: false,
    signalLeft: false,
    signalRight: false,
    exit: false,
    punch: false,
    kick: false,
    grenade: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setKeys((k) => ({ ...k, forward: true })); break;
        case 'KeyS': setKeys((k) => ({ ...k, backward: true })); break;
        case 'KeyA': setKeys((k) => ({ ...k, left: true })); break;
        case 'KeyD': setKeys((k) => ({ ...k, right: true })); break;
        case 'KeyQ': setKeys((k) => ({ ...k, signalLeft: true })); break;
        case 'KeyE': setKeys((k) => ({ ...k, signalRight: true })); break;
        case 'KeyF': setKeys((k) => ({ ...k, exit: true })); break;
        case 'Space': setKeys((k) => ({ ...k, boost: true })); break;
        case 'Enter': setKeys((k) => ({ ...k, fire: true })); break;
        case 'KeyV': setKeys((k) => ({ ...k, punch: true })); break;
        case 'KeyB': setKeys((k) => ({ ...k, kick: true })); break;
        case 'KeyG': setKeys((k) => ({ ...k, grenade: true })); break;
        default: break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setKeys((k) => ({ ...k, forward: false })); break;
        case 'KeyS': setKeys((k) => ({ ...k, backward: false })); break;
        case 'KeyA': setKeys((k) => ({ ...k, left: false })); break;
        case 'KeyD': setKeys((k) => ({ ...k, right: false })); break;
        case 'KeyQ': setKeys((k) => ({ ...k, signalLeft: false })); break;
        case 'KeyE': setKeys((k) => ({ ...k, signalRight: false })); break;
        case 'KeyF': setKeys((k) => ({ ...k, exit: false })); break;
        case 'Space': setKeys((k) => ({ ...k, boost: false })); break;
        case 'Enter': setKeys((k) => ({ ...k, fire: false })); break;
        case 'KeyV': setKeys((k) => ({ ...k, punch: false })); break;
        case 'KeyB': setKeys((k) => ({ ...k, kick: false })); break;
        case 'KeyG': setKeys((k) => ({ ...k, grenade: false })); break;
        default: break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) setKeys((k) => ({ ...k, fire: true, punch: true }));
      if (e.button === 2) setKeys((k) => ({ ...k, kick: true }));
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setKeys((k) => ({ ...k, fire: false, punch: false }));
      if (e.button === 2) setKeys((k) => ({ ...k, kick: false }));
    };

    const handleContextMenu = (e: Event) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Drift logic: If S (backward) is pressed along with A or D
  const isDriftingLeft = keys.backward && keys.left;
  const isDriftingRight = keys.backward && keys.right;
  const isDrifting = isDriftingLeft || isDriftingRight;

  return { ...keys, isDrifting, isDriftingLeft, isDriftingRight };
};
