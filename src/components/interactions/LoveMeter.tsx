import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Send, Check } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { db } from '../../lib/db';
import confetti from 'canvas-confetti';

export const LoveMeter: React.FC = () => {
  const [value, setValue] = useState(100);
  const [isLocked, setIsLocked] = useState(false);

  const getVibeStatus = (val: number) => {
    if (val < 500) return { emoji: '😊', text: 'Sweet & Warm' };
    if (val < 1500) return { emoji: '🥰', text: 'Head Over Heels' };
    if (val < 4000) return { emoji: '💖', text: 'Endless Butterfies' };
    if (val < 8000) return { emoji: '🚀', text: 'To The Moon & Back' };
    return { emoji: '👑✨', text: 'Infinite & Eternal (Beyond 10,000%)' };
  };

  const currentStatus = getVibeStatus(value);

  const handleLockIn = async () => {
    sounds.playTap();
    sounds.playSuccess();
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#e28394', '#e6cfa3', '#fdfbf7']
    });

    setIsLocked(true);
    await db.submitResponse('love-meter-vibe', 'pratiksha-user', {
      percent: value,
      vibe: currentStatus.text
    });
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 border border-roseaccent-400/25 shadow-xl relative overflow-hidden">
      
      <div className="flex items-center space-x-2 mb-2">
        <Heart className="w-4 h-4 text-roseaccent-400 fill-roseaccent-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-roseaccent-300">
          The Friendship & Love Meter
        </span>
      </div>

      <h4 className="font-serif font-bold text-base text-ivory-50 mb-1">
        How much do you mean to each other?
      </h4>
      <p className="text-xs text-ivory-400 mb-4">
        Drag the slider to calculate the official vibe percentage:
      </p>

      {/* Dynamic Display */}
      <div className="bg-midnight-900/90 rounded-2xl p-4 border border-midnight-700 text-center mb-4 relative">
        <motion.div
          key={currentStatus.text}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl mb-1"
        >
          {currentStatus.emoji}
        </motion.div>

        <div className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-roseaccent-400 to-champagne-300">
          {value.toLocaleString()}%
        </div>
        <p className="text-xs font-semibold text-champagne-300 mt-0.5">
          {currentStatus.text}
        </p>
      </div>

      {/* Interactive Slider */}
      <div className="space-y-3">
        <input
          type="range"
          min="100"
          max="10000"
          step="50"
          value={value}
          disabled={isLocked}
          onChange={(e) => {
            setValue(Number(e.target.value));
            if (Number(e.target.value) % 500 === 0) sounds.playTone(300 + Number(e.target.value) / 20, 'sine', 0.05, 0.05);
          }}
          className="w-full h-2 bg-midnight-900 rounded-lg appearance-none cursor-pointer accent-roseaccent-500"
        />

        <div className="flex justify-between text-[10px] text-ivory-400 font-mono">
          <span>100%</span>
          <span>5,000%</span>
          <span>10,000%+</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-midnight-800">
        {isLocked ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center space-x-1">
            <Check className="w-4 h-4 mr-1" />
            <span>Vibe Locked & Sent to Him!</span>
          </div>
        ) : (
          <button
            onClick={handleLockIn}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-roseaccent-600 to-champagne-600 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lock In My Vibe Rating</span>
          </button>
        )}
      </div>

    </div>
  );
};
