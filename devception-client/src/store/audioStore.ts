import { create } from 'zustand';

interface AudioStore {
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

const STORAGE_KEY_MUTED = 'devception_sfx_muted';
const STORAGE_KEY_VOLUME = 'devception_sfx_volume';

function getInitialMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
  } catch {
    return false;
  }
}

function getInitialVolume(): number {
  if (typeof window === 'undefined') return 0.7;
  try {
    const val = localStorage.getItem(STORAGE_KEY_VOLUME);
    return val !== null ? Math.max(0, Math.min(1, parseFloat(val))) : 0.7;
  } catch {
    return 0.7;
  }
}

export const useAudioStore = create<AudioStore>((set) => ({
  isMuted: getInitialMuted(),
  volume: getInitialVolume(),

  toggleMute: () =>
    set((state) => {
      const nextMuted = !state.isMuted;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_MUTED, String(nextMuted));
        } catch {
          // Ignore localStorage errors
        }
      }
      return { isMuted: nextMuted };
    }),

  setVolume: (volume: number) =>
    set(() => {
      const clamped = Math.max(0, Math.min(1, volume));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
        } catch {
          // Ignore localStorage errors
        }
      }
      return { volume: clamped };
    }),
}));
