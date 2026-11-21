import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, Sparkles, Volume2, VolumeX, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { sounds } from './lib/sound';
import confetti from 'canvas-confetti';
import { StoryUniverse } from './components/story/StoryUniverse';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OwnerLoginModal } from './components/auth/OwnerLoginModal';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function App() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMagicalUnlocking, setIsMagicalUnlocking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [trackTitle, setTrackTitle] = useState('A Thousand Years');
  const [trackArtist, setTrackArtist] = useState('Christina Perri');
  const ytPlayerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);

  // Accepted passcodes: primary official date 1903 (DD/MM) + variants
  const envCode = import.meta.env.VITE_RECIPIENT_ACCESS_CODE || '1903';
  const validCodes = [
    '1903',
    '19/03',
    '19-03',
    '19.03',
    envCode.toLowerCase().trim(),
    'magic2026',
    'pratiksha',
    'p',
    'love'
  ];

  useEffect(() => {
    // Check if previously unlocked in this session
    const unlocked = sessionStorage.getItem('vault_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }

    // Check if accessing admin route
    const checkAdminHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
        const isOwner = sessionStorage.getItem('owner_authenticated') === 'true';
        if (isOwner) {
          setIsAdminOpen(true);
        } else {
          setShowOwnerLogin(true);
        }
      }
    };

    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);

    sounds.onMusicStateChange((playing) => {
      setIsMusicPlaying(playing);
    });

    // Initialize YouTube Player for Christina Perri - A Thousand Years (NZGHXy1IAHM)
    const initYT = () => {
      if (window.YT && window.YT.Player) {
        try {
          ytPlayerRef.current = new window.YT.Player('yt-player-container', {
            height: '1',
            width: '1',
            videoId: 'NZGHXy1IAHM',
            playerVars: {
              autoplay: 0,
              controls: 0,
              loop: 1,
              playlist: 'NZGHXy1IAHM',
              playsinline: 1,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                setYtReady(true);
                ytPlayerRef.current.setVolume(75);
              },
              onStateChange: (event: any) => {
                // 1 = playing, 2 = paused
                if (event.data === 1) {
                  setIsMusicPlaying(true);
                } else if (event.data === 2 || event.data === 0) {
                  setIsMusicPlaying(false);
                }
              }
            }
          });
        } catch (e) {
          console.warn('YT Player init error:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = initYT;
    }

    return () => {
      window.removeEventListener('hashchange', checkAdminHash);
    };
  }, []);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputClean = password.toLowerCase().trim();

    if (!inputClean) {
      setError(true);
      setErrorMessage('Please enter the secret key');
      sounds.playTone(200, 'sawtooth', 0.15, 0.1);
      return;
    }

    // Secret Owner Gateway: Typing '2026' or 'admin' directly opens the owner portal
    if (inputClean === '2026' || inputClean === 'admin') {
      sounds.playTap();
      setPassword('');
      const isOwner = sessionStorage.getItem('owner_authenticated') === 'true';
      if (isOwner) {
        setIsAdminOpen(true);
      } else {
        setShowOwnerLogin(true);
      }
      return;
    }

    setIsAuthenticating(true);
    setError(false);

    // Audio feedback
    sounds.playTap();

    setTimeout(() => {
      if (validCodes.includes(password.toLowerCase().trim())) {
        // Magical opening ceremony
        setIsAuthenticating(false);
        setIsMagicalUnlocking(true);
        sounds.playSuccess();

        // Staged celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#e28394', '#e6cfa3', '#fdfbf7', '#cf5f73']
        });

        setTimeout(() => {
          sounds.playFanfare();
          confetti({
            particleCount: 90,
            angle: 60,
            spread: 70,
            origin: { x: 0.1, y: 0.65 },
            colors: ['#e28394', '#e6cfa3', '#fdfbf7']
          });
          confetti({
            particleCount: 90,
            angle: 120,
            spread: 70,
            origin: { x: 0.9, y: 0.65 },
            colors: ['#e28394', '#e6cfa3', '#fdfbf7']
          });
        }, 400);

        setTimeout(() => {
          setIsUnlocked(true);
          setIsMagicalUnlocking(false);
          sessionStorage.setItem('vault_unlocked', 'true');
          // Start background music (studio MP3 from Google Drive)
          sounds.play();
        }, 1200);
      } else {
        // Failed
        setIsAuthenticating(false);
        setError(true);
        setErrorMessage('Incorrect date. Try again with love.');
        sounds.playTone(180, 'sawtooth', 0.25, 0.15);
      }
    }, 450);
  };

  const handleNumberClick = (digit: string) => {
    sounds.playTap();
    if (password.length < 12) {
      setPassword((prev) => prev + digit);
      setError(false);
    }
  };

  const handleDeleteDigit = () => {
    sounds.playTap();
    setPassword((prev) => prev.slice(0, -1));
    setError(false);
  };

  const toggleMusic = () => {
    sounds.toggleMusic().catch(() => {
      if (ytPlayerRef.current && ytReady) {
        ytPlayerRef.current.playVideo();
        setIsMusicPlaying(true);
      }
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      sounds.setCustomAudio(url, file.name.replace(/\.[^/.]+$/, ''), 'Custom Track');
      setTrackTitle(file.name.replace(/\.[^/.]+$/, ''));
      setTrackArtist('Uploaded Audio');
      sounds.play();
      setShowMusicModal(false);
    }
  };

  const handleLockAgain = () => {
    sessionStorage.removeItem('vault_unlocked');
    setIsUnlocked(false);
    setPassword('');
    setIsAuthenticating(false);
    setIsMagicalUnlocking(false);
  };

  if (isAdminOpen) {
    return (
      <AdminDashboard
        onBackToStory={() => setIsAdminOpen(false)}
        onLogout={() => {
          sessionStorage.removeItem('owner_authenticated');
          setIsAdminOpen(false);
        }}
      />
    );
  }

  if (isUnlocked) {
    return (
      <>
        {/* Hidden YouTube Audio Player */}
        <div id="yt-player-container" className="hidden pointer-events-none opacity-0 fixed -top-96" />
        <StoryUniverse
          onLock={handleLockAgain}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={toggleMusic}
          trackTitle={trackTitle}
        />
        <OwnerLoginModal
          isOpen={showOwnerLogin}
          onClose={() => setShowOwnerLogin(false)}
          onSuccess={() => {
            setShowOwnerLogin(false);
            setIsAdminOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-ivory-100 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      
      {/* Hidden YouTube Audio Player for Christina Perri - A Thousand Years */}
      <div id="yt-player-container" className="hidden pointer-events-none opacity-0 fixed -top-96" />
      
      {/* Cinematic Ambient Atmosphere Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-roseaccent-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-champagne-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Starry Particle Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e6cfa3_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08] pointer-events-none" />

      {/* Top Floating Bar */}
      <header className="w-full max-w-md flex items-center justify-between z-20 py-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-roseaccent-500 animate-ping" />
          <span className="text-[11px] font-medium tracking-wider text-ivory-300/80 uppercase">
            Private Vault
          </span>
        </div>

        {/* Music Player Controller */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={toggleMusic}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-card hover:border-champagne-400/40 text-ivory-200 text-xs transition active:scale-95 shadow-sm"
            title="A Thousand Years - Christina Perri"
          >
            {isMusicPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-champagne-400 animate-pulse" />
                <span className="text-[10px] text-champagne-300 font-medium max-w-[120px] truncate">
                  A Thousand Years
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-ivory-400" />
                <span className="text-[10px] text-ivory-400 font-medium">Play Music</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowMusicModal(true)}
            className="p-1.5 rounded-full glass-card hover:border-champagne-400/40 text-ivory-400 hover:text-champagne-300 transition text-xs"
            title="Music Settings & Upload MP3"
          >
            🎵
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-sm flex-1 flex flex-col items-center justify-center relative z-10 py-4">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            /* ==================================================== */
            /* THE VAULT LOCKER SCREEN */
            /* ==================================================== */
            <motion.div
              key="vault-locked"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full glass-panel rounded-[36px] p-6 sm:p-7 border border-champagne-400/25 shadow-2xl relative flex flex-col items-center text-center glow-champagne"
            >
              {/* Top Decorative Vault Notch */}
              <div className="w-16 h-1 bg-champagne-400/30 rounded-full mb-5" />

              {/* The Vault Dial / Locker Icon */}
              <motion.div
                animate={error ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative mb-5"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-midnight-900 via-midnight-800 to-midnight-700 border-2 border-champagne-400/40 flex items-center justify-center shadow-xl shadow-black/60 relative group">
                  {/* Outer mechanical dial rings */}
                  <div className="absolute inset-1 rounded-full border border-dashed border-champagne-400/20 animate-spin" style={{ animationDuration: '30s' }} />
                  
                  {isMagicalUnlocking ? (
                    <motion.div
                      initial={{ scale: 0.8, rotate: -20 }}
                      animate={{ scale: [1, 1.25, 1.1], rotate: [0, 15, 0] }}
                      transition={{ duration: 0.6 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/50"
                    >
                      <Unlock className="w-7 h-7 text-white animate-pulse" />
                    </motion.div>
                  ) : isAuthenticating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Sparkles className="w-8 h-8 text-champagne-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-tr from-roseaccent-600 to-champagne-500 flex items-center justify-center text-white shadow-lg shadow-roseaccent-600/30"
                    >
                      <Lock className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Ambient glow under the lock */}
                <div className="absolute -inset-2 bg-gradient-to-r from-roseaccent-500/20 to-champagne-500/20 rounded-full blur-xl -z-10" />
              </motion.div>

              {/* Personalized Typography requested by user */}
              <div className="mb-6">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-champagne-400 block mb-1.5 font-sans">
                  For someone more special than myself
                </span>
                
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-tight leading-snug">
                  Created With Love For <span className="text-transparent bg-clip-text bg-gradient-to-r from-roseaccent-400 via-champagne-300 to-roseaccent-400">YOU Pratiksha</span>
                </h1>

                <p className="text-xs text-ivory-300/70 font-sans mt-2 max-w-[260px] mx-auto leading-relaxed">
                  Enter your secret key below to unlock your digital birthday story.
                </p>
              </div>

              {/* Password Form */}
              <form onSubmit={handleUnlock} className="w-full flex flex-col items-center">
                
                {/* Visual Pin / Password Dots & Input */}
                <div className="w-full relative mb-3">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      placeholder="Enter the special date (DD/MM)..."
                      className="w-full bg-midnight-900/90 text-ivory-100 text-center tracking-widest text-sm py-3.5 px-10 rounded-2xl border border-champagne-400/30 focus:border-roseaccent-400 focus:ring-2 focus:ring-roseaccent-400/20 focus:outline-none transition-all placeholder:text-ivory-400/30 placeholder:tracking-normal font-sans"
                      autoFocus
                    />
                    <KeyRound className="w-4 h-4 text-champagne-400/60 absolute left-3.5 pointer-events-none" />
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-roseaccent-400 font-medium mt-2 text-center"
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </div>

                {/* Unlock Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-roseaccent-600 via-roseaccent-500 to-champagne-600 hover:from-roseaccent-500 hover:to-champagne-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-roseaccent-600/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-1"
                >
                  {isAuthenticating ? (
                    <span>Opening Vault...</span>
                  ) : (
                    <>
                      <span>Open Vault</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Helpful Hint Toggle */}
                <div className="mt-4 flex items-center justify-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-[11px] text-ivory-400/60 hover:text-champagne-400 transition underline underline-offset-4"
                  >
                    {showHint ? 'Hide hint' : 'Need a hint?'}
                  </button>
                </div>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 rounded-2xl bg-midnight-900/90 border border-champagne-400/25 text-xs text-champagne-200 leading-relaxed shadow-lg text-center"
                  >
                    ✨ <span className="font-semibold text-ivory-100">Hint:</span> The official date when we are really together <span className="text-[11px] text-champagne-400 font-mono font-bold block sm:inline mt-0.5 sm:mt-0">(format: DD/MM)</span>
                  </motion.div>
                )}
              </form>

              {/* Bottom Subtle Security Badge */}
              <div className="mt-6 pt-4 border-t border-midnight-800/80 w-full flex items-center justify-center space-x-1.5 text-[10px] text-ivory-400/50">
                <ShieldCheck className="w-3.5 h-3.5 text-champagne-400/60" />
                <span>Encrypted Personal Storyboard</span>
              </div>
            </motion.div>
          ) : (
            /* ==================================================== */
            /* UNLOCKED VAULT STATE (ENTRANCE TO STORY) */
            /* ==================================================== */
            <motion.div
              key="vault-unlocked"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full glass-panel rounded-[36px] p-7 border border-roseaccent-400/30 shadow-2xl relative flex flex-col items-center text-center glow-rose"
            >
              {/* Unlocked Vault Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 mb-4 animate-bounce-slow">
                <Unlock className="w-7 h-7 text-white" />
              </div>

              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-champagne-400 block mb-1">
                Vault Unlocked
              </span>

              <h2 className="text-2xl font-serif font-bold text-ivory-50 mb-2">
                Welcome, Pratiksha ✨
              </h2>

              <p className="text-xs text-ivory-300 font-sans leading-relaxed mb-6 max-w-[280px]">
                Your personalized story world is ready. 7 cinematic chapters, real-time private chat, games, and surprises await.
              </p>

              <div className="w-full p-3.5 rounded-2xl bg-midnight-900/80 border border-champagne-400/20 mb-6 text-left">
                <div className="flex items-center justify-between text-xs text-champagne-400 font-semibold mb-1">
                  <span>Chapter 01: The Beginning</span>
                  <span className="text-[10px] bg-roseaccent-500/20 text-roseaccent-300 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                </div>
                <p className="text-[11px] text-ivory-400">
                  Where our journey first began. Tap below to begin exploring.
                </p>
              </div>

              <div className="w-full flex flex-col space-y-2">
                <button
                  onClick={() => alert("Ready to load Chapter 01! We'll build the full 7-chapter storytelling journey in Phase 2.")}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-roseaccent-600 via-roseaccent-500 to-champagne-600 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-roseaccent-600/25 active:scale-95 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Begin Chapter 01</span>
                </button>

                <button
                  onClick={handleLockAgain}
                  className="w-full py-2.5 rounded-xl text-ivory-400/60 hover:text-ivory-200 text-xs transition font-medium"
                >
                  🔒 Lock Vault Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Music Selector Modal */}
      <AnimatePresence>
        {showMusicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xs glass-panel rounded-3xl p-6 border border-champagne-400/30 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-roseaccent-600 to-champagne-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Volume2 className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-serif font-bold text-lg text-ivory-50 mb-1">
                Background Music
              </h3>
              <p className="text-xs text-champagne-300 font-medium mb-1">
                {trackTitle}
              </p>
              <p className="text-[11px] text-ivory-400/70 mb-4">
                {trackArtist}
              </p>

              <div className="space-y-2 mb-4">
                <label className="block w-full py-2.5 px-3 rounded-xl bg-midnight-900 border border-champagne-400/20 hover:border-champagne-400/50 cursor-pointer text-xs text-ivory-200 font-medium transition text-center">
                  <span>📁 Upload Your Own .MP3</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    sounds.setCustomAudio('/clip15.mp3', 'Acoustic Melody', 'Original');
                    setTrackTitle('Acoustic Melody');
                    setTrackArtist('Original');
                    sounds.play();
                    setShowMusicModal(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-midnight-900/60 border border-midnight-700 text-xs text-ivory-300 hover:text-white transition"
                >
                  Switch to Upbeat Track
                </button>
              </div>

              <button
                onClick={() => setShowMusicModal(false)}
                className="w-full py-2 rounded-xl bg-roseaccent-600/20 hover:bg-roseaccent-600/30 text-roseaccent-300 text-xs font-semibold transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full max-w-md py-2 text-center text-[11px] text-ivory-400/40 relative z-10 flex items-center justify-center space-x-1">
        <span>Made with</span>
        <Heart className="w-3 h-3 text-roseaccent-400 fill-roseaccent-400 inline" />
        <span>exclusively for Pratiksha</span>
      </footer>

      {/* Owner Login Modal */}
      <OwnerLoginModal
        isOpen={showOwnerLogin}
        onClose={() => setShowOwnerLogin(false)}
        onSuccess={() => {
          setShowOwnerLogin(false);
          setIsAdminOpen(true);
        }}
      />

    </div>
  );
}
