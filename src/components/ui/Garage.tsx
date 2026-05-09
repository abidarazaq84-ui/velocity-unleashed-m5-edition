import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Palette, Car as CarIcon } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CarPreview } from '../game/CarPreview';
import { CAR_MODELS } from '../../types/game';
import { userService } from '../../services/userService';

const COLORS = ['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#111111'];

export const Garage = () => {
  const { profile, setGameState } = useGame();
  const [selectedColor, setSelectedColor] = React.useState(profile?.inventory.paints[0] || COLORS[0]);
  const [selectedCar, setSelectedCar] = React.useState<keyof typeof CAR_MODELS>(profile?.inventory.currentCar || 'BMW_M5');

  if (!profile) return null;

  const currentStats = CAR_MODELS[selectedCar].stats;

  const handleSync = async () => {
    if (!profile) return;
    setGameState('loading');
    try {
      await userService.updateProfile(profile.uid, {
        inventory: {
          ...profile.inventory,
          currentCar: selectedCar,
          paints: [selectedColor]
        }
      });
      // Optionally reload profile in context or assume local state is enough
      // For this simple app, we'll just go back
      setGameState('idle');
      window.location.reload(); // Hard refresh to ensure all components see new car/color
    } catch (e) {
      console.error(e);
      setGameState('garage');
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <button 
          onClick={() => setGameState('idle')}
          className="flex items-center gap-2 hover:text-red-500 transition-colors font-bold uppercase tracking-widest"
        >
          <ArrowLeft /> BACK TO HUB
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black italic">GARAGE : 01</h1>
          <p className="text-xs text-zinc-500">CUSTOMIZATION & UPGRADES</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Preview */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950">
          <CarPreview color={selectedColor} type={selectedCar} />
          
          {/* Stats Overlay */}
          <div className="absolute bottom-8 left-8 space-y-4 max-w-xs">
            <h2 className="text-4xl font-black italic">{CAR_MODELS[selectedCar].name.toUpperCase()}</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-50">TOP SPEED</span>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${currentStats.topSpeed}%` }} className="h-full bg-red-500" />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-50">ACCEL</span>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${currentStats.accel}%` }} className="h-full bg-red-500" />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-50">HANDLING</span>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${currentStats.handling}%` }} className="h-full bg-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-96 border-l border-white/10 p-8 space-y-12 overflow-y-auto bg-zinc-900/50">
          {/* Car Selection */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
              <CarIcon size={16} /> FLEET
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(CAR_MODELS) as Array<keyof typeof CAR_MODELS>).map((modelKey) => {
                const model = CAR_MODELS[modelKey];
                const isLocked = !profile.inventory.cars.includes(modelKey);
                return (
                  <button
                    key={modelKey}
                    onClick={() => !isLocked && setSelectedCar(modelKey)}
                    className={`p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${
                      selectedCar === modelKey ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-white/30'
                    } ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm tracking-tight">{model.name}</span>
                      {selectedCar === modelKey && <Check size={16} className="text-red-500" />}
                    </div>
                    {isLocked && (
                      <div className="mt-2 text-[10px] font-bold text-zinc-500">
                        LOCKED - 💰 {model.price.toLocaleString()}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paint Jobs */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
              <Palette size={16} /> PAINT JOB
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-xl transition-all border border-white/5 ${
                    selectedColor === color ? 'ring-2 ring-white ring-offset-4 ring-offset-zinc-950 scale-90' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Confirm */}
          <button 
           onClick={handleSync}
           className="w-full bg-white text-black py-4 rounded-xl font-black italic text-lg hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            SYNC CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};
