import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Sparkles, MessageCircle } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { db } from '../../lib/db';
import confetti from 'canvas-confetti';

interface QuestionCardProps {
  id: string;
  chapterId: string;
  question: string;
  subtitle?: string;
  options?: string[];
  allowCustomText?: boolean;
  onAnswerSubmitted?: (val: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  chapterId,
  question,
  subtitle,
  options = [],
  allowCustomText = true,
  onAnswerSubmitted
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (value: string) => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    sounds.playTap();

    const success = await db.submitResponse(id, 'pratiksha-user', value.trim());
    setIsSubmitting(false);

    if (success) {
      sounds.playSuccess();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e28394', '#e6cfa3', '#fdfbf7']
      });
      setIsSubmitted(true);
      if (onAnswerSubmitted) onAnswerSubmitted(value);
    }
  };

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    handleSubmit(opt);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 border border-champagne-400/25 shadow-xl relative overflow-hidden">
      
      {/* Question Header */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-roseaccent-500/20 flex items-center justify-center text-roseaccent-300 text-xs font-bold">
          ?
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-400">
          Memory Question for You
        </span>
      </div>

      <h3 className="font-serif font-bold text-base sm:text-lg text-ivory-50 mb-1 leading-snug">
        {question}
      </h3>

      {subtitle && (
        <p className="text-xs text-ivory-400 mb-4 font-sans">
          {subtitle}
        </p>
      )}

      {/* Answer Submitted State */}
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-roseaccent-500/15 to-emerald-500/15 border border-emerald-500/30 text-center space-y-1.5 my-2"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
          <h4 className="font-serif font-bold text-sm text-ivory-50">
            Answer Delivered to Him ✨
          </h4>
          <p className="text-xs text-champagne-300 font-medium">
            "{selectedOption || customText}"
          </p>
          <span className="text-[10px] text-ivory-400/70 block">
            Saved securely in his private memory box. ✨
          </span>
        </motion.div>
      ) : (
        /* Options List */
        <div className="space-y-2 mt-3">
          {options.map((opt, idx) => (
            <button
              key={idx}
              disabled={isSubmitting}
              onClick={() => handleSelectOption(opt)}
              className="w-full text-left p-3.5 rounded-2xl bg-midnight-900/80 hover:bg-midnight-900 border border-midnight-700 hover:border-champagne-400/50 text-xs font-medium text-ivory-100 transition active:scale-[0.99] flex items-center justify-between group shadow-sm"
            >
              <span>{opt}</span>
              <span className="w-5 h-5 rounded-full border border-midnight-600 group-hover:border-champagne-400 flex items-center justify-center text-[10px] text-transparent group-hover:text-champagne-400 transition">
                ✓
              </span>
            </button>
          ))}

          {/* Custom Text Area */}
          {allowCustomText && (
            <div className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Or write your own memory here..."
                  className="w-full bg-midnight-900/90 border border-midnight-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 pr-10 focus:outline-none focus:border-roseaccent-400 placeholder:text-ivory-400/40"
                />
                <button
                  type="button"
                  onClick={() => handleSubmit(customText)}
                  disabled={!customText.trim() || isSubmitting}
                  className="absolute right-2 p-1.5 rounded-lg bg-roseaccent-500 text-white disabled:opacity-30 hover:bg-roseaccent-600 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
