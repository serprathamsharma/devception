'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !justReconnected) {
    return null;
  }

  if (justReconnected) {
    return (
      <aside
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-950/95 border-b border-emerald-500/50 text-emerald-200 px-4 py-2 flex items-center justify-center gap-2 text-xs font-mono backdrop-blur-md transition-all duration-300"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
        <span>Connection restored. Synchronizing multiplayer state...</span>
      </aside>
    );
  }

  return (
    <aside
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] bg-red-950/95 border-b border-red-500/60 text-red-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono backdrop-blur-md shadow-lg shadow-red-950/50"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
        <div>
          <span className="font-bold text-red-300 uppercase tracking-wide">
            [OFFLINE] Connection Lost
          </span>
          <span className="hidden sm:inline text-red-300/80 ml-2">
            Multiplayer synchronization paused. Real-time updates will resume once connected.
          </span>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1.5 px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-100 rounded border border-red-700 text-[11px] transition-colors shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Reload</span>
      </button>
    </aside>
  );
}
