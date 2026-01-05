'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Session provider wrapper for NextAuth.js
 * Wrap the app layout with this to enable useSession hook
 */
export default function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
