"use client";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmNode: AudioScheduledSourceNode | null = null;
  private bgmGain: GainNode | null = null;
  private currentBGM: string = "";
  private bgmInterval: any = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playSound(type: "footstep" | "click" | "talk" | "buy" | "levelUp" | "wind" | "door") {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === "footstep") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "talk") {
        // High pitch blip for text printing
        osc.type = "sine";
        const pitch = 300 + Math.random() * 200;
        osc.frequency.setValueAtTime(pitch, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === "buy") {
        // Double ding chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "levelUp") {
        // Sweet success arpeggio
        osc.type = "triangle";
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        });
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "door") {
        // Creeky low sound
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "wind") {
        // Soft white noise-like sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(100 + Math.random() * 50, now);
        osc.frequency.linearRampToValueAtTime(120, now + 1);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      }
    } catch (e) {
      console.warn("Sound playback error:", e);
    }
  }

  public playBGM(track: "cozy" | "melancholy" | "bittersweet" | "silence") {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.currentBGM === track) return;
      this.stopBGM();

      this.currentBGM = track;
      if (track === "silence") {
        // Ambient wind sounds loop
        this.bgmInterval = setInterval(() => {
          this.playSound("wind");
        }, 3000);
        return;
      }

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      let step = 0;
      let notes: number[] = [];
      let beatDuration = 0.4; // seconds

      if (track === "cozy") {
        // C Major - warm, happy, hopeful chord progression: C - G - Am - F
        const prog = [
          [261.63, 329.63, 392.00], // C4, E4, G4
          [196.00, 246.94, 293.66], // G3, B3, D4
          [220.00, 261.63, 329.63], // A3, C4, E4
          [174.61, 220.00, 261.63], // F3, A3, C4
        ];
        // Cozy melody
        const melody = [
          392.00, 440.00, 523.25, 587.33, 659.25, 0, 523.25, 0,
          293.66, 329.63, 392.00, 0, 392.00, 440.00, 329.63, 0,
        ];
        beatDuration = 0.5;

        const playTick = () => {
          if (!this.ctx || this.currentBGM !== "cozy") return;
          const t = this.ctx.currentTime;
          
          // Play background chord arpeggio
          const chordIdx = Math.floor(step / 4) % prog.length;
          const chord = prog[chordIdx];
          const noteInChord = chord[step % 3];
          
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = "triangle";
          osc1.frequency.setValueAtTime(noteInChord, t);
          gain1.gain.setValueAtTime(0.015, t);
          gain1.gain.exponentialRampToValueAtTime(0.001, t + beatDuration * 1.5);
          osc1.connect(gain1);
          // @ts-ignore
          gain1.connect(this.bgmGain);
          osc1.start(t);
          osc1.stop(t + beatDuration * 1.5);

          // Play melody
          const melodyNote = melody[step % melody.length];
          if (melodyNote > 0 && step % 2 === 0) {
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(melodyNote, t);
            gain2.gain.setValueAtTime(0.02, t);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + beatDuration * 2);
            osc2.connect(gain2);
            // @ts-ignore
            gain2.connect(this.bgmGain);
            osc2.start(t);
            osc2.stop(t + beatDuration * 2);
          }

          step++;
        };

        playTick();
        this.bgmInterval = setInterval(playTick, beatDuration * 1000);
      } else if (track === "melancholy") {
        // A Minor - quiet, reflective, sadder melody
        const prog = [
          [220.00, 261.63, 329.63], // Am
          [174.61, 220.00, 261.63], // F
          [196.00, 246.94, 293.66], // G
          [164.81, 196.00, 246.94], // Em
        ];
        const melody = [
          440.00, 493.88, 523.25, 0, 392.00, 329.63, 0, 0,
          349.23, 392.00, 440.00, 0, 293.66, 261.63, 0, 0
        ];
        beatDuration = 0.6;

        const playTick = () => {
          if (!this.ctx || this.currentBGM !== "melancholy") return;
          const t = this.ctx.currentTime;
          
          const chordIdx = Math.floor(step / 4) % prog.length;
          const chord = prog[chordIdx];
          const noteInChord = chord[step % 3];
          
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(noteInChord, t);
          gain1.gain.setValueAtTime(0.015, t);
          gain1.gain.exponentialRampToValueAtTime(0.001, t + beatDuration * 2);
          osc1.connect(gain1);
          // @ts-ignore
          gain1.connect(this.bgmGain);
          osc1.start(t);
          osc1.stop(t + beatDuration * 2);

          // Melody
          const melodyNote = melody[step % melody.length];
          if (melodyNote > 0 && step % 2 === 0) {
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(melodyNote, t);
            gain2.gain.setValueAtTime(0.012, t);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + beatDuration * 2.5);
            osc2.connect(gain2);
            // @ts-ignore
            gain2.connect(this.bgmGain);
            osc2.start(t);
            osc2.stop(t + beatDuration * 2.5);
          }

          step++;
        };

        playTick();
        this.bgmInterval = setInterval(playTick, beatDuration * 1000);
      } else if (track === "bittersweet") {
        // E Minor & D Major mix, slow chords and very simple piano style
        const prog = [
          [164.81, 261.63, 329.63], // Cmaj7 style
          [146.83, 220.00, 293.66], // D
          [164.81, 196.00, 329.63], // Em
          [164.81, 196.00, 293.66], // Em7
        ];
        const melody = [
          329.63, 0, 392.00, 0, 440.00, 0, 293.66, 0,
          329.63, 0, 0, 0, 0, 0, 0, 0
        ];
        beatDuration = 0.8;

        const playTick = () => {
          if (!this.ctx || this.currentBGM !== "bittersweet") return;
          const t = this.ctx.currentTime;
          
          const chordIdx = Math.floor(step / 4) % prog.length;
          const chord = prog[chordIdx];
          const noteInChord = chord[step % 3];
          
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(noteInChord, t);
          gain1.gain.setValueAtTime(0.015, t);
          gain1.gain.exponentialRampToValueAtTime(0.001, t + beatDuration * 2.5);
          osc1.connect(gain1);
          // @ts-ignore
          gain1.connect(this.bgmGain);
          osc1.start(t);
          osc1.stop(t + beatDuration * 2.5);

          // Melody
          const melodyNote = melody[step % melody.length];
          if (melodyNote > 0 && step % 4 === 0) {
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(melodyNote, t);
            gain2.gain.setValueAtTime(0.015, t);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + beatDuration * 3);
            osc2.connect(gain2);
            // @ts-ignore
            gain2.connect(this.bgmGain);
            osc2.start(t);
            osc2.stop(t + beatDuration * 3);
          }

          step++;
        };

        playTick();
        this.bgmInterval = setInterval(playTick, beatDuration * 1000);
      }
    } catch (e) {
      console.warn("BGM initialization failed:", e);
    }
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch (e) {}
      this.bgmGain = null;
    }
    this.currentBGM = "";
  }
}

// Create a mock sound engine if we are in Server-Side Rendering
const isClient = typeof window !== "undefined";
export const sound = isClient ? new SoundEngine() : {
  playSound: () => {},
  playBGM: () => {},
  stopBGM: () => {}
};
