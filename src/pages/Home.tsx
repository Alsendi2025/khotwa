import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Cpu, Coins } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { SERVICES, CATEGORIES } from '../lib/services';

export default function Home() {
  const { tr } = useLang();
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,110,99,0.14),transparent_60%)]" />
        <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 relative">
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
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.id} className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-2.5 h-8 rounded-full ${cat.color}`} />
              <h2 className="font-display text-xl md:text-2xl font-bold text-ink">{tr(cat.name)}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.filter((s) => s.cat === cat.id).map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.04 + ci * 0.02, duration: 0.35 }}>
                    <Link to={s.path}
                      className="group block h-full bg-white rounded-2xl border border-stone-200 p-5 hover:border-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      <div className={`w-11 h-11 rounded-xl ${cat.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <h3 className="font-bold text-ink">{tr(s.name)}</h3>
                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">{tr(s.desc)}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
