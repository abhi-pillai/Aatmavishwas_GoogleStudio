import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  Sparkles, 
  Cloud, 
  TrendingUp, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await signInWithGoogle();
      onClose();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.25 }
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return; // user simply closed popup window
      }
      let message = err.message || 'Failed to authenticate with Google.';
      if (err.code === 'auth/popup-blocked') {
        message = 'The Google sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new window.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = `This domain (${window.location.hostname}) must be added to Firebase Console > Authentication > Settings > Authorized domains.`;
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled in Firebase Console. Please verify Google provider is enabled.';
      } else if (err.code === 'auth/api-key-expired' || err.message?.includes('api-key-expired')) {
        message = 'The Firebase API key has expired. Please check your project credentials.';
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div 
        id="auth-modal-card"
        className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
      >
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Save and synchronize your speech training progress
              </p>
            </div>
          </div>

          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition disabled:opacity-40 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-2 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div 
              id="auth-error-banner"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-2 animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="font-medium text-rose-200 leading-relaxed">{errorMessage}</p>
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition cursor-pointer"
                >
                  Continue as Guest (Local Mode)
                </button>
              </div>
            </div>
          )}

          {/* Benefits card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Cloud sync for audio recordings, feedback reports & AI suggestions</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Track clarity, pace, confidence, and speech analytics over time</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Secure 1-click authentication — no passwords to remember</span>
            </div>
          </div>

          {/* Primary Google Action Button */}
          <div className="space-y-2.5 pt-1">
            <button
              id="google-auth-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-3 border border-slate-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-200 transition text-center cursor-pointer"
            >
              Skip and continue in local guest mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
