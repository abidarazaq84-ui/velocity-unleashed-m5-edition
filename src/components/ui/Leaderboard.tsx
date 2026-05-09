import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export const Leaderboard = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const path = 'leaderboards/global/entries';
    const q = query(
      collection(db, path),
      orderBy('score', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }, []);

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/20">
          <Trophy size={48} className="text-black" />
        </div>
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter">GLOBAL REPUTATION</h2>
          <p className="text-yellow-500 font-mono">TOP 10 ELITE RACERS</p>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="w-12 text-center text-2xl font-bold italic opacity-40">
              #{i + 1}
            </div>
            <div className="flex-1 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                {entry.displayName?.[0]}
              </div>
              <span className="font-bold text-xl uppercase tracking-tight">{entry.displayName}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-red-500 italic">{entry.score} PT</div>
              <div className="text-xs opacity-50 uppercase">{entry.rank}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
