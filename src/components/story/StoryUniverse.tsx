import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_CHAPTERS } from '../../data/chapters';
import { ChapterView } from './ChapterView';
import { Lock, Volume2, VolumeX, MessageCircleHeart, Sparkles, X } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { EmbeddedChat } from '../chat/EmbeddedChat';
import { db } from '../../lib/db';

interface StoryUniverseProps {
  onLock: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  trackTitle: string;
}

export const StoryUniverse: React.FC<StoryUniverseProps> = ({
  onLock,
  isMusicPlaying,
  onToggleMusic,
  trackTitle
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const chapters = INITIAL_CHAPTERS;
  const currentChapter = chapters[currentChapterIndex];

  // Chat unlocks at Chapter 04 (index 3) and persists thereafter
  const isChatUnlocked = currentChapterIndex >= 3;

  useEffect(() => {
    const chapterName = chapters[currentChapterIndex]?.title || `Chapter ${currentChapterIndex + 1}`;
    db.logVisitorEvent('chapter-viewed', `Reading Chapter 0${currentChapterIndex + 1}: ${chapterName} 📖`);
  }, [currentChapterIndex]);

  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const progressPercent = ((currentChapterIndex + 1) / chapters.length) * 100;

  return (
    <div className="min-h-screen bg-midnight-950 text-ivory-100 flex flex-col relative overflow-x-hidden selection:bg-roseaccent-500 selection:text-white">
      
      {/* Ambient Atmospheric Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-roseaccent-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-champagne-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-40 bg-midnight-950/80 backdrop-blur-xl border-b border-champagne-400/15 px-4 py-2.5 flex flex-col space-y-2">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          
          {/* Recipient Branding */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-roseaccent-500 to-champagne-400 flex items-center justify-center text-white shadow-sm text-xs font-serif font-bold">
              P
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-400 block leading-none">
                Pratiksha's Story
              </span>
              <span className="text-xs font-semibold text-ivory-100 leading-tight">
                Chapter 0{currentChapter.order_index}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-1.5">
            {/* Music Button */}
            <button
              onClick={onToggleMusic}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full glass-card hover:border-champagne-400/40 text-xs transition active:scale-95 text-champagne-300"
              title={trackTitle}
            >
              {isMusicPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-champagne-400 animate-pulse" />
                  <span className="text-[10px] font-medium max-w-[90px] truncate hidden sm:inline">
                    {trackTitle}
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-ivory-400" />
                  <span className="text-[10px] text-ivory-400 hidden sm:inline">Music</span>
                </>
              )}
            </button>

            {/* Chat Icon (shows after Chapter 04) */}
            {isChatUnlocked && (
              <button
                onClick={() => setIsChatModalOpen(true)}
                className="relative p-1.5 rounded-full glass-card hover:border-roseaccent-400 text-roseaccent-300 transition text-xs shadow-sm"
                title="Private Real-Time Chat"
              >
                <MessageCircleHeart className="w-4 h-4 text-roseaccent-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-roseaccent-500 ring-2 ring-midnight-950" />
              </button>
            )}

            {/* Lock Back Button */}
            <button
              onClick={onLock}
              className="p-1.5 rounded-full glass-card hover:border-champagne-400/40 text-ivory-400 hover:text-white transition text-xs"
              title="Lock Vault"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient Glowing Progress Bar */}
        <div className="max-w-md mx-auto w-full h-1 bg-midnight-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-roseaccent-500 to-champagne-400 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      {/* Chapter Selection Pill Bar (Scrollable Thumb Navigation) */}
      <nav className="w-full max-w-md mx-auto px-4 py-2.5 overflow-x-auto scrollbar-none flex space-x-2 shrink-0">
        {chapters.map((ch, idx) => {
          const isActive = idx === currentChapterIndex;
          const isPassed = idx < currentChapterIndex;

          return (
            <button
              key={ch.id}
              onClick={() => {
                sounds.playTap();
                setCurrentChapterIndex(idx);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-roseaccent-600 to-champagne-600 text-white shadow-lg shadow-roseaccent-600/25 scale-105'
                  : isPassed
                  ? 'bg-midnight-900/90 text-champagne-300/80 border border-champagne-400/20'
                  : 'bg-midnight-900/50 text-ivory-400/50 border border-midnight-800'
              }`}
            >
              <span>0{ch.order_index}</span>
              <span>{ch.title}</span>
              {ch.unlocks_chat && <span className="text-[10px]">💬</span>}
              {ch.order_index === 6 && <span className="text-[10px]">🎂</span>}
            </button>
          );
        })}
      </nav>

      {/* Main Chapter Story Content */}
      <main className="flex-1 px-4 py-4 w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <ChapterView
            key={currentChapter.id}
            chapter={currentChapter}
            totalChapters={chapters.length}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={currentChapterIndex < chapters.length - 1}
            hasPrev={currentChapterIndex > 0}
            onOpenChat={() => setIsChatModalOpen(true)}
            isChatUnlocked={isChatUnlocked}
          />
        </AnimatePresence>
      </main>

      {/* Real-time Two-Way Chat Modal */}
      <AnimatePresence>
        {isChatModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-[85vh] sm:h-[620px] glass-panel rounded-t-[32px] sm:rounded-3xl p-4 sm:p-5 border border-roseaccent-400/30 flex flex-col shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-midnight-800 pb-3 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-roseaccent-500 to-champagne-400 flex items-center justify-center text-white text-xs font-serif font-bold shadow-sm">
                    P
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-ivory-50">Private Real-Time Chat</h3>
                    <p className="text-[10px] text-champagne-300">Direct channel with your person ✨</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-midnight-800 text-ivory-400 hover:text-white text-xs transition"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <EmbeddedChat />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
