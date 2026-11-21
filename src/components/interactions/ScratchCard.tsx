import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Check, Trophy } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { db } from '../../lib/db';
import confetti from 'canvas-confetti';

interface Perk {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

const PERKS: Perk[] = [
  { id: 'perk-dinner', emoji: '🍕', title: 'Free Dinner Date', desc: 'Any restaurant of your choice, no questions asked!' },
  { id: 'perk-trip', emoji: '🚗', title: 'Spontaneous Roadtrip', desc: 'A weekend getaway with music, scenic views & zero stress.' },
  { id: 'perk-wildcard', emoji: '🧞', title: '1 Wildcard Wish', desc: 'Anything you want, anytime, anywhere. Valid forever.' },
];

export const ScratchCard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [claimedPerk, setClaimedPerk] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with metallic gold/champagne gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#d6b87e');
    grad.addColorStop(0.5, '#f5deb3');
    grad.addColorStop(1, '#caa56b');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add metallic texture sparkles
    ctx.fillStyle = '#9f7f45';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Rub Here to Scratch & Reveal ✨', canvas.width / 2, canvas.height / 2 + 5);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    sounds.playTone(320, 'triangle', 0.04, 0.03);

    // Check how much is scratched
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] === 0) transparentPixels++;
      }
      if (transparentPixels > (imgData.data.length / 16) * 0.45) {
        setIsScratched(true);
        sounds.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#e28394', '#e6cfa3', '#fdfbf7']
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleClaim = async (perk: Perk) => {
    sounds.playTap();
    sounds.playFanfare();
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#e28394', '#e6cfa3', '#fdfbf7']
    });

    setClaimedPerk(perk.id);
    await db.submitGameResult('scratch-perk-claimed', 'pratiksha-user', 100, {
      claimedPerk: perk.title,
      claimedAt: new Date().toISOString()
    });
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 border border-champagne-400/25 shadow-xl relative overflow-hidden">
      
      <div className="flex items-center space-x-2 mb-2">
        <Gift className="w-4 h-4 text-champagne-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-300">
          Birthday Scratch & Reveal
        </span>
      </div>

      <h4 className="font-serif font-bold text-base text-ivory-50 mb-1">
        Claim Your Birthday Perks
      </h4>
      <p className="text-xs text-ivory-400 mb-3">
        Rub your finger over the golden card to reveal 3 VIP coupons:
      </p>

      {/* The Scratch Card Container */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-midnight-900 border border-champagne-400/30 flex items-center justify-center p-3 select-none">
        
        {/* Underlying Revealed Perks Content */}
        <div className="absolute inset-0 p-3 grid grid-cols-3 gap-2 items-center justify-center text-center">
          {PERKS.map((p) => {
            const isClaimed = claimedPerk === p.id;
            return (
              <div
                key={p.id}
                className={`h-full rounded-xl p-2 flex flex-col justify-between items-center transition ${
                  isClaimed
                    ? 'bg-emerald-500/20 border border-emerald-400'
                    : 'bg-midnight-950/80 border border-midnight-700'
                }`}
              >
                <div>
                  <span className="text-2xl block mb-0.5">{p.emoji}</span>
                  <span className="text-[10px] font-bold text-ivory-100 block leading-tight">{p.title}</span>
                </div>
                <button
                  onClick={() => handleClaim(p)}
                  disabled={Boolean(claimedPerk)}
                  className={`w-full py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider mt-1 transition ${
                    isClaimed
                      ? 'bg-emerald-500 text-white'
                      : claimedPerk
                      ? 'opacity-30 bg-midnight-800 text-ivory-400'
                      : 'bg-gradient-to-r from-roseaccent-600 to-champagne-600 text-white hover:brightness-110 active:scale-95'
                  }`}
                >
                  {isClaimed ? 'Claimed! ✓' : 'Claim'}
                </button>
              </div>
            );
          })}
        </div>

        {/* The Golden Scratch Foil Overlay */}
        {!isScratched && (
          <canvas
            ref={canvasRef}
            width={320}
            height={176}
            className="absolute inset-0 w-full h-full cursor-pointer z-10 touch-none"
            onTouchMove={(e) => {
              const touch = e.touches[0];
              scratch(touch.clientX, touch.clientY);
            }}
            onMouseMove={(e) => {
              if (e.buttons === 1) scratch(e.clientX, e.clientY);
            }}
          />
        )}
      </div>

      {/* Claimed Status */}
      {claimedPerk && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center space-x-1.5">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>Perk officially claimed! Notification sent to him. 💖</span>
        </div>
      )}

    </div>
  );
};
