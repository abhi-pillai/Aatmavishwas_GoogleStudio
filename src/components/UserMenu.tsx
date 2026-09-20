import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  CloudCheck, 
  ChevronDown, 
  AtSign,
  Mail,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuth }) => {
  const { currentUser, userProfile, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-slate-800 animate-pulse" />
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <button
        id="nav-signin-btn"
        onClick={() => onOpenAuth('signin')}
        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Sign in with Google</span>
      </button>
    );
  }

  // User is logged in
  const displayName = userProfile?.displayName || currentUser.displayName || 'Speaker';
  const username = userProfile?.username || (currentUser.email ? currentUser.email.split('@')[0] : 'user');
  const email = userProfile?.email || currentUser.email || '';
  const initial = (displayName[0] || username[0] || 'U').toUpperCase();

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="user-profile-menu-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initial}
        </div>
        <div className="hidden sm:block max-w-[110px]">
          <div className="text-xs font-bold text-white truncate leading-tight">
            {displayName}
          </div>
          <div className="text-[10px] text-indigo-400 truncate leading-tight font-mono">
            @{username}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div 
          id="user-profile-dropdown"
          className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User info card */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-1">
            <div className="text-xs font-bold text-white leading-snug">{displayName}</div>
            <div className="text-[11px] text-indigo-400 font-mono mt-0.5 flex items-center gap-1">
              <AtSign className="w-3 h-3" />
              <span>{username}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified Account
              </span>
              <span className="text-slate-500 font-mono">Cloud Sync Active</span>
            </div>
          </div>

          <div className="p-1">
            <button
              id="user-signout-btn"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
