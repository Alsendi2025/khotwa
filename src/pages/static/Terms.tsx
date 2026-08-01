import { ScrollText } from 'lucide-react';
import { useLang } from '../../lib/i18n';

export default function Terms() {
  const { tr } = useLang();
  const S = ({ title, children }: { title: { ar: string; en: string }; children: React.ReactNode }) => (
    <section className="mb-6">
      <h2 className="font-bold text-base mb-2 text-teal-900">{tr(title)}</h2>
      <div className="text-sm text-stone-600 leading-loose space-y-2">{children}</div>
    </section>
  );
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center"><ScrollText size={24} /></span>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{tr({ ar: 'شروط الاستخدام', en: 'Terms of Service' })}</h1>
          <p className="text-xs text-stone-400">{tr({ ar: 'آخر تحديث: يوليو 2026', en: 'Last updated: July 2026' })}</p>
        </div>
      </div>
      <p className="text-sm text-stone-500 leading-relaxed mb-8">
        {tr({ ar: 'باستخدامك منصة خطوة فأنت توافق على الشروط التالية. صيغت لتكون واضحة وعادلة للجميع.', en: 'By using Khotwa you agree to the following terms, written to be clear and fair to everyone.' })}
      </p>

      <S title={{ ar: '1. طبيعة الخدمة', en: '1. Nature of the service' }}>
        <p>{tr({ ar: 'خطوة منصة تعليمية مجانية تقدم أدوات مساعدة للدراسة وأدلة معلوماتية ومساحة مجتمعية. الخدمة مقدمة كما هي دون ضمانات صريحة، ونبذل جهدنا لضمان دقة المحتوى واستمرارية الخدمة.', en: 'Khotwa is a free educational platform offering study tools, informational guides and a community space. The service is provided as-is; we do our best to ensure content accuracy and availability.' })}</p>
      </S>

      <S title={{ ar: '2. دقة المعلومات والمسؤولية', en: '2. Information accuracy & liability' }}>
        <ul className="list-disc ps-5 space-y-1">
          <li>{tr({ ar: 'أدلة الجامعات والمنح معلومات إرشادية قد تتغير — تحقق دائماً من الموقع الرسمي قبل اتخاذ قرارات القبول والتقديم.', en: 'University & scholarship guides are informational and may change — always verify with the official site before admission decisions.' })}</li>
          <li>{tr({ ar: 'مخرجات الذكاء الاصطناعي قد تحتوي أخطاء — راجعها دائماً ولا تعتمد عليها وحدها في الاختبارات أو الأبحاث.', en: 'AI outputs may contain errors — always review them and never rely on them alone for exams or research.' })}</li>
          <li>{tr({ ar: 'مقالات الإرشاد النفسي توعوية ولا تغني عن استشارة مختص مؤهل.', en: 'Counseling articles are educational and do not replace advice from a qualified professional.' })}</li>
        </ul>
      </S>

      <S title={{ ar: '3. الحسابات والمحتوى المجتمعي', en: '3. Accounts & community content' }}>
        <ul className="list-disc ps-5 space-y-1">
          <li>{tr({ ar: 'أنت مسؤول عن سرية بيانات دخولك وعن كل ما يُنشر من حسابك.', en: 'You are responsible for your login credentials and everything posted from your account.' })}</li>
          <li>{tr({ ar: 'يُمنع نشر: محتوى مسيء أو مضلل، مواد مخالفة لحقوق النشر (كتب مقرصنة)، غش أكاديمي (حلول اختبارات جارية)، أو إعلانات احتيالية في السوق.', en: 'Prohibited: abusive or misleading content, copyright-infringing materials (pirated books), academic cheating (live exam answers), or fraudulent marketplace listings.' })}</li>
          <li>{tr({ ar: 'نحتفظ بحق إزالة أي محتوى مخالف أو تعليق حسابات المخالفين دون إشعار مسبق.', en: 'We reserve the right to remove violating content or suspend violating accounts without prior notice.' })}</li>
        </ul>
      </S>

      <S title={{ ar: '4. سوق المستعمل', en: '4. Used marketplace' }}>
        <p>{tr({ ar: 'السوق مساحة ربط مباشر بين الطلاب — المنصة ليست طرفاً في أي صفقة ولا تضمن جودة السلع أو إتمام الدفع. تعامل بحذر: افحص السلعة قبل الدفع والتق في أماكن عامة.', en: 'The marketplace directly connects students — the platform is not a party to any transaction and does not guarantee item quality or payment. Trade carefully: inspect before paying and meet in public places.' })}</p>
      </S>

      <S title={{ ar: '5. الملكية الفكرية', en: '5. Intellectual property' }}>
        <p>{tr({ ar: 'تصميم المنصة وأدواتها ومحتواها التحريري ملك لـ خطوة. المحتوى الذي ينشره المستخدمون يبقى ملكاً لهم مع منحنا ترخيصاً لعرضه داخل المنصة.', en: 'The platform design, tools and editorial content belong to Khotwa. User-published content remains the user\'s property, with a license granted to us to display it within the platform.' })}</p>
      </S>

      <S title={{ ar: '6. التواصل', en: '6. Contact' }}>
        <p>{tr({ ar: 'لأي استفسار حول هذه الشروط: Alsendi.11.a@gmail.com أو عبر صفحة اتصل بنا.', en: 'For any questions about these terms: Alsendi.11.a@gmail.com or via the Contact page.' })}</p>
      </S>
    </div>
  );
}
