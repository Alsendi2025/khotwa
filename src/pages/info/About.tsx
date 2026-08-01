import { Footprints, Target, Eye, Users, ShieldCheck, Cpu, Coins, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../../lib/i18n';

export default function About() {
  const { tr } = useLang();
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <span className="inline-flex w-16 h-16 rounded-3xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-4"><Footprints size={32} /></span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">{tr({ ar: 'من نحن', en: 'About Us' })}</h1>
        <p className="text-stone-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          {tr({
            ar: '«خطوة» منصة وطنية تعليمية مجانية بالكامل، وُلدت من إيماننا بأن كل طالب يستحق أدوات ذكية تساعده في رحلته الدراسية — دون أي تكلفة أو حواجز.',
            en: 'Khotwa is a national, fully free educational platform, born from our belief that every student deserves smart tools for their academic journey — with zero cost and zero barriers.',
          })}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h2 className="font-bold flex items-center gap-2 mb-2"><Eye size={18} className="text-teal-700" /> {tr({ ar: 'رؤيتنا', en: 'Our Vision' })}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {tr({
              ar: 'أن نكون المنصة الأولى للطالب العربي: مكاناً واحداً يجمع كل ما يحتاجه من أدوات ذكاء اصطناعي، وأدوات دراسية، وأدلة أكاديمية موثوقة، ومجتمع طلابي داعم.',
              en: 'To be the first destination for Arab students: one place gathering AI tools, study utilities, trusted academic guides, and a supportive student community.',
            })}
          </p>
        </div>
        <div className="card">
          <h2 className="font-bold flex items-center gap-2 mb-2"><Target size={18} className="text-teal-700" /> {tr({ ar: 'رسالتنا', en: 'Our Mission' })}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {tr({
              ar: 'تمكين الطلاب من التفوق الدراسي عبر 26 خدمة مجانية تحترم خصوصيتهم: ملفاتهم تُعالج محلياً في متصفحاتهم، وبياناتهم لا تُباع ولا تُستغل أبداً.',
              en: 'Empowering students to excel through 26 free services that respect their privacy: files are processed locally in their browsers, and their data is never sold or exploited.',
            })}
          </p>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="font-bold flex items-center gap-2 mb-4"><Users size={18} className="text-teal-700" /> {tr({ ar: 'فريق العمل', en: 'Our Team' })}</h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          {tr({
            ar: 'يقف خلف «خطوة» فريق شبابي من المطورين والتربويين المتطوعين الذين جمعتهم تجربة واحدة: معاناة البحث عن أدوات دراسية مجانية موثوقة باللغة العربية. نعمل بمبدأ «المصدر المفتوح للمعرفة» ونطور المنصة باستمرار بناءً على ملاحظات الطلاب.',
            en: 'Behind Khotwa is a young team of volunteer developers and educators united by one experience: the struggle of finding trusted, free study tools in Arabic. We operate on an "open knowledge" principle and continuously improve based on student feedback.',
          })}
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Cpu, t: { ar: 'فريق التطوير', en: 'Development Team' }, d: { ar: 'بناء الأدوات وصيانة المنصة', en: 'Building tools & maintaining the platform' } },
            { icon: HeartHandshake, t: { ar: 'الفريق التربوي', en: 'Education Team' }, d: { ar: 'إعداد الأدلة والمحتوى الإرشادي', en: 'Preparing guides & advisory content' } },
            { icon: Users, t: { ar: 'مجتمع الطلاب', en: 'Student Community' }, d: { ar: 'ملاحظاتكم تصنع خارطة طريقنا', en: 'Your feedback shapes our roadmap' } },
          ].map((m, i) => {
            const I = m.icon;
            return (
              <div key={i} className="bg-stone-50 rounded-xl p-3 text-center">
                <I size={22} className="mx-auto text-teal-700 mb-1.5" />
                <p className="font-bold text-sm">{tr(m.t)}</p>
                <p className="text-xs text-stone-500 mt-0.5">{tr(m.d)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Coins, t: { ar: 'مجانية 100%', en: '100% Free' }, d: { ar: 'لا اشتراكات ولا رسوم خفية', en: 'No subscriptions, no hidden fees' } },
          { icon: ShieldCheck, t: { ar: 'خصوصية أولاً', en: 'Privacy First' }, d: { ar: 'ملفاتك تُعالج في جهازك ولا تُرفع للخوادم', en: 'Files processed on your device, never uploaded' } },
          { icon: Footprints, t: { ar: 'بالعربية أولاً', en: 'Arabic First' }, d: { ar: 'واجهة وأدوات مصممة للطالب العربي', en: 'Interface & tools designed for Arab students' } },
        ].map((v, i) => {
          const I = v.icon;
          return (
            <div key={i} className="card text-center">
              <I size={24} className="mx-auto text-amber-600 mb-2" />
              <p className="font-bold">{tr(v.t)}</p>
              <p className="text-xs text-stone-500 mt-1">{tr(v.d)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
