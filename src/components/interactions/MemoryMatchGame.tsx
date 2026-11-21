import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, RotateCcw, Heart } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { db } from '../../lib/db';
import confetti from 'canvas-confetti';

interface CardItem {
  id: number;
  emoji: string;
  name: string;
}

const MEMORY_CARDS = [
  { id: 1, emoji: '☕', name: 'Coffee Dates' },
  { id: 2, emoji: '🍕', name: 'Late-Night Food' },
  { id: 3, emoji: '🚗', name: 'Roadtrips' },
  { id: 4, emoji: '💖', name: 'Us Forever' },
];

export const MemoryMatchGame: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const initGame = () => {
    const paired = [...MEMORY_CARDS, ...MEMORY_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, uniqueIndex: index }));
    setCards(paired as any);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const clickedCard = cards[index];
    if (matchedIds.includes(clickedCard.id)) return;

    sounds.playTap();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.id === card2.id) {
        // Matched!
        setTimeout(() => {
          sounds.playSuccess();
          const newMatched = [...matchedIds, card1.id];
          setMatchedIds(newMatched);
          setFlippedIndices([]);

          if (newMatched.length === MEMORY_CARDS.length) {
            // Completed!
            setIsCompleted(true);
            sounds.playFanfare();
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#e28394', '#e6cfa3', '#fdfbf7']
            });
            db.submitGameResult('memory-match', 'pratiksha-user', 100 - moves * 2, {
              moves: moves + 1,
              completedAt: new Date().toISOString()
            });
          }
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 border border-amber-500/25 shadow-xl relative overflow-hidden">
      
      {/* Game Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mini-Game: Memory Match</span>
          </div>
          <h4 className="font-serif font-bold text-sm text-ivory-50 mt-0.5">
            Match Our Favorite Memories
          </h4>
        </div>

        <button
          onClick={initGame}
          className="p-1.5 rounded-xl glass-card text-ivory-400 hover:text-white transition text-xs flex items-center space-x-1"
          title="Restart Game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-4 gap-2 my-2">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);

          return (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleCardClick(idx)}
              className={`h-20 sm:h-24 rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-all duration-300 relative select-none ${
                isFlipped
                  ? isMatched
                    ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border-2 border-emerald-400/60 shadow-lg'
                    : 'bg-gradient-to-tr from-roseaccent-600/30 to-champagne-400/30 border-2 border-champagne-400/80 shadow-md'
                  : 'bg-midnight-900/90 border border-midnight-700 hover:border-champagne-400/40 shadow-sm'
              }`}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center animate-subtle-pulse">
                  <span className="text-2xl sm:text-3xl mb-1">{card.emoji}</span>
                  <span className="text-[9px] font-bold text-ivory-100 text-center px-1 leading-tight">
                    {card.name}
                  </span>
                </div>
              ) : (
                <span className="text-xl opacity-40">✨</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer / Status */}
      <div className="mt-3 pt-2.5 border-t border-midnight-800 flex items-center justify-between text-xs text-ivory-400">
        <span>Moves: <strong className="text-ivory-100">{moves}</strong></span>
        {isCompleted ? (
          <span className="text-emerald-400 font-bold flex items-center">
            <Trophy className="w-3.5 h-3.5 mr-1" /> Perfect Match! 🎉
          </span>
        ) : (
          <span className="text-[11px] text-champagne-300">Pairs matched: {matchedIds.length} / 4</span>
        )}
      </div>

    </div>
  );
};
