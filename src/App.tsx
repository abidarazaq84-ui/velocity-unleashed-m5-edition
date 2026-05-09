import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { Scene } from './components/game/Scene';
import { HUD } from './components/ui/HUD';
import { Menu } from './components/ui/Menu';
import { Garage } from './components/ui/Garage';

function GameContent() {
  const { gameState, telemetry } = useGame();

  return (
    <div className="w-full h-screen bg-black">
      {gameState === 'playing' ? (
        <>
          <Scene />
          <HUD 
            speed={telemetry.speed} 
            health={telemetry.health} 
            boost={telemetry.boost} 
            wantedLevel={telemetry.wantedLevel} 
          />
          <button 
            onClick={() => window.location.reload()}
            className="fixed top-4 left-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-lg hover:bg-white/40 pointer-events-auto"
          >
            EXIT TO MENU
          </button>
        </>
      ) : gameState === 'garage' ? (
        <Garage />
      ) : (
        <Menu />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
