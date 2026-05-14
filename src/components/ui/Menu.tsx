import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Settings, Trophy, ShoppingCart, User as UserIcon, 
  Calendar, Star, Swords, ShieldAlert, X, MessageSquare, Send
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CarPreview } from '../game/CarPreview';
import { Logo } from './Logo';
import { Leaderboard } from './Leaderboard';
import { userService } from '../../services/userService';
import { feedbackService } from '../../services/feedbackService';

export const Menu = () => {
  const { profile, setGameState, gameMode, setGameMode, signIn } = useGame();
  const [activeTab, setActiveTab] = useState<'main' | 'challenges' | 'leaderboard' | 'shop' | 'profile' | 'feedback'>('main');
  const [tempProfile, setTempProfile] = useState({ displayName: profile?.displayName || '', photoURL: profile?.photoURL || '' });
  const [feedback, setFeedback] = useState({ message: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!profile) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          src="https://assets.mixkit.co/videos/preview/mixkit-car-racing-in-the-night-4122-large.mp4"
        />
        <div className="relative z-10 flex flex-col items-center gap-12">
          <Logo className="scale-125" />
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              // Initialize audio context on first interaction
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              if (audioCtx.state === 'suspended') audioCtx.resume();
              signIn();
            }}
            className="group relative bg-white text-black px-12 py-5 rounded-full font-black text-2xl hover:scale-110 transition-all flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center gap-4 group-hover:text-white">
              <UserIcon size={28} /> INITIALIZE DRIVER
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  const MainView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full p-8 h-full items-center">
      {/* Left: Stats and Fast Actions */}
      <div className="lg:col-span-4 space-y-8 h-full flex flex-col justify-center">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <img src={profile.photoURL} alt="pfp" className="w-16 h-16 rounded-full border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{profile.displayName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-mono text-xs font-bold px-2 py-0.5 bg-red-500/10 rounded">{profile.rank} RANK</span>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="text-zinc-500 text-[10px] hover:text-white transition-colors underline underline-offset-4 uppercase font-bold"
                >
                  Edit Identity
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Currency</p>
              <p className="text-xl font-black text-yellow-500 italic">💰 {profile.currency}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Reputation</p>
              <p className="text-xl font-black text-blue-500 italic">⚡ {profile.xp}</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
           <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Select Deployment Zone</h3>
           <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'city', label: 'NEON CITY', desc: 'Urban traversal & evasion' },
                { id: 'parkour1', label: 'SKY TRACK ALPHA', desc: 'Ramps & high-speed jumps' },
                { id: 'parkour2', label: 'PROJECT VERTIGO', desc: 'Advanced precision driving' },
                { id: 'story', label: 'SYNDICATE HIDEOUT', desc: 'Armory & Mob Hub' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setGameMode(mode.id as any)}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    gameMode === mode.id 
                    ? 'bg-red-600/20 border-red-500 text-white' 
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <p className="font-black italic text-sm tracking-tighter">{mode.label}</p>
                  <p className="text-[10px] opacity-60 font-medium">{mode.desc}</p>
                </button>
              ))}
           </div>
        </div>

        <div className="flex flex-col gap-4">
           {/* Primary Actions */}
           <motion.button
             onClick={() => { alert('Matchmaking Server Created! Waiting for players...'); setGameState('playing'); }}
             className="w-full bg-red-600 hover:bg-red-500 text-white font-black italic tracking-tighter text-2xl py-6 rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 border border-red-500/50"
           >
             <Swords size={28} />
             CREATE MATCH
           </motion.button>
           
           <motion.button
             onClick={() => { alert('Searching for available matches...'); setTimeout(() => setGameState('playing'), 2000); }}
             className="w-full bg-white text-black hover:bg-zinc-200 font-black italic tracking-tighter text-2xl py-6 rounded-2xl shadow-xl shadow-white/10 transition-all flex items-center justify-center gap-3"
           >
             <Play size={28} />
             QUICK JOIN
           </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
           {[
             { icon: Trophy, label: 'ELITE LIST', action: () => setActiveTab('leaderboard') },
             { icon: ShoppingCart, label: 'BLACK MARKET', action: () => setActiveTab('shop') },
             { icon: Settings, label: 'GARAGE', action: () => setGameState('garage') },
             { icon: MessageSquare, label: 'FEEDBACK', action: () => setActiveTab('feedback') }
           ].map((item, i) => (
             <motion.button
               key={item.label}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: i * 0.05 }}
               onClick={item.action}
               className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold transition-all border border-white/5 aspect-square lg:aspect-auto h-28 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white`}
             >
               <item.icon size={24} />
               <span className="text-[10px] tracking-widest">{item.label}</span>
             </motion.button>
           ))}
        </div>
      </div>

      {/* Middle: Cinematic Car Preview */}
      <div className="lg:col-span-8 h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent rounded-3xl relative group">
         <CarPreview color={profile.inventory.paints[0] || 'white'} type={profile.inventory.currentCar} />
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none flex flex-col justify-end p-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-5xl font-black italic text-white tracking-tighter">
                {profile.inventory.currentCar?.replace('_', ' ').toUpperCase() || 'M5 COMPETITION'}
              </h3>
              <div className="flex gap-4 mt-4">
                <span className="bg-red-600/20 text-red-500 border border-red-500/30 px-3 py-1 rounded text-xs font-bold uppercase">S-Class</span>
                <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                  GUN: {profile.inventory.guns[0]?.replace('_', ' ') || 'NONE'}
                </span>
              </div>
            </motion.div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
       {/* Background Grid/Patterns */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
       
       <Logo className="absolute top-12 scale-75 opacity-50" />

       <AnimatePresence mode="wait">
          {activeTab === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex items-center justify-center pt-24"
            >
              <MainView />
            </motion.div>
          )}

          {activeTab !== 'main' && (
            <motion.div
              key="tab"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-5xl h-[70vh] bg-zinc-900/50 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden flex flex-col mt-24"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-2xl font-black italic tracking-tighter text-red-600">{activeTab.toUpperCase()}</h3>
                <button onClick={() => setActiveTab('main')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500">
                  <X />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'leaderboard' && <Leaderboard />}
                {activeTab === 'profile' && (
                  <div className="p-12 max-w-lg mx-auto space-y-8">
                    <div className="flex justify-center flex-col items-center gap-4 group">
                       <div className="relative">
                         <img src={tempProfile.photoURL} className="w-32 h-32 rounded-full border-4 border-red-600 shadow-2xl object-cover" alt="Preview" />
                         <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                           <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Replace</span>
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => {
                                   setTempProfile(prev => ({ ...prev, photoURL: reader.result as string }));
                                 };
                                 reader.readAsDataURL(file);
                               }
                             }}
                           />
                         </label>
                       </div>
                       <p className="text-xs text-zinc-500 uppercase font-mono">Driver Identity Scan</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Driver Alias</label>
                        <input 
                          type="text" 
                          value={tempProfile.displayName}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, displayName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Digital Signature (Photo URL)</label>
                        <input 
                          type="text" 
                          value={tempProfile.photoURL}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, photoURL: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>
                      
                      <button 
                        onClick={async () => {
                          await userService.updateProfile(profile!.uid, tempProfile);
                          window.location.reload();
                        }}
                        className="w-full bg-red-600 text-white py-4 rounded-xl font-black italic tracking-tighter hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
                      >
                        SAVE CREDENTIALS
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === 'feedback' && (
                  <div className="p-12 max-w-xl mx-auto space-y-8">
                    {!submitted ? (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold italic tracking-tighter">SHARE YOUR INTEL</h4>
                          <p className="text-zinc-500 text-sm">Every report helps us optimize the battlefield. Provide your feedback or report a bug.</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex gap-4 items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Satisfaction Level:</span>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                  key={star} 
                                  onClick={() => setFeedback(f => ({ ...f, rating: star }))}
                                  className={`p-1 transition-all ${feedback.rating >= star ? 'text-yellow-500 scale-110' : 'text-zinc-700 hover:text-zinc-500'}`}
                                >
                                  <Star size={20} fill={feedback.rating >= star ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea 
                            value={feedback.message}
                            onChange={(e) => setFeedback(f => ({ ...f, message: e.target.value }))}
                            placeholder="Type your transmission here..."
                            rows={6}
                            className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                          />

                          <button 
                            disabled={isSubmitting || !feedback.message.trim()}
                            onClick={async () => {
                              setIsSubmitting(true);
                              try {
                                await feedbackService.submitFeedback(profile!.uid, profile!.displayName, feedback.message, feedback.rating);
                                setSubmitted(true);
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            className="w-full bg-red-600 text-white py-4 rounded-xl font-black italic tracking-tighter hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3"
                          >
                            <Send size={20} /> {isSubmitting ? 'UPLOADING...' : 'SEND TRANSMISSION'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20 space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                          <ShieldAlert size={40} />
                        </div>
                        <h4 className="text-3xl font-black italic">INTEL RECEIVED</h4>
                        <p className="text-zinc-500">Your feedback has been encrypted and sent to HQ. Thank you for your contribution, Driver.</p>
                        <button 
                          onClick={() => {
                            setSubmitted(false);
                            setFeedback({ message: '', rating: 5 });
                            setActiveTab('main');
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold transition-all"
                        >
                          BACK TO HQ
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'challenges' && (
                  <div className="p-12 text-center text-zinc-500 italic">
                    <Calendar size={64} className="mx-auto mb-4 opacity-10" />
                    DAILY CHALLENGES & SPECIAL EVENTS LOADING...
                  </div>
                )}
                {activeTab === 'shop' && (
                  <div className="p-12 space-y-8">
                    <div className="text-center space-y-2">
                      <h4 className="text-2xl font-black italic tracking-tighter text-red-600">BLACK MARKET</h4>
                      <p className="text-zinc-500 font-mono text-sm">CURRENT FUNDS: <span className="text-yellow-500 font-bold">💰 {profile?.currency}</span></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: 'grenades', label: 'FRAG GRENADES', price: 250, icon: '💣', desc: 'Explosive ordinance. Clears rooms fast.' },
                        { id: 'smg', label: 'SUBMACHINE GUN', price: 1500, icon: '🔫', desc: 'High fire rate, low accuracy.' },
                        { id: 'armor', label: 'HEAVY ARMOR', price: 500, icon: '🛡️', desc: 'Reduces incoming damage by 50%.' },
                      ].map(item => {
                        const ownsItem = profile?.inventory.guns?.includes(item.id);
                        
                        return (
                          <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-6 flex items-start gap-4 hover:border-red-500/50 transition-colors">
                            <div className="text-4xl">{item.icon}</div>
                            <div className="flex-1">
                              <h5 className="font-bold text-white uppercase tracking-tighter">{item.label}</h5>
                              <p className="text-zinc-500 text-xs mt-1 h-8">{item.desc}</p>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="font-mono text-yellow-500 font-bold">💰 {item.price}</span>
                                <button 
                                  disabled={ownsItem || profile!.currency < item.price}
                                  onClick={async () => {
                                    if (ownsItem || profile!.currency < item.price) return;
                                    
                                    const newInventory = {
                                      ...profile!.inventory,
                                      guns: [...(profile!.inventory.guns || []), item.id]
                                    };
                                    
                                    await userService.updateProfile(profile!.uid, {
                                      currency: profile!.currency - item.price,
                                      inventory: newInventory
                                    });
                                    
                                    window.location.reload(); // Quick refresh to sync state
                                  }}
                                  className="bg-white/10 hover:bg-red-600 border border-white/10 hover:border-red-500 disabled:opacity-50 disabled:grayscale transition-all rounded px-4 py-1.5 text-xs font-bold uppercase disabled:cursor-not-allowed"
                                >
                                  {ownsItem ? 'OWNED' : 'PURCHASE'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
