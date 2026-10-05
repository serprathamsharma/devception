'use client';
import { SessionProvider } from 'next-auth/react';
import { CinematicProvider } from '@/components/landing/CinematicProvider';
import { NetworkStatusBanner } from '@/components/ui/NetworkStatusBanner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CinematicProvider>
        <NetworkStatusBanner />
        {children}
      </CinematicProvider>
    </SessionProvider>
  );
}
