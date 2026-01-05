/**
 * NextAuth.js Configuration
 * 
 * This app uses a simplified auth strategy:
 * 1. Demo Mode - Read-only access with synthetic data for recruiters
 * 2. Owner Mode - Full access (single-user personal health journal)
 * 
 * For a personal health journal, we don't need full OAuth - just a way to
 * distinguish between the owner and demo visitors.
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

/**
 * Demo user for recruiters and visitors
 */
const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@healthjournal.app',
  isDemo: true,
};

/**
 * Owner user (you)
 * In production, this would be validated against a hashed password
 */
const OWNER_USER = {
  id: 'owner',
  name: 'Colin',
  email: 'owner@healthjournal.app',
  isDemo: false,
};

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: 'demo',
      name: 'Demo Mode',
      credentials: {},
      async authorize() {
        // Always return demo user - no credentials needed
        return DEMO_USER;
      },
    }),
    Credentials({
      id: 'owner',
      name: 'Owner Access',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Simple password check for owner access
        // In production, use proper hashing with bcrypt
        const ownerPassword = process.env.OWNER_PASSWORD;
        
        if (!ownerPassword) {
          console.warn('OWNER_PASSWORD not set - owner login disabled');
          return null;
        }
        
        if (credentials?.password === ownerPassword) {
          return OWNER_USER;
        }
        
        return null;
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      // Add isDemo flag to JWT token
      if (user) {
        token.isDemo = (user as typeof DEMO_USER).isDemo ?? false;
        token.userId = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add isDemo flag to session
      if (session.user) {
        session.user.isDemo = token.isDemo as boolean;
        session.user.id = token.userId as string;
      }
      return session;
    },
    
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isApiRoute = nextUrl.pathname.startsWith('/api');
      
      // Public routes - landing page, static assets
      if (!isOnDashboard && !isApiRoute) {
        return true;
      }
      
      // Protected routes require authentication
      if (isOnDashboard || isApiRoute) {
        if (isLoggedIn) return true;
        // Redirect to sign-in page
        return false;
      }
      
      return true;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Trust the host in development and production
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Type augmentation for session
declare module 'next-auth' {
  interface User {
    isDemo?: boolean;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isDemo: boolean;
    };
  }
}

// Note: JWT is typed internally by NextAuth based on callbacks
