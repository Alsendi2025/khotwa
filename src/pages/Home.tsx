import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Cpu, Coins, Download, Search, X } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { SERVICES, CATEGORIES } from '../lib/services';
import { usePageMeta } from '../lib/seo';
import DevTools from '../components/DevTools';

export default function Home() {
  const { tr } = useLang();
  usePageMeta('home');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;
    return SERVICES.filter((s) =>
      `${s.name.ar} ${s.name.en} ${s.desc.ar} ${s.desc.en}`.toLowerCase().includes(query)
    );
  }, [q]);

  const renderCard = (s: (typeof SERVICES)[number], i: number, color: string) => {
    const Icon = s.icon;
    return (
      <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}>
        <Link to={s.path}
          className="group block h-full bg-white rounded-2xl border border-stone-200 p-5 hover:border-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all focus-visible:ring-2 focus-visible:ring-teal-600">
          <div className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <Icon size={22} />
          </div>
          <h3 className="font-bold text-ink">{tr(s.name)}</h3>
          <p className="text-sm text-stone-500 mt-1 leading-relaxed">{tr(s.desc)}</p>
        </Link>
      </motion.div>
    );
  };

  return (
    <div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,110,99,0.14),transparent_60%)]" />
        <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-900 bg-teal-100 border border-teal-200 rounded-full px-3 py-1">
              <Sparkles size={13} className="text-amber-600" />
              {tr({ ar: '26 خدمة ذكية مجانية بالكامل', en: '26 smart services — completely free' })}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-ink mt-4 leading-tight">
              {tr({ ar: 'كل خطوة في دراستك،', en: 'Every step of your studies,' })}<br />
              <span className="text-teal-800">{tr({ ar: 'في منصة واحدة.', en: 'in one platform.' })}</span>
            </h1>
            <p className="text-stone-500 mt-4 max-w-xl text-lg">
              {tr({
                ar: 'ذكاء اصطناعي للشرح والتلخيص، أدوات PDF كاملة تعمل في متصفحك، حاسبات ومنظمات — كل ما يحتاجه الطالب دون أي تكلفة.',
                en: 'AI tutoring & summarizing, full PDF tools running in your browser, calculators and planners — everything a student needs, at zero cost.',
              })}
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-teal-700" /> {tr({ ar: 'ملفاتك تبقى على جهازك', en: 'Files never leave your device' })}</span>
              <span className="flex items-center gap-1.5"><Cpu size={16} className="text-teal-700" /> {tr({ ar: 'مساعد ذكي مدمج', en: 'Built-in smart assistant' })}</span>
              <span className="flex items-center gap-1.5"><Coins size={16} className="text-teal-700" /> {tr({ ar: 'ميزانية 0$', en: '$0 budget' })}</span>
            </div>

            {/* بحث سريع عن خدمة */}
            <div className="relative max-w-md mt-7">
              <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                className="w-full rounded-2xl border-2 border-stone-200 bg-white ps-11 pe-10 py-3 text-sm shadow-sm focus:border-teal-600"
                placeholder={tr({ ar: 'ابحث عن خدمة… (مثال: دمج PDF، معدل، منح)', en: 'Search a service… (e.g. merge PDF, GPA, scholarships)' })}
                value={q} onChange={(e) => setQ(e.target.value)}
                aria-label={tr({ ar: 'بحث عن خدمة', en: 'Search services' })}
              />
              {q && (
                <button onClick={() => setQ('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500" aria-label={tr({ ar: 'مسح', en: 'Clear' })}>
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {filtered ? (
          <div className="mt-6">
            <p className="text-sm text-stone-500 mb-4">
              {filtered.length
                ? tr({ ar: `${filtered.length} خدمة مطابقة لبحثك`, en: `${filtered.length} matching services` })
                : tr({ ar: 'لا توجد خدمة مطابقة — جرّب كلمات أخرى', en: 'No matching services — try other words' })}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((s, i) => renderCard(s, i, CATEGORIES.find((c) => c.id === s.cat)!.color))}
            </div>
          </div>
        ) : (
          CATEGORIES.map((cat, ci) => (
            <div key={cat.id} className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-2.5 h-8 rounded-full ${cat.color}`} />
                <h2 className="font-display text-xl md:text-2xl font-bold text-ink">{tr(cat.name)}</h2>
                <span className="text-xs text-stone-400 font-semibold">
                  {SERVICES.filter((s) => s.cat === cat.id).length} {tr({ ar: 'خدمات', en: 'services' })}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.filter((s) => s.cat === cat.id).map((s, i) => renderCard(s, i + ci, cat.color))}
              </div>
            </div>
          ))
        )}
      </section>

  );
}
