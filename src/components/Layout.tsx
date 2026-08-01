import { Link, useNavigate } from 'react-router-dom';
import { Languages, Footprints, LogIn, LogOut, UserCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';
import DownloadToast from './DownloadToast';

export default function Layout({ children }: { children: ReactNode }) {
  const { lang, setLang, tr } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();

  const signOut = async () => { await supabase.auth.signOut(); nav('/'); };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-paper/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform shrink-0">
              <Footprints size={21} />
            </span>
            <span className="font-display text-2xl font-bold text-teal-900">{tr({ ar: 'خطوة', en: 'Khotwa' })}</span>
            <span className="hidden md:inline text-[11px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 mt-1">
              {tr({ ar: 'منصة الطالب الذكية', en: 'Smart Student Platform' })}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-full px-3 py-1.5 max-w-40 truncate">
                  <UserCircle2 size={14} className="text-teal-700 shrink-0" /> {user.email?.split('@')[0]}
                </span>
                <button onClick={signOut} title={tr({ ar: 'خروج', en: 'Sign out' })}
                  className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 border border-stone-300 rounded-full px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-colors">
                  <LogOut size={15} /><span className="hidden sm:inline">{tr({ ar: 'خروج', en: 'Out' })}</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-teal-800 rounded-full px-3.5 py-1.5 hover:bg-teal-700 transition-colors">
                <LogIn size={15} /> {tr({ ar: 'دخول', en: 'Sign in' })}
              </Link>
            )}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-sm font-semibold text-teal-900 border border-teal-800/30 rounded-full px-3 py-1.5 hover:bg-teal-800 hover:text-white transition-colors"
            >
              <Languages size={16} /> <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span><span className="sm:hidden">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <DownloadToast />
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        {tr({ ar: 'خطوة — كل أدوات الطالب في مكان واحد، مجاناً 100%', en: 'Khotwa — every student tool in one place, 100% free' })}
      </footer>
    </div>
  );
}
