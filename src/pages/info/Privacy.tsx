import { ShieldCheck } from 'lucide-react';
import { useLang } from '../../lib/i18n';

export default function Privacy() {
  const { tr, lang } = useLang();
  const S = ({ t, children }: { t: { ar: string; en: string }; children: React.ReactNode }) => (
    <section className="card mb-4">
      <h2 className="font-bold mb-2">{tr(t)}</h2>
      <div className="text-sm text-stone-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-3"><ShieldCheck size={26} /></span>
        <h1 className="font-display text-3xl font-bold text-ink">{tr({ ar: 'سياسة الخصوصية', en: 'Privacy Policy' })}</h1>
        <p className="text-xs text-stone-400 mt-2">{tr({ ar: 'آخر تحديث: يوليو 2026', en: 'Last updated: July 2026' })}</p>
      </div>

      {lang === 'ar' ? (
        <>
          <S t={{ ar: '1. مبدأنا الأساسي', en: '' }}>
            <p>خصوصيتك ليست ميزة إضافية في «خطوة» — بل أساس تصميم المنصة. نجمع أقل قدر ممكن من البيانات، ولا نبيعها أو نشاركها مع أي طرف ثالث لأغراض تجارية أبداً.</p>
          </S>
          <S t={{ ar: '2. معالجة الملفات محلياً', en: '' }}>
            <p>جميع أدوات PDF والصور (الدمج، التقسيم، الضغط، الحماية، OCR، التحويل، العلامة المائية، معالجة الصور) تعمل <b>بالكامل داخل متصفحك</b>. ملفاتك لا تغادر جهازك ولا تُرفع إلى أي خادم.</p>
            <p>استثناء: الملفات التي تختار أنت مشاركتها في «مكتبة الملاحظات» أو صور «السوق» تُخزن لدينا لإتاحتها للطلاب الآخرين — وهذا يتم بموافقتك الصريحة عند الرفع.</p>
          </S>
          <S t={{ ar: '3. البيانات التي نجمعها', en: '' }}>
            <ul className="list-disc ps-5 space-y-1">
              <li><b>الحساب:</b> البريد الإلكتروني وكلمة مرور مشفرة (أو معرف Google) — فقط إذا أنشأت حساباً للمشاركة في المجتمع.</li>
              <li><b>محتوى المجتمع:</b> ما تنشره طوعاً في المنتديات والمكتبة والسوق وبنك المشاريع.</li>
              <li><b>بيانات الأدوات المحفوظة:</b> الجداول الدراسية وسجلات الميزانية التي تدخلها لحفظها.</li>
              <li><b>لا نجمع:</b> ملفات تعريف تتبع إعلانية، ولا نستخدم أدوات تحليل تجارية تتبع نشاطك عبر المواقع.</li>
            </ul>
          </S>
          <S t={{ ar: '4. خدمات الذكاء الاصطناعي', en: '' }}>
            <p>عند استخدام خدمات الذكاء الاصطناعي (المعلم الذكي، التلخيص، الاختبارات...)، يُرسل النص الذي تدخله إلى مزود الخدمة (Google Gemini) لمعالجته وإرجاع النتيجة. لا نخزن محادثاتك مع الذكاء الاصطناعي في قواعد بياناتنا. تجنب إدخال بيانات شخصية حساسة في هذه الأدوات.</p>
          </S>
          <S t={{ ar: '5. حقوقك', en: '' }}>
            <p>يحق لك في أي وقت: حذف منشوراتك، طلب حذف حسابك وجميع بياناتك، أو الاستفسار عن بياناتك المخزنة — عبر مراسلتنا على <span dir="ltr" className="text-teal-700">Alsendi.11.a@gmail.com</span>.</p>
          </S>
          <S t={{ ar: '6. الأمان', en: '' }}>
            <p>نستخدم Supabase للمصادقة والتخزين بتشفير أثناء النقل (HTTPS) والتخزين. كلمات المرور مشفرة ولا يمكن لأحد من الفريق الاطلاع عليها.</p>
          </S>
        </>
      ) : (
        <>
          <S t={{ ar: '', en: '1. Our Core Principle' }}>
            <p>Your privacy is not a feature in Khotwa — it is the design foundation. We collect the minimum possible data and never sell or share it with third parties for commercial purposes.</p>
          </S>
          <S t={{ ar: '', en: '2. Local File Processing' }}>
            <p>All PDF & image tools (merge, split, compress, protect, OCR, convert, watermark, image processing) run <b>entirely inside your browser</b>. Your files never leave your device and are never uploaded to any server.</p>
            <p>Exception: files you explicitly choose to share in the Notes Library or Marketplace images are stored to make them available to other students — with your explicit consent at upload time.</p>
          </S>
          <S t={{ ar: '', en: '3. Data We Collect' }}>
            <ul className="list-disc ps-5 space-y-1">
              <li><b>Account:</b> email & hashed password (or Google ID) — only if you create an account for community features.</li>
              <li><b>Community content:</b> what you voluntarily post in forums, library, marketplace & projects bank.</li>
              <li><b>Saved tool data:</b> schedules and budget entries you enter to save them.</li>
              <li><b>We do NOT collect:</b> advertising cookies, or commercial analytics that track you across sites.</li>
            </ul>
          </S>
          <S t={{ ar: '', en: '4. AI Services' }}>
            <p>When using AI services (tutor, summarizer, quizzes...), the text you enter is sent to the AI provider (Google Gemini) for processing. We do not store your AI conversations in our databases. Avoid entering sensitive personal data in these tools.</p>
          </S>
          <S t={{ ar: '', en: '5. Your Rights' }}>
            <p>At any time you may: delete your posts, request full account & data deletion, or inquire about your stored data — by emailing <span dir="ltr" className="text-teal-700">Alsendi.11.a@gmail.com</span>.</p>
          </S>
          <S t={{ ar: '', en: '6. Security' }}>
            <p>We use Supabase for authentication and storage with encryption in transit (HTTPS) and at rest. Passwords are hashed and inaccessible to anyone on the team.</p>
          </S>
        </>
      )}
    </div>
  );
}
