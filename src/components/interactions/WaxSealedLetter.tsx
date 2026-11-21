import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, CheckCircle2, Sparkles, Feather } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { db } from '../../lib/db';
import confetti from 'canvas-confetti';

interface WaxSealedLetterProps {
  letterNote?: string;
}

export const WaxSealedLetter: React.FC<WaxSealedLetterProps> = ({
  letterNote
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplySent, setIsReplySent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleOpenSeal = () => {
    sounds.playTone(350, 'sawtooth', 0.2);
    sounds.playSuccess();
    setIsOpen(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#e28394', '#e6cfa3', '#fdfbf7']
    });
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    sounds.playTap();
    sounds.playFanfare();

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#e28394', '#e6cfa3', '#fdfbf7']
    });

    await db.submitResponse('pratiksha-final-letter-reply', 'pratiksha-user', replyText.trim());
    setIsSending(false);
    setIsReplySent(true);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 border border-champagne-400/25 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
      
      {!isOpen ? (
        /* The Sealed Envelope */
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full max-w-sm bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl border-2 border-amber-200/80 shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group select-none"
          onClick={handleOpenSeal}
        >
          {/* Diagonal Envelope Flaps */}
          <div className="absolute inset-0 border-b-[100px] border-b-transparent border-t-[110px] border-t-amber-100/90 border-x-[180px] border-x-transparent pointer-events-none opacity-80" />

          <p className="text-xs font-serif italic text-amber-900/60 mb-6 z-10 font-bold">
            Sealed for Pratiksha's Eyes Only 💌
          </p>

          {/* The Wax Seal Button */}
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 shadow-xl border-2 border-rose-300 flex items-center justify-center text-white"
          >
            <span className="text-2xl animate-pulse">❤️</span>
          </motion.div>

          <p className="text-[11px] font-bold text-amber-800 mt-5 tracking-widest z-10 uppercase animate-bounce-slow font-sans">
            Tap Wax Seal To Break Open
          </p>
        </motion.div>
      ) : (
        /* The Unfolded Heartfelt Letter */
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm bg-[#fcf9f2] text-slate-800 rounded-3xl p-6 shadow-2xl border border-amber-200 text-left relative"
        >
          {/* Header Stamp */}
          <div className="flex justify-between items-start border-b border-amber-200/60 pb-3 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900/60 font-sans block">
                Official Birthday Letter
              </span>
              <p className="text-xs font-semibold text-slate-500 font-sans">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="w-10 h-10 border-2 border-dashed border-roseaccent-400 rounded-lg flex items-center justify-center text-lg bg-rose-50 rotate-3 shadow-sm">
              💌
            </div>
          </div>

          {/* Letter Body in Caveat Handwriting */}
          <div className="font-handwriting text-2xl text-slate-800 space-y-4 leading-relaxed">
            <p>Dearest Pratiksha,</p>
            <p>
              {letterNote ||
                "As another incredible year begins, I just wanted to pause and remind you how genuinely special you are. Your presence lights up every room, your kindness changes lives, and having you in my world is one of my greatest blessings."}
            </p>
            <p>
              May this year bring you endless adventures, quiet moments of pure peace, dreams coming true, and cake—lots and lots of cake! 🎂✨
            </p>
            <p className="text-right pt-3 font-bold text-rose-700">
              With All My Love ❤️
            </p>
          </div>

          {/* Write Back to Him Section */}
          <div className="mt-6 pt-4 border-t border-amber-200/80">
            <h4 className="font-serif font-bold text-xs text-slate-800 mb-1 flex items-center">
              <Feather className="w-3.5 h-3.5 text-roseaccent-600 mr-1.5" />
              Write A Note Back To Him:
            </h4>

            {isReplySent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1 mt-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 font-sans">
                  Letter Delivered Directly To Him! 🚀
                </p>
                <p className="text-[11px] text-emerald-700 font-handwriting text-xl">
                  "{replyText}"
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendReply} className="space-y-2 mt-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Leave your heartfelt thoughts, reaction, or words for him..."
                  className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-roseaccent-400 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-roseaccent-600 to-amber-600 hover:from-roseaccent-700 hover:to-amber-700 text-white font-bold text-xs font-sans shadow-md transition active:scale-95 disabled:opacity-40 flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send With Love 🚀</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
};
