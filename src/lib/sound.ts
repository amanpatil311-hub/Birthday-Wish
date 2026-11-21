// Enhanced Sound Manager with "A Thousand Years" Piano Synthesizer and Audio Player
class SoundManager {
  private audioCtx: AudioContext | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  public isMusicPlaying = false;
  public currentTrackTitle = "A Thousand Years";
  public currentArtist = "Christina Perri";
  private synthTimer: any = null;
  private isUsingSynth = false;

  private onMusicStateChangeCallbacks: ((isPlaying: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.bgAudio = new Audio();
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.5;

      // Check if user previously uploaded a custom audio
      const savedAudio = localStorage.getItem('custom_bg_audio');
      if (savedAudio) {
        this.bgAudio.src = savedAudio;
      } else {
        // Default to public audio or fallback
        const base = import.meta.env.BASE_URL || '/';
        const cleanBase = base.endsWith('/') ? base : `${base}/`;
        this.bgAudio.src = `${cleanBase}thousand_years.mp3`;
      }

      this.bgAudio.onerror = () => {
        // If file doesn't exist, we fallback to synth piano
        console.log('[Audio] File not found, falling back to Web Audio Piano Synthesizer');
        this.isUsingSynth = true;
      };
    }
  }

  public setCustomAudio(url: string, title = "A Thousand Years", artist = "Christina Perri") {
    this.currentTrackTitle = title;
    this.currentArtist = artist;
    this.isUsingSynth = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);

    if (this.bgAudio) {
      this.bgAudio.src = url;
      if (this.isMusicPlaying) {
        this.bgAudio.play().catch(() => {});
      }
    }
    try {
      localStorage.setItem('custom_bg_audio', url);
    } catch (e) {
      // Quota exceeded for data URLs, but in-memory works
    }
  }

  public onMusicStateChange(cb: (isPlaying: boolean) => void) {
    this.onMusicStateChangeCallbacks.push(cb);
  }

  private notifyMusicState(playing: boolean) {
    this.isMusicPlaying = playing;
    this.onMusicStateChangeCallbacks.forEach((cb) => cb(playing));
  }

  public async toggleMusic(): Promise<boolean> {
    if (this.isMusicPlaying) {
      this.stop();
      return false;
    } else {
      await this.play();
      return true;
    }
  }

  public async play(): Promise<void> {
    this.notifyMusicState(true);

    if (this.bgAudio && this.bgAudio.src && !this.isUsingSynth) {
      try {
        await this.bgAudio.play();
        return;
      } catch (err) {
        console.log('[Audio] HTML5 Audio autoplay failed or 404, starting Piano Synthesizer:', err);
        this.isUsingSynth = true;
      }
    }

    // Play Piano Synthesizer arrangement of "A Thousand Years"
    this.startThousandYearsPiano();
  }

  public stop(): void {
    this.notifyMusicState(false);
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Tender Piano note generator
  public playPianoNote(freq: number, duration: number = 0.8, volume = 0.12) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc2.type = 'sine';

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime); // 1st harmonic for rich piano chime

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch {
      // Audio context blocked
    }
  }

  // Melodic arrangement of "A Thousand Years" (Chorus + Verse)
  private startThousandYearsPiano() {
    if (this.synthTimer) clearTimeout(this.synthTimer);

    // Frequencies (Hz):
    // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25, D5=587.33
    const melody: { f: number; d: number; pause: number }[] = [
      // "Heart beats fast..." (Verse)
      { f: 349.23, d: 0.5, pause: 300 }, // F4
      { f: 392.00, d: 0.5, pause: 300 }, // G4
      { f: 440.00, d: 0.8, pause: 450 }, // A4
      { f: 349.23, d: 0.5, pause: 350 }, // F4
      { f: 329.63, d: 0.9, pause: 600 }, // E4

      // "Colors and promises..."
      { f: 349.23, d: 0.5, pause: 300 },
      { f: 392.00, d: 0.5, pause: 300 },
      { f: 440.00, d: 0.8, pause: 450 },
      { f: 349.23, d: 0.5, pause: 350 },
      { f: 293.66, d: 1.0, pause: 700 }, // D4

      // "How to be brave..."
      { f: 349.23, d: 0.5, pause: 300 },
      { f: 392.00, d: 0.5, pause: 300 },
      { f: 440.00, d: 0.8, pause: 450 },
      { f: 466.16, d: 0.8, pause: 500 }, // Bb4
      { f: 440.00, d: 0.6, pause: 350 }, // A4
      { f: 392.00, d: 1.0, pause: 700 }, // G4

      // "I have loved you for a thousand years..." (Chorus)
      { f: 349.23, d: 0.6, pause: 400 }, // I
      { f: 392.00, d: 0.6, pause: 400 }, // have
      { f: 440.00, d: 0.8, pause: 450 }, // loved
      { f: 466.16, d: 0.8, pause: 450 }, // you
      { f: 440.00, d: 0.7, pause: 400 }, // for
      { f: 349.23, d: 0.6, pause: 350 }, // a
      { f: 392.00, d: 0.9, pause: 550 }, // thou-
      { f: 349.23, d: 1.2, pause: 800 }, // -sand years

      // "I'll love you for a thousand more..."
      { f: 349.23, d: 0.6, pause: 400 }, // I'll
      { f: 392.00, d: 0.6, pause: 400 }, // love
      { f: 440.00, d: 0.8, pause: 450 }, // you
      { f: 466.16, d: 0.8, pause: 450 }, // for
      { f: 523.25, d: 0.8, pause: 500 }, // a (C5)
      { f: 466.16, d: 0.7, pause: 400 }, // thou-
      { f: 440.00, d: 0.8, pause: 450 }, // -sand
      { f: 349.23, d: 1.4, pause: 1200 }, // more
    ];

    let step = 0;
    const playNext = () => {
      if (!this.isMusicPlaying) return;
      const note = melody[step % melody.length];
      this.playPianoNote(note.f, note.d, 0.12);
      step++;
      this.synthTimer = setTimeout(playNext, note.pause);
    };

    playNext();
  }

  // Sound effects
  public playTone(freq: number, type: OscillatorType = 'sine', duration = 0.15, gainVal = 0.1) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore
    }
  }

  public playTap() {
    this.playTone(440, 'triangle', 0.08, 0.08);
  }

  public playSuccess() {
    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.18, 0.12), idx * 80);
    });
  }

  public playFanfare() {
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.15), idx * 110);
    });
  }

  public playMessageSent() {
    this.playTone(580, 'sine', 0.1, 0.1);
  }

  public playMessageReceived() {
    this.playTone(392, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(523.25, 'sine', 0.12, 0.12), 90);
  }
}

export const sounds = new SoundManager();
