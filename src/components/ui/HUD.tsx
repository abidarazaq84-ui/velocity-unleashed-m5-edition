import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Target, AlertTriangle, X, Swords, Shirt } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const HUD = ({ speed = 0, health = 100, boost = 100, wantedLevel = 0, policeTimer = 0 }) => {
  const { setGameState, gameMode, telemetry, isPlayerInCar, profile } = useGame();

  const mapScale = 800; // city is ~800x800

  return (
    <div className="fixed inset-0 pointer-events-none p-6 flex flex-col justify-between text-white font-mono">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Top Left: Controls, Map, and Stats */}
        <div className="flex flex-col gap-3 pointer-events-auto w-64">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setGameState('idle')}
              className="bg-black/50 hover:bg-red-600/50 text-white p-2 rounded-lg border border-white/10 transition-colors group"
              title="Leave Game"
            >
              <X size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="bg-black/50 px-3 py-1 rounded-lg border border-white/10 text-[10px] font-bold tracking-widest uppercase">
              {gameMode === 'story' ? 'LOCATION: SYNDICATE HQ' : `ACTIVE MISSION: ${gameMode.toUpperCase()}`}
            </div>
          </div>
          <div className="bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-[9px] flex items-center gap-2 max-w-fit">
            <span className="bg-cyan-500 text-black px-1.5 py-0.5 rounded font-black">F</span>
            <span className="text-cyan-400 font-bold uppercase tracking-tighter">Enter/Exit</span>
          </div>

          {!isPlayerInCar && (
            <div className="bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/30 text-[9px] flex items-center gap-2 max-w-fit">
              <span className="bg-orange-500 text-black px-1.5 py-0.5 rounded font-black">L-Click / V</span>
              <span className="text-orange-400 font-bold uppercase tracking-tighter">Punch / Break</span>
            </div>
          )}

          {!isPlayerInCar && (
            <div className="bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30 text-[9px] flex items-center gap-2 max-w-fit">
              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded font-black">R-Click / B</span>
              <span className="text-red-400 font-bold uppercase tracking-tighter">Kick / Break</span>
            </div>
          )}
          
          {/* HUD Instructions */}
          {!isPlayerInCar && profile?.inventory.guns?.includes('grenades') && (
            <div className="bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30 text-[9px] flex items-center gap-2 max-w-fit mt-2">
              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded font-black">G</span>
              <span className="text-red-400 font-bold uppercase tracking-tighter">Throw Grenade</span>
            </div>
          )}

          {gameMode === 'story' && (
            <button 
              onClick={() => {
                setGameState('idle');
              }}
              className="bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg border border-red-400/50 flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all font-bold animate-pulse text-xs"
            >
              <Shirt size={16} /> ACCESS WARDROBE
            </button>
          )}

          {/* Mini-Map */}
          {gameMode === 'city' && (
          <div className="w-full h-48 bg-black/60 border border-white/20 rounded-xl mt-2 relative overflow-hidden backdrop-blur-md shadow-lg shadow-cyan-900/20">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            {/* Center crosshair */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
            <div className="absolute top-2 left-2 text-[8px] font-bold opacity-50 tracking-widest">SATELLITE LINK OK</div>
            
            {/* Player Blip */}
            {telemetry.position && (
              <div 
                className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#0ff] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `${(telemetry.position[0] / mapScale + 0.5) * 100}%`,
                  top: `${(telemetry.position[1] / mapScale + 0.5) * 100}%`
                }}
              >
                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75" />
              </div>
            )}
          </div>
          )}

          {/* Stats Box (Under Map) */}
          <div className="w-full space-y-3 mt-1 bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md">
            {!isPlayerInCar ? (
              <>
                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                    <span className="flex items-center gap-1 text-red-400"><Shield size={12} /> Health</span>
                    <span className="text-red-400">{Math.floor(telemetry.playerHealth ?? 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <motion.div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" animate={{ width: `${telemetry.playerHealth ?? 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                    <span className="flex items-center gap-1 text-orange-400"><Zap size={12} /> Hunger</span>
                    <span className="text-orange-400">{Math.floor(telemetry.hunger ?? 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <motion.div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" animate={{ width: `${telemetry.hunger ?? 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                    <span className="flex items-center gap-1 text-cyan-400"><Zap size={12} /> Thirst</span>
                    <span className="text-cyan-400">{Math.floor(telemetry.thirst ?? 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <motion.div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" animate={{ width: `${telemetry.thirst ?? 100}%` }} />
                  </div>
                </div>

                {(telemetry.isSwimming || (telemetry.playerOxygen ?? 100) < 100) && (
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                      <span className="flex items-center gap-1 text-blue-400"><Zap size={12} /> Oxygen</span>
                      <span className="text-blue-400">{Math.floor(telemetry.playerOxygen ?? 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                      <motion.div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" animate={{ width: `${telemetry.playerOxygen ?? 100}%` }} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                    <span className="flex items-center gap-1 text-green-400"><Shield size={12} /> Car Armor</span>
                    <span className="text-green-400">{Math.floor(health)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <motion.div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" animate={{ width: `${health}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                    <span className="flex items-center gap-1 text-blue-400"><Zap size={12} /> Car Boost</span>
                    <span className="text-blue-400">{Math.floor(boost)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                    <motion.div className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" animate={{ width: `${boost}%` }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Center: Wanted Level */}
        <div className="flex justify-center flex-1">
          {wantedLevel > 0 && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-red-600 px-6 py-2 rounded-full flex items-center gap-3 shadow-lg border-2 border-white"
            >
              <AlertTriangle className="animate-pulse" />
              <span className="text-xl font-bold tracking-widest">WANTED</span>
              <div className="flex">
                {[...Array(wantedLevel)].map((_, i) => (
                  <span key={i} className="text-2xl text-yellow-400">★</span>
                ))}
              </div>
              {policeTimer > 0 && (
                <span className="ml-4 bg-black/40 px-3 py-1 rounded text-sm">
                  EVADING: {policeTimer}s
                </span>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Top Right: Money */}
        <div className="flex flex-col items-end">
          <div className="bg-green-600/80 backdrop-blur-md px-4 py-2 rounded-xl border border-green-400/50 flex flex-col items-end shadow-lg shadow-green-600/20">
            <span className="text-[10px] text-green-200 font-bold tracking-widest uppercase">CASH</span>
            <span className="text-2xl font-black text-white">${telemetry.money ?? 50}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Speed & Weapons */}
      <div className="flex justify-between items-end">
        {/* Left: Speedometer */}
        <div className="space-y-4">
          {isPlayerInCar && (
            <div className="relative w-56 h-36 flex flex-col items-center justify-end bg-black/60 rounded-t-[40px] border border-white/20 border-b-0 backdrop-blur-md shadow-[0_-10px_30px_rgba(34,211,238,0.1)]">
              <div className="absolute inset-0 pt-6 px-6">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                  <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="8" strokeLinecap="round" strokeDasharray="4 10.137" />
                  <motion.path 
                    d="M 5 50 A 45 45 0 0 1 95 50" 
                    fill="none" 
                    stroke="#22d3ee" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray={141.37} 
                    initial={{ strokeDashoffset: 141.37 }}
                    animate={{ strokeDashoffset: 141.37 - (Math.min(speed, 200) / 200) * 141.37 }} 
                    transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                  />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col items-center mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black italic shadow-black drop-shadow-lg text-white" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>{Math.floor(speed)}</span>
                  <span className="text-xs opacity-80 font-bold text-cyan-300 ml-1">KM/H</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Weapon & Social Interaction */}
        <div className="flex flex-col gap-4 items-end pointer-events-auto">
          {/* Boxing Interaction */}
          <motion.div 
            initial={false}
            animate={{ opacity: telemetry.inCombatZone ? 1 : 0, y: telemetry.inCombatZone ? 0 : 20, scale: telemetry.inCombatZone ? 1 : 0.8 }}
            className="bg-black/80 backdrop-blur-md p-5 rounded-xl border border-red-600/50 shadow-2xl shadow-red-600/20 max-w-[200px]"
          >
            <h4 className="text-xs font-black italic text-white flex items-center gap-2">
              <Swords size={14} className="text-red-600" /> COMBAT ZONE
            </h4>
            <div className="mt-3 space-y-2">
              <button 
                onClick={() => alert("Social Invite Sent to Network")}
                className="w-full bg-white/5 border border-white/10 text-white py-1.5 rounded text-[9px] font-bold uppercase hover:bg-white/10"
              >
                Invite to Bout
              </button>
              <button className="w-full bg-red-600 text-white py-1.5 rounded text-[9px] font-bold uppercase hover:bg-red-500">
                Register Match
              </button>
            </div>
          </motion.div>

          {/* Weapon Status */}
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs opacity-60">ACTIVE WEAPON</div>
                <div className="text-lg font-bold">MK-II ASSAULT</div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50">
                <Target size={32} className="text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
