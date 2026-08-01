import { ScrollText } from 'lucide-react';
import { useLang } from '../../lib/i18n';

export default function Terms() {
  const { tr, lang } = useLang();
  const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
    <section className="card mb-4">
      <h2 className="font-bold mb-2">{t}</h2>
      <div className="text-sm text-stone-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-3"><ScrollText size={26} /></span>
        <h1 className="font-display text-3xl font-bold text-ink">{tr({ ar: 'شروط الاستخدام', en: 'Terms of Service' })}</h1>
        <p className="text-xs text-stone-400 mt-2">{tr({ ar: 'آخر تحديث: يوليو 2026', en: 'Last updated: July 2026' })}</p>
      </div>

      {lang === 'ar' ? (
        <>
          <S t="1. قبول الشروط">
            <p>باستخدامك منصة «خطوة» فأنت توافق على هذه الشروط. المنصة مجانية وموجهة للاستخدام التعليمي الشخصي.</p>
          </S>
          <S t="2. الاستخدام المقبول">
            <ul className="list-disc ps-5 space-y-1">
              <li>استخدم الأدوات لأغراض تعليمية مشروعة فقط.</li>
              <li>لا ترفع أو تنشر محتوى ينتهك حقوق الملكية الفكرية (كتب مقرصنة، ملازم محمية بحقوق نشر دون إذن).</li>
              <li>لا تستخدم أدوات الذكاء الاصطناعي للغش الأكاديمي أو انتحال الأبحاث — هي مصممة للفهم والمراجعة وتحسين الكتابة.</li>
              <li>لا تستخدم أداة فك حماية PDF إلا على ملفات تملكها أو لديك إذن بالتعامل معها.</li>
            </ul>
          </S>
          <S t="3. محتوى المجتمع">
            <p>أنت المسؤول الوحيد عما تنشره في المنتديات والمكتبة والسوق. يُمنع المحتوى المسيء، المضلل، الإعلاني غير المتعلق بالطلاب، أو المخالف للقانون. نحتفظ بحق حذف أي محتوى مخالف وتعليق الحسابات المسيئة.</p>
          </S>
          <S t="4. سوق المستعمل">
            <p>المنصة وسيط عرض فقط ولا تتدخل في المعاملات بين الطلاب ولا تضمنها. تحقق من السلعة قبل الدفع والتقِ في أماكن عامة آمنة.</p>
          </S>
          <S t="5. دقة المعلومات">
            <p>نبذل جهداً كبيراً في دقة أدلة الجامعات والمنح، لكن البرامج وشروط القبول تتغير — تحقق دائماً من الموقع الرسمي قبل أي قرار. مخرجات الذكاء الاصطناعي قد تحتوي أخطاء — راجعها قبل الاعتماد عليها.</p>
          </S>
          <S t="6. حدود المسؤولية">
            <p>تُقدم الخدمات «كما هي» دون ضمانات. لا نتحمل مسؤولية أي خسارة ناتجة عن استخدام المنصة، بما في ذلك فقدان ملفات أو قرارات مبنية على محتوى المنصة.</p>
          </S>
          <S t="7. التعديلات">
            <p>قد نحدث هذه الشروط من وقت لآخر، وسيُشار لتاريخ آخر تحديث أعلى الصفحة. استمرارك في الاستخدام يعني موافقتك على النسخة المحدثة.</p>
          </S>
        </>
      ) : (
        <>
          <S t="1. Acceptance">
            <p>By using Khotwa you agree to these terms. The platform is free and intended for personal educational use.</p>
          </S>
          <S t="2. Acceptable Use">
            <ul className="list-disc ps-5 space-y-1">
              <li>Use the tools for legitimate educational purposes only.</li>
              <li>Do not upload or share content violating intellectual property rights (pirated books, copyrighted notes without permission).</li>
              <li>Do not use AI tools for academic cheating or plagiarism — they are designed for understanding, revision and writing improvement.</li>
              <li>Use the PDF unlock tool only on files you own or are authorized to handle.</li>
            </ul>
          </S>
          <S t="3. Community Content">
            <p>You are solely responsible for what you post in forums, library and marketplace. Abusive, misleading, non-student advertising, or illegal content is prohibited. We reserve the right to remove violating content and suspend abusive accounts.</p>
          </S>
          <S t="4. Marketplace">
            <p>The platform is a listing intermediary only — it does not participate in or guarantee transactions between students. Inspect items before paying and meet in safe public places.</p>
          </S>
          <S t="5. Information Accuracy">
            <p>We work hard on the accuracy of university & scholarship guides, but programs and requirements change — always verify on official websites before any decision. AI outputs may contain errors — review before relying on them.</p>
          </S>
          <S t="6. Limitation of Liability">
            <p>Services are provided "as is" without warranties. We are not liable for any loss resulting from platform use, including file loss or decisions based on platform content.</p>
          </S>
          <S t="7. Changes">
            <p>We may update these terms occasionally; the last-updated date appears above. Continued use means acceptance of the updated version.</p>
          </S>
        </>
      )}
    </div>
  );
}
