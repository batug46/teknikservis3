'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../components/ThemeProvider';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 