import React from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../../types';
import { Sparkles, MessageCircleHeart, Heart, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { QuestionCard } from '../interactions/QuestionCard';
import { MemoryMatchGame } from '../interactions/MemoryMatchGame';
import { LoveMeter } from '../interactions/LoveMeter';
import { ScratchCard } from '../interactions/ScratchCard';
import { BirthdayCakeRitual } from '../interactions/BirthdayCakeRitual';
import { WaxSealedLetter } from '../interactions/WaxSealedLetter';
import { EmbeddedChat } from '../chat/EmbeddedChat';

interface ChapterViewProps {
  chapter: Chapter;
  totalChapters: number;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenChat?: () => void;
  isChatUnlocked: boolean;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  totalChapters,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
  onOpenChat,
  isChatUnlocked
}) => {
  return (
    <motion.article
      key={chapter.id}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto flex flex-col space-y-6 pb-24"
    >
      {/* Chapter Number & Subtitle */}
      <header className="text-center pt-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-midnight-900/90 border border-champagne-400/25 text-[10px] font-bold uppercase tracking-widest text-champagne-300 mb-2 shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-champagne-400" />
          <span>Chapter 0{chapter.order_index} of 0{totalChapters}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-tight"
        >
          {chapter.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-roseaccent-300/80 font-medium tracking-wide mt-1"
        >
          {chapter.subtitle}
        </motion.p>
      </header>

      {/* Cinematic Polaroid Media Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="w-full relative group"
      >
        <div className="bg-ivory-50 text-slate-800 p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-ivory-200 transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative">
          
          {/* Polaroid Tape Sticker visual */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-champagne-200/80 backdrop-blur-sm border border-champagne-300/60 rotate-1 shadow-sm rounded-sm" />

          {/* Photo / Video / GIF Frame */}
          <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 relative shadow-inner">
            {(() => {
              const mediaUrl = chapter.video_url || chapter.cover_image;
              const isVideo = chapter.media_type === 'video' || Boolean(chapter.video_url) || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(mediaUrl);

              if (isVideo) {
                return (
                  <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                  />
                );
              }

              return (
                <img
                  src={mediaUrl}
                  alt={chapter.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                  loading="lazy"
                />
              );
            })()}

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Photo Caption */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-sans">
              <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full font-semibold border border-white/10">
                Memories of Us 💫
              </span>
              <span className="text-champagne-200 text-xs flex items-center">
                <Heart className="w-3.5 h-3.5 text-roseaccent-400 fill-roseaccent-400 mr-1" />
                Pratiksha
              </span>
            </div>
          </div>

          {/* Polaroid Bottom Note */}
          <div className="pt-3 pb-1 text-center font-handwriting text-xl text-slate-700 tracking-wide">
            {chapter.subtitle}
          </div>
        </div>

        {/* Ambient Glow behind Polaroid */}
        <div className="absolute -inset-3 bg-gradient-to-r from-roseaccent-500/10 via-champagne-500/10 to-roseaccent-500/10 rounded-3xl blur-xl -z-10" />
      </motion.div>

      {/* Cinematic Quote Card */}
      {chapter.quote && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-4 border border-champagne-400/20 text-center relative overflow-hidden"
        >
          <Quote className="w-5 h-5 text-champagne-400/30 mx-auto mb-1.5" />
          <blockquote className="font-serif italic text-sm text-ivory-100 leading-relaxed max-w-sm mx-auto">
            {chapter.quote}
          </blockquote>
        </motion.div>
      )}

      {/* Story Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl p-4 sm:p-5 border border-roseaccent-500/15"
      >
        <p className="text-xs sm:text-sm text-ivory-200/90 leading-relaxed font-sans">
          {chapter.description}
        </p>
      </motion.div>

      {/* Handwritten Personal Note */}
      {chapter.personal_note && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#fbf7ee] text-slate-800 rounded-2xl p-5 shadow-xl border border-champagne-300/80 relative"
        >
          <div className="flex items-center justify-between border-b border-amber-900/10 pb-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60 font-sans">
              Personal Note for Pratiksha
            </span>
            <span className="text-xs">💌</span>
          </div>

          <p className="font-handwriting text-2xl text-slate-800 leading-relaxed">
            "{chapter.personal_note}"
          </p>

          <div className="text-right pt-2 border-t border-amber-900/10 text-[11px] font-serif italic text-amber-900/70">
            — With all my heart
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* CHAPTER-SPECIFIC INTERACTIVE EXPERIENCES & GAMES */}
      {/* ============================================================== */}

      {/* CHAPTER 01: The Beginning -> Memory Question */}
      {chapter.order_index === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4 pt-2"
        >
          <QuestionCard
            id="ch-01-first-thought"
            chapterId={chapter.id}
            question="Do you remember what you first thought when we started talking?"
            subtitle="Be totally honest! Your answer goes straight to his private inbox 😉"
            options={[
              'Who is this interesting person? 🤔',
              'We clicked so naturally from minute one ✨',
              'I knew you were special right away 💖',
              'I was just playing it cool 😎'
            ]}
            allowCustomText={true}
          />
        </motion.div>
      )}

      {/* CHAPTER 02: How We Met -> Memory Match Game & Favorite Memory */}
      {chapter.order_index === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-5 pt-2"
        >
          <MemoryMatchGame />

          <QuestionCard
            id="ch-02-feeling-safe"
            chapterId={chapter.id}
            question="What is your favorite feeling when we are together?"
            subtitle="Tell me what warms your heart most about us..."
            options={[
              'Feeling completely safe, peaceful, and at home 🕊️',
              'Being able to talk about anything without any judgment 🌙',
              'Laughing together until our stomachs hurt 😂',
              'Knowing you always understand me effortlessly 💖'
            ]}
            allowCustomText={true}
          />
        </motion.div>
      )}

      {/* CHAPTER 03: Little Moments -> The Love Meter & Next Adventure Poll */}
      {chapter.order_index === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-5 pt-2"
        >
          <LoveMeter />

          <QuestionCard
            id="ch-03-teleport"
            chapterId={chapter.id}
            question="If we could teleport anywhere this weekend, where would we go?"
            subtitle="Pick our next dream adventure ✈️"
            options={[
              'Cozy mountain cabin with hot chocolate 🏔️',
              'Peaceful beach watching the sunset 🌅',
              'Exploring street food in a brand new city 🍜',
              'Staying in, ordering pizza & binge-watching movies 🍕'
            ]}
            allowCustomText={true}
          />
        </motion.div>
      )}

      {/* CHAPTER 04: Things I Never Said -> Live Embedded Chat & Secret Smile */}
      {chapter.order_index === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-5 pt-2"
        >
          {/* Live Two-Way Chat Box */}
          <EmbeddedChat />

          <QuestionCard
            id="ch-04-secret-smile"
            chapterId={chapter.id}
            question="What is one little thing that always makes you smile?"
            subtitle="Something simple that warms your heart..."
            options={[
              'A sweet unexpected message 📱',
              'My favorite comfort food 🍰',
              'Listening to our favorite songs 🎶',
              'Just knowing someone cares about me 💫'
            ]}
            allowCustomText={true}
          />
        </motion.div>
      )}

      {/* CHAPTER 05: Things Left Unsaid -> Golden Scratch Card & Future Promise */}
      {chapter.order_index === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-5 pt-2"
        >
          <ScratchCard />

          <QuestionCard
            id="ch-05-future-promise"
            chapterId={chapter.id}
            question="What is one promise we should make to each other for this year?"
            subtitle="A pinky promise for the journey ahead 🌸"
            options={[
              'Always make time to talk, no matter how busy 📞',
              'Go on at least one big adventure together 🗺️',
              'Never go to sleep upset with each other 🕊️',
              'Keep laughing like we always do 😄'
            ]}
            allowCustomText={true}
          />
        </motion.div>
      )}

      {/* CHAPTER 06: The Birthday Surprise -> Birthday Cake, Candle Blow & Wish */}
      {chapter.order_index === 6 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-5 pt-2"
        >
          <BirthdayCakeRitual />
        </motion.div>
      )}

      {/* CHAPTER 07: One Last Note -> Wax Sealed Letter & Write-Back Note */}
      {chapter.order_index === 7 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-5 pt-2"
        >
          <WaxSealedLetter letterNote={chapter.personal_note} />
        </motion.div>
      )}

      {/* Navigation Controls */}
      <footer className="pt-4 flex items-center justify-between border-t border-midnight-800">
        <button
          onClick={() => {
            sounds.playTap();
            onPrev();
          }}
          disabled={!hasPrev}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            hasPrev
              ? 'glass-card text-ivory-200 hover:text-white hover:border-champagne-400/40 active:scale-95'
              : 'opacity-30 cursor-not-allowed text-ivory-400'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] font-mono text-champagne-400/70">
          {chapter.order_index} / {totalChapters}
        </span>

        <button
          onClick={() => {
            sounds.playTap();
            onNext();
          }}
          disabled={!hasNext}
          className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            hasNext
              ? 'bg-gradient-to-r from-roseaccent-600 to-champagne-600 text-white shadow-md shadow-roseaccent-600/20 hover:from-roseaccent-500 hover:to-champagne-500 active:scale-95'
              : 'opacity-30 cursor-not-allowed text-ivory-400 glass-card'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </motion.article>
  );
};
