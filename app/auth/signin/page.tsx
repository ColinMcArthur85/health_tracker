'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Activity, Eye, Lock, ArrowRight, Loader2 } from 'lucide-react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');
  
  const [isLoading, setIsLoading] = useState<'demo' | 'owner' | null>(null);
  const [password, setPassword] = useState('');
  const [showOwnerForm, setShowOwnerForm] = useState(false);

  const handleDemoSignIn = async () => {
    setIsLoading('demo');
    await signIn('demo', { callbackUrl });
  };

  const handleOwnerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('owner');
    await signIn('owner', { password, callbackUrl });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-2xl shadow-emerald-500/20">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
            Health Journal
          </h1>
          <p className="text-slate-400 text-lg">
            Personal health tracking with AI insights
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error === 'CredentialsSignin' 
              ? 'Invalid password. Please try again.' 
              : 'An error occurred. Please try again.'}
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Demo Mode Button - Primary CTA */}
          <button
            onClick={handleDemoSignIn}
            disabled={!!isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === 'demo' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>Explore Demo</span>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </>
            )}
          </button>

          <p className="text-center text-slate-500 text-sm mt-4 mb-6">
            Preview with sample data • No sign-up required
          </p>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-slate-900/50 text-slate-600 text-sm">
                or
              </span>
            </div>
          </div>

          {/* Owner Access */}
          {!showOwnerForm ? (
            <button
              onClick={() => setShowOwnerForm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors border border-slate-700"
            >
              <Lock className="w-4 h-4" />
              <span>Owner Access</span>
            </button>
          ) : (
            <form onSubmit={handleOwnerSignIn} className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter owner password"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOwnerForm(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading === 'owner' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-8">
          A personal health tracking application by Colin McArthur
        </p>
      </div>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
