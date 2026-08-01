import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Footprints, LogIn } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useLang } from '../lib/i18n';
import { usePageMeta } from '../lib/seo';

export default function Login() {
  const { tr } = useLang();
  usePageMeta('login');
  const nav = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email.includes('@')) { setError(tr({ ar: 'أدخل بريداً صالحاً', en: 'Enter a valid email' })); return; }
    if (password.length < 6) { setError(tr({ ar: 'كلمة المرور 6 أحرف على الأقل', en: 'Password must be 6+ chars' })); return; }
    setBusy(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) nav('/');
        else setInfo(tr({ ar: 'تم إنشاء الحساب — سجّل الدخول الآن', en: 'Account created — sign in now' }));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav('/');
      }
    } catch (e: any) {
      setError(e.message === 'Invalid login credentials' ? tr({ ar: 'بيانات دخول غير صحيحة', en: 'Invalid credentials' }) : e.message);
    }
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card !p-8">
        <div className="text-center mb-6">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-3"><Footprints size={28} /></span>
          <h1 className="font-display text-2xl font-bold text-ink">
            {isSignUp ? tr({ ar: 'إنشاء حساب جديد', en: 'Create an account' }) : tr({ ar: 'تسجيل الدخول إلى خطوة', en: 'Sign in to Khotwa' })}
          </h1>
          <p className="text-sm text-stone-500 mt-1">{tr({ ar: 'للمشاركة في المنتديات والمكتبة والسوق', en: 'To post in forums, library & marketplace' })}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input className="field" type="email" placeholder={tr({ ar: 'البريد الإلكتروني', en: 'Email' })} value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          <input className="field" type="password" placeholder={tr({ ar: 'كلمة المرور', en: 'Password' })} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          {info && <p className="text-teal-700 text-sm">{info}</p>}
          <button className="btn w-full" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {isSignUp ? tr({ ar: 'إنشاء حساب', en: 'Sign up' }) : tr({ ar: 'دخول', en: 'Sign in' })}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4 text-xs text-stone-400">
          <span className="flex-1 h-px bg-stone-200" /> {tr({ ar: 'أو', en: 'or' })} <span className="flex-1 h-px bg-stone-200" />
        </div>

        <button onClick={() => signInWithGoogle('Khotwa — خطوة')} className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-2.5 text-sm font-semibold hover:bg-stone-50 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {tr({ ar: 'الدخول بحساب Google', en: 'Continue with Google' })}
        </button>

        <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setInfo(''); }} className="w-full text-sm text-teal-800 hover:underline mt-4">
          {isSignUp ? tr({ ar: 'لديك حساب؟ سجّل الدخول', en: 'Have an account? Sign in' }) : tr({ ar: 'جديد؟ أنشئ حساباً', en: "New? Create an account" })}
        </button>

        <p className="text-center text-xs text-stone-400 mt-4 bg-stone-50 rounded-xl py-2" dir="ltr">
          {tr({ ar: 'حساب تجريبي: ', en: 'Demo: ' })}demo@example.com / password123
        </p>
      </div>
    </div>
  );
}
