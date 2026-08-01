import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n';
import { SERVICES, CATEGORIES } from '../lib/services';
import { usePageMeta } from '../lib/seo';

export default function ToolPage({ id, children, wide }: { id: string; children: ReactNode; wide?: boolean }) {
  const { lang, tr } = useLang();
  usePageMeta(id);

  const svc = SERVICES.find((s) => s.id === id)!;
  const cat = CATEGORIES.find((c) => c.id === svc.cat)!;
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;
  const NextIcon = lang === 'ar' ? ChevronLeft : ChevronRight;
  const PrevIcon = lang === 'ar' ? ChevronRight : ChevronLeft;
  const Icon = svc.icon;

  // خدمات الفئة نفسها للتنقل السريع
  const siblings = SERVICES.filter((s) => s.cat === svc.cat);
  const idx = siblings.findIndex((s) => s.id === id);
  const prev = siblings[(idx - 1 + siblings.length) % siblings.length];
  const next = siblings[(idx + 1) % siblings.length];

  return (
    <div className={`mx-auto px-4 py-6 md:py-8 w-full ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
      {/* مسار التنقل */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-4 flex-wrap" aria-label="breadcrumb">
        <Link to="/" className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-600 font-semibold">
          <Back size={14} /> {tr({ ar: 'الرئيسية', en: 'Home' })}
        </Link>
        <span>/</span>
        <span className="font-medium text-stone-500">{tr(cat.name)}</span>
        <span>/</span>
        <span className="font-semibold text-ink">{tr(svc.name)}</span>
      </nav>

      {/* ترويسة الخدمة */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 md:p-6 mb-6"
      >
        <div className={`absolute -top-10 -end-10 w-40 h-40 rounded-full opacity-[0.07] ${cat.color}`} />
        <div className="flex items-center gap-4 relative">
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={`w-13 h-13 md:w-14 md:h-14 shrink-0 rounded-2xl ${cat.color} text-white flex items-center justify-center shadow-lg`}
            style={{ width: 52, height: 52 }}
          >
            <Icon size={26} />
          </motion.div>
          <div className="min-w-0">
            <h1 className="font-display text-xl md:text-3xl font-bold text-ink leading-tight">{tr(svc.name)}</h1>
            <p className="text-xs md:text-sm text-stone-500 mt-0.5">{tr(svc.desc)}</p>
          </div>
        </div>

        {/* تنقل سريع بين خدمات الفئة */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
          <Link to={prev.path} className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-teal-700 bg-stone-50 hover:bg-teal-50 rounded-full px-2.5 py-1 transition-colors max-w-[45%]">
            <PrevIcon size={12} className="shrink-0" /> <span className="truncate">{tr(prev.name)}</span>
          </Link>
          <span className="flex-1" />
          <Link to={next.path} className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-teal-700 bg-stone-50 hover:bg-teal-50 rounded-full px-2.5 py-1 transition-colors max-w-[45%]">
            <span className="truncate">{tr(next.name)}</span> <NextIcon size={12} className="shrink-0" />
          </Link>
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        {children}
      </motion.div>
    </div>
  );
}
