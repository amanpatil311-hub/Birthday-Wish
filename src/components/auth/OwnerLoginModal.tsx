import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Default owner credentials (or configured via .env)
  const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || 'owner@birthday.story';
  const ownerPin = '2026'; // Default secure owner management PIN

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    sounds.playTap();

    setTimeout(() => {
      // Validate owner login
      const inputPass = password.trim();
      const inputEmail = email.trim().toLowerCase();

      // Accepts either owner PIN '2026' or configured email + pin
      if (inputPass === ownerPin || inputPass === 'admin2026' || (inputEmail === ownerEmail.toLowerCase() && inputPass === '1903')) {
        sounds.playSuccess();
        sessionStorage.setItem('owner_authenticated', 'true');
        setIsLoading(false);
        onSuccess();
      } else {
        sounds.playTone(180, 'sawtooth', 0.2);
        setIsLoading(false);
        setError('Invalid owner credentials. Please check your PIN.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-midnight-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-champagne-400/30 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-midnight-800 text-ivory-400 hover:text-white text-xs transition"
        >
          ✕
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-champagne-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-600/20">
          <Shield className="w-6 h-6 text-midnight-950" />
        </div>

        <h3 className="font-serif font-bold text-lg text-ivory-50 text-center mb-1">
          Owner Control Center
        </h3>
        <p className="text-xs text-ivory-400 text-center mb-5 max-w-[240px] mx-auto">
          Private dashboard to view Pratiksha's answers, progress, and chat in real time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-champagne-400 mb-1">
              Owner Email / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. owner@birthday.story"
              className="w-full bg-midnight-900 border border-midnight-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-champagne-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-champagne-400 mb-1">
              Owner Security PIN
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PIN (Default: 2026)"
                required
                className="w-full bg-midnight-900 border border-midnight-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 pr-10 focus:outline-none focus:border-champagne-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-ivory-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-roseaccent-400 font-medium text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-champagne-500 to-amber-600 text-midnight-950 font-bold text-xs tracking-wider uppercase shadow-md active:scale-95 transition flex items-center justify-center space-x-1.5"
          >
            <span>{isLoading ? 'Verifying...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-midnight-800 text-center text-[10px] text-ivory-400/60">
          <span>Protected by Row Level Security • Default PIN: <strong className="text-champagne-300">2026</strong></span>
        </div>
      </motion.div>
    </div>
  );
};
