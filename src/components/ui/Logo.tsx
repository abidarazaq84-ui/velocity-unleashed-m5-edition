import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex flex-col items-center select-none ${className}`}
    >
      <div className="relative mb-[-1rem]">
        <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse"></div>
        <h1 className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          VELOCITY
        </h1>
        <div className="flex items-center justify-center gap-2 mt-[-0.5rem]">
          <div className="h-[2px] w-12 bg-red-600"></div>
          <p className="text-2xl font-bold tracking-[0.5em] text-red-600 italic">UNLEASHED</p>
          <div className="h-[2px] w-12 bg-red-600"></div>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        <p className="text-[10px] font-mono tracking-[0.4em] text-zinc-500 mt-2">RACING LEGENDS • GAME LOGO</p>
      </div>
    </motion.div>
  );
};
