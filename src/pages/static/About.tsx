import { Link } from 'react-router-dom';
import { Footprints, Target, Eye, HeartHandshake, ShieldCheck, Users, Sparkles, Mail } from 'lucide-react';
import { useLang } from '../../lib/i18n';

export default function About() {
  const { tr } = useLang();
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <span className="inline-flex w-16 h-16 rounded-3xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-4"><Footprints size={32} /></span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">{tr({ ar: 'من نحن — منصة خطوة', en: 'About Us — Khotwa Platform' })}</h1>
        <p className="text-stone-500 mt-3 max-w-2xl mx-auto leading-relaxed">
          {tr({
            ar: 'خطوة منصة وطنية تعليمية مجانية بالكامل، أنشئت لتكون الرفيق الرقمي الأول لكل طالب عربي — من المدرسة إلى الجامعة وما بعدها. نجمع في مكان واحد أدوات الذكاء الاصطناعي، وأدوات الملفات، وأدلة التخصصات والمنح، ومجتمعاً طلابياً حياً.',
            en: 'Khotwa is a fully free national educational platform, built to be the first digital companion for every Arab student — from school to university and beyond. We bring together AI tools, file utilities, majors & scholarships guides, and a living student community.',
          })}
        </p>
      </div>

      {/* Vision / Mission / Values */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="card text-center">
          <Eye size={28} className="mx-auto text-teal-700 mb-3" />
          <h3 className="font-bold mb-2">{tr({ ar: 'رؤيتنا', en: 'Our Vision' })}</h3>
          <p className="text-sm text-stone-500 leading-relaxed">{tr({ ar: 'أن يجد كل طالب عربي كل ما يحتاجه للنجاح الدراسي في منصة واحدة مجانية — دون حواجز مادية أو تقنية.', en: 'Every Arab student finding everything they need to succeed in one free platform — no financial or technical barriers.' })}</p>
        </div>
        <div className="card text-center">
          <Target size={28} className="mx-auto text-teal-700 mb-3" />
          <h3 className="font-bold mb-2">{tr({ ar: 'رسالتنا', en: 'Our Mission' })}</h3>
          <p className="text-sm text-stone-500 leading-relaxed">{tr({ ar: 'تمكين الطلاب بـ 26 خدمة ذكية: من الشرح والتلخيص بالذكاء الاصطناعي إلى أدلة الجامعات والمنح وأدوات المذاكرة والتنظيم.', en: 'Empowering students with 26 smart services: AI tutoring & summarizing, university & scholarship guides, and study tools.' })}</p>
        </div>
        <div className="card text-center">
          <HeartHandshake size={28} className="mx-auto text-teal-700 mb-3" />
          <h3 className="font-bold mb-2">{tr({ ar: 'قيمنا', en: 'Our Values' })}</h3>
          <p className="text-sm text-stone-500 leading-relaxed">{tr({ ar: 'المجانية الكاملة، خصوصية الطالب أولاً، المحتوى الموثوق، وخدمة المجتمع الطلابي العربي دون تمييز.', en: 'Completely free, student privacy first, trustworthy content, and serving the Arab student community without discrimination.' })}</p>
        </div>
      </div>

      {/* Why trust us */}
      <div className="card mb-10">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck size={22} className="text-teal-700" /> {tr({ ar: 'لماذا تثق بـ خطوة؟', en: 'Why trust Khotwa?' })}</h2>
        <ul className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <li className="flex gap-2"><span className="text-teal-700 font-bold shrink-0">✓</span> {tr({ ar: 'ملفاتك لا تغادر جهازك: كل أدوات PDF والصور تعمل محلياً في متصفحك دون رفع أي ملف للخوادم.', en: 'Your files never leave your device: all PDF & image tools run locally in your browser — nothing is uploaded.' })}</li>
          <li className="flex gap-2"><span className="text-teal-700 font-bold shrink-0">✓</span> {tr({ ar: 'محتوى الأدلة (الجامعات، المنح، الإرشاد) يُبنى من مصادر رسمية مع روابط التحقق المباشرة.', en: 'Guide content (universities, scholarships, counseling) is built from official sources with direct verification links.' })}</li>
          <li className="flex gap-2"><span className="text-teal-700 font-bold shrink-0">✓</span> {tr({ ar: 'لا إعلانات مزعجة ولا بيع للبيانات — راجع سياسة الخصوصية الكاملة.', en: 'No intrusive ads and no data selling — see our full privacy policy.' })}</li>
          <li className="flex gap-2"><span className="text-teal-700 font-bold shrink-0">✓</span> {tr({ ar: 'منصة حية تتطور باستمرار بناءً على ملاحظات الطلاب — تواصل معنا بأي اقتراح.', en: 'A living platform continuously improved from student feedback — reach out with any suggestion.' })}</li>
        </ul>
      </div>

      {/* Team */}
      <div className="card mb-10">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Users size={22} className="text-teal-700" /> {tr({ ar: 'فريق العمل', en: 'Our Team' })}</h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          {tr({
            ar: 'خطوة مبادرة وطنية يقودها فريق من المطورين والتربويين الشغوفين بالتعليم الرقمي، ممن عاشوا تحديات الطالب العربي بأنفسهم: صعوبة الوصول للمعلومة الموثوقة، وتشتت الأدوات، وتكلفة الخدمات التعليمية. لذلك بنينا المنصة التي تمنينا وجودها أيام دراستنا — ونضعها بين يديك مجاناً.',
            en: 'Khotwa is a national initiative led by developers and educators passionate about digital education, who personally lived the Arab student\'s challenges: hard-to-find trustworthy information, scattered tools, and costly services. So we built the platform we wished existed during our own studies — and we offer it to you for free.',
          })}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { ar: 'تطوير البرمجيات', en: 'Software Engineering' },
            { ar: 'الإرشاد الأكاديمي', en: 'Academic Counseling' },
            { ar: 'تصميم تجربة المستخدم', en: 'UX Design' },
            { ar: 'المحتوى التعليمي', en: 'Educational Content' },
          ].map((t, i) => <span key={i} className="text-xs bg-teal-50 text-teal-800 border border-teal-100 rounded-full px-3 py-1">{tr(t)}</span>)}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-sm text-stone-500 mb-3 flex items-center justify-center gap-1.5"><Sparkles size={15} className="text-amber-500" /> {tr({ ar: 'لديك فكرة أو اقتراح؟ يسعدنا سماعك', en: 'Have an idea or suggestion? We\'d love to hear from you' })}</p>
        <Link to="/contact" className="btn"><Mail size={16} /> {tr({ ar: 'تواصل معنا', en: 'Contact us' })}</Link>
      </div>
    </div>
  );
}
