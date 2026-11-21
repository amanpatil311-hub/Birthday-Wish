import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Sparkles, Send, CheckCircle2, RotateCcw } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { db } from '../../lib/db';
import confetti from 'canvas-confetti';

const COMPLIMENTS = [
  "Your smile can turn any heavy day into pure sunshine! ☀️",
  "The world is 100x brighter with you in it. ✨",
  "Legendary kindness, unmatched intelligence, and effortless grace. 👑",
  "May this year give you everything your kind heart deserves! 💖",
  "Forever cheering for your biggest dreams to come true! 🚀",
  "You are truly one of one. Never forget how loved you are! 🌸"
];

export const BirthdayCakeRitual: React.FC = () => {
  const [candlesBlown, setCandlesBlown] = useState([false, false, false]);
  const [isCelebrated, setIsCelebrated] = useState(false);
  const [wishText, setWishText] = useState('');
  const [isWishSent, setIsWishSent] = useState(false);
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([]);
  const [activeCompliment, setActiveCompliment] = useState<string | null>(null);

  const blowAllCandles = () => {
    sounds.playTone(180, 'sine', 0.15); // blow sound
    setCandlesBlown([true, true, true]);
    setIsCelebrated(true);

    setTimeout(() => {
      sounds.playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e28394', '#e6cfa3', '#fdfbf7', '#cf5f73', '#fbbf24']
      });
    }, 300);
  };

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;

    sounds.playTap();
    sounds.playSuccess();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#e28394', '#e6cfa3', '#fdfbf7']
    });

    setIsWishSent(true);
    await db.submitResponse('birthday-secret-wish', 'pratiksha-user', wishText.trim());
  };

  const popBalloon = (index: number) => {
    if (poppedBalloons.includes(index)) return;
    sounds.playTone(520, 'sine', 0.08, 0.15);
    setPoppedBalloons((prev) => [...prev, index]);
    setActiveCompliment(COMPLIMENTS[index % COMPLIMENTS.length]);
  };

  const relightCandles = () => {
    sounds.playTap();
    setCandlesBlown([false, false, false]);
    setIsCelebrated(false);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 border border-champagne-400/25 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
      
      {/* Header */}
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-midnight-900 border border-champagne-400/25 text-[10px] font-bold uppercase tracking-wider text-champagne-300 mb-2">
        <Cake className="w-3.5 h-3.5" />
        <span>Official Birthday Ritual</span>
      </div>

      <h3 className="font-serif font-bold text-xl sm:text-2xl text-ivory-50 mb-1">
        Make A Secret Birthday Wish 🎂
      </h3>
      <p className="text-xs text-ivory-300 max-w-xs mx-auto mb-5">
        Close your eyes, think of your biggest dream for this year, and blow out the candles!
      </p>

      {/* 3D Cake Visual Element */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-end select-none my-2">
        
        {/* 3 Flickering Candles */}
        <div className="flex justify-center space-x-6 sm:space-x-8 mb-0 z-20">
          {[0, 1, 2].map((idx) => {
            const isBlown = candlesBlown[idx];
            return (
              <div key={idx} className="flex flex-col items-center">
                {!isBlown ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 0.8 + idx * 0.2 }}
                    className="w-3 h-5 bg-gradient-to-t from-amber-400 via-orange-400 to-yellow-200 rounded-full shadow-lg shadow-amber-500/50"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0.8, y: 0 }}
                    animate={{ opacity: 0, y: -15 }}
                    transition={{ duration: 1.5 }}
                    className="w-1.5 h-4 bg-slate-400/60 rounded-full"
                  />
                )}
                <div className="w-1 h-1.5 bg-slate-800" />
                <div className="w-2.5 h-7 bg-gradient-to-r from-roseaccent-300 via-white to-roseaccent-400 rounded-t-sm shadow-sm" />
              </div>
            );
          })}
        </div>

        {/* Cake Top Tier */}
        <div className="w-28 sm:w-32 h-12 bg-gradient-to-b from-roseaccent-300 via-roseaccent-200 to-roseaccent-400 rounded-t-2xl shadow-inner border-t-2 border-white flex items-center justify-around px-2 relative z-10">
          <span className="text-xs">🍓</span>
          <span className="text-xs">🍒</span>
          <span className="text-xs">🍓</span>
        </div>

        {/* Cake Base Tier */}
        <div className="w-44 sm:w-48 h-16 bg-gradient-to-b from-roseaccent-400 via-roseaccent-300 to-roseaccent-500 rounded-t-3xl shadow-lg border-t-2 border-white flex flex-col justify-between p-2 relative -mt-1">
          <div className="flex justify-around items-center text-xs opacity-80">
            <span>✨</span><span>💖</span><span>✨</span><span>👑</span><span>✨</span>
          </div>
          <div className="font-handwriting text-lg font-bold text-white tracking-widest drop-shadow">
            Pratiksha
          </div>
        </div>

        {/* Cake Stand */}
        <div className="w-52 sm:w-56 h-3 bg-gradient-to-r from-slate-200 via-white to-slate-300 rounded-full shadow-md" />
        <div className="w-20 h-2.5 bg-slate-400/60 rounded-b-md shadow-sm" />
      </div>

      {/* Candle Action Button */}
      <div className="w-full max-w-xs mt-4">
        {!isCelebrated ? (
          <button
            onClick={blowAllCandles}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-roseaccent-600 via-roseaccent-500 to-champagne-600 hover:from-roseaccent-500 hover:to-champagne-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-roseaccent-600/25 active:scale-95 transition flex items-center justify-center space-x-2"
          >
            <span>💨 Blow Out The Candles!</span>
          </button>
        ) : (
          <button
            onClick={relightCandles}
            className="text-[11px] text-ivory-400 hover:text-champagne-300 underline underline-offset-4 flex items-center justify-center mx-auto space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Relight Candles</span>
          </button>
        )}
      </div>

      {/* Secret Wish Input (appears after candles blown) */}
      <AnimatePresence>
        {isCelebrated && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mt-4 p-4 rounded-2xl bg-midnight-900/90 border border-champagne-400/30 text-left"
          >
            <h4 className="font-serif font-bold text-xs text-champagne-300 mb-1 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-champagne-400 mr-1" />
              Send Your Secret Wish:
            </h4>

            {isWishSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 font-semibold text-center flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Wish sent to the stars! May it all come true! ✨</span>
              </div>
            ) : (
              <form onSubmit={handleSendWish} className="space-y-2 mt-2">
                <input
                  type="text"
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Type your secret wish here..."
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-roseaccent-400"
                />
                <button
                  type="submit"
                  disabled={!wishText.trim()}
                  className="w-full py-2 rounded-xl bg-roseaccent-500 hover:bg-roseaccent-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 disabled:opacity-30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Wish to Him</span>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Balloon Pop Minigame */}
      <div className="w-full max-w-sm mt-6 pt-5 border-t border-midnight-800 text-left">
        <h4 className="font-serif font-bold text-xs text-ivory-100 mb-1">
          Pop The Birthday Balloons 🎈
        </h4>
        <p className="text-[11px] text-ivory-400 mb-3">
          Tap each balloon to pop it and reveal a hidden compliment:
        </p>

        {/* Balloon Row */}
        <div className="flex justify-between items-center py-2">
          {['🎈', '🎈', '🎈', '🎈', '🎈', '🎈'].map((balloon, idx) => {
            const isPopped = poppedBalloons.includes(idx);
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 1.2 }}
                onClick={() => popBalloon(idx)}
                className={`text-2xl transition-all duration-300 ${
                  isPopped ? 'opacity-20 scale-75 cursor-default' : 'hover:scale-110 cursor-pointer animate-float-slow'
                }`}
                style={{ animationDelay: `${idx * 0.3}s` }}
              >
                {isPopped ? '💥' : balloon}
              </motion.button>
            );
          })}
        </div>

        {/* Active Revealed Compliment */}
        {activeCompliment && (
          <motion.div
            key={activeCompliment}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-roseaccent-500/15 border border-roseaccent-400/30 text-xs text-roseaccent-200 text-center font-medium mt-2"
          >
            "{activeCompliment}"
          </motion.div>
        )}
      </div>

    </div>
  );
};
