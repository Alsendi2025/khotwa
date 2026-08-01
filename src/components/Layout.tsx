import { Link, useNavigate } from 'react-router-dom';
import { Languages, Footprints, LogIn, LogOut, UserCircle2, Mail, Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';

const SOCIALS = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/khotwa.platform' },
  { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com/khotwa_platform' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/khotwa.platform' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@khotwa-platform' },
  { icon: Send, label: 'Telegram', href: 'https://t.me/khotwa_platform' },
];

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

          {/* quick nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-semibold text-stone-600">
            <Link to="/about" className="hover:text-teal-800 transition-colors">{tr({ ar: 'من نحن', en: 'About' })}</Link>
            <Link to="/contact" className="hover:text-teal-800 transition-colors">{tr({ ar: 'اتصل بنا', en: 'Contact' })}</Link>
          </nav>

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

      {/* ============ Footer ============ */}
      <footer className="border-t border-stone-200 bg-white/60 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* من نحن — نص تعريفي */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-xl bg-teal-800 text-amber-300 flex items-center justify-center"><Footprints size={18} /></span>
                <span className="font-display text-xl font-bold text-teal-900">{tr({ ar: 'خطوة', en: 'Khotwa' })}</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed max-w-lg">
                {tr({
                  ar: 'منصة وطنية تعليمية مجانية بالكامل، تجمع 26 خدمة ذكية للطالب العربي في مكان واحد: أدوات ذكاء اصطناعي للشرح والتلخيص، أدوات PDF تعمل محلياً دون رفع ملفاتك، أدلة موثوقة للتخصصات والجامعات والمنح، ومجتمع طلابي حي للنقاش ومشاركة المعرفة. رؤيتنا أن يجد كل طالب كل ما يحتاجه للنجاح — دون أي تكلفة.',
                  en: 'A fully free national educational platform bringing 26 smart services to Arab students in one place: AI tools for tutoring & summarizing, PDF tools that run locally without uploading your files, trusted guides for majors, universities & scholarships, and a living student community. Our vision: every student finding everything they need to succeed — at no cost.',
                })}
              </p>
              <Link to="/about" className="inline-block text-sm text-teal-800 font-semibold hover:underline mt-2">
                {tr({ ar: 'اقرأ المزيد عنا ←', en: 'Read more about us →' })}
              </Link>

              {/* مواقع التواصل */}
              <div className="flex items-center gap-2 mt-5">
                {SOCIALS.map((s) => {
                  const I = s.icon;
                  return (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label} aria-label={s.label}
                      className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-teal-800 hover:text-white transition-colors">
                      <I size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* روابط سريعة */}
            <div>
              <h4 className="font-bold text-sm text-ink mb-3">{tr({ ar: 'روابط سريعة', en: 'Quick links' })}</h4>
              <ul className="space-y-2 text-sm text-stone-500">
                <li><Link to="/contact" className="hover:text-teal-800 transition-colors flex items-center gap-1.5"><Mail size={13} /> {tr({ ar: 'اتصل بنا', en: 'Contact us' })}</Link></li>
                <li><Link to="/privacy" className="hover:text-teal-800 transition-colors">{tr({ ar: 'سياسة الخصوصية', en: 'Privacy policy' })}</Link></li>
                <li><Link to="/terms" className="hover:text-teal-800 transition-colors">{tr({ ar: 'شروط الاستخدام', en: 'Terms of service' })}</Link></li>
              </ul>
              <div className="mt-4 text-xs text-stone-400">
                <p className="font-semibold text-stone-500 mb-1">{tr({ ar: 'البريد الرسمي', en: 'Official email' })}</p>
                <a href="mailto:Alsendi.11.a@gmail.com" className="hover:text-teal-800 break-all" dir="ltr">Alsendi.11.a@gmail.com</a>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
            <p>© {new Date().getFullYear()} {tr({ ar: 'خطوة — كل أدوات الطالب في مكان واحد، مجاناً 100%', en: 'Khotwa — every student tool in one place, 100% free' })}</p>
            <p>{tr({ ar: 'ملفاتك تُعالج محلياً في متصفحك 🔒', en: 'Your files are processed locally in your browser 🔒' })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
