import { ShieldCheck } from 'lucide-react';
import { useLang } from '../../lib/i18n';

export default function Privacy() {
  const { tr, lang } = useLang();
  const S = ({ title, children }: { title: { ar: string; en: string }; children: React.ReactNode }) => (
    <section className="mb-6">
      <h2 className="font-bold text-base mb-2 text-teal-900">{tr(title)}</h2>
      <div className="text-sm text-stone-600 leading-loose space-y-2">{children}</div>
    </section>
  );
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center"><ShieldCheck size={24} /></span>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{tr({ ar: 'سياسة الخصوصية', en: 'Privacy Policy' })}</h1>
          <p className="text-xs text-stone-400">{tr({ ar: 'آخر تحديث: يوليو 2026', en: 'Last updated: July 2026' })}</p>
        </div>
      </div>
      <p className="text-sm text-stone-500 leading-relaxed mb-8">
        {tr({ ar: 'خصوصيتك أولوية في منصة خطوة. توضح هذه السياسة بشفافية ما الذي نجمعه، وما الذي لا نجمعه، وكيف نحمي بياناتك.', en: 'Your privacy is a priority at Khotwa. This policy transparently explains what we collect, what we don\'t, and how we protect your data.' })}
      </p>

      <S title={{ ar: '1. ملفاتك لا تغادر جهازك', en: '1. Your files never leave your device' }}>
        <p>{tr({ ar: 'جميع أدوات PDF والصور (الدمج، التقسيم، الضغط، التحويل، OCR، التوقيع، إزالة الخلفية) تعمل بالكامل داخل متصفحك. لا يُرفع أي ملف إلى خوادمنا إطلاقاً، ولا نستطيع الاطلاع على محتواه.', en: 'All PDF & image tools (merge, split, compress, convert, OCR, sign, background removal) run entirely inside your browser. No file is ever uploaded to our servers and we cannot see its content.' })}</p>
        <p>{tr({ ar: 'الاستثناء الوحيد: الملفات التي تختار أنت مشاركتها علناً في مكتبة الملاحظات أو صور إعلانات السوق.', en: 'The only exception: files you explicitly choose to share publicly in the Notes Library or marketplace listing photos.' })}</p>
      </S>

      <S title={{ ar: '2. ما الذي نجمعه', en: '2. What we collect' }}>
        <ul className="list-disc ps-5 space-y-1">
          <li>{tr({ ar: 'بيانات الحساب (البريد الإلكتروني) عند التسجيل الاختياري للمشاركة في المجتمع.', en: 'Account data (email) when you optionally register to participate in the community.' })}</li>
          <li>{tr({ ar: 'المحتوى الذي تنشره طوعاً: مواضيع المنتدى، الملخصات، إعلانات السوق، أفكار المشاريع.', en: 'Content you voluntarily publish: forum threads, notes, marketplace listings, project ideas.' })}</li>
          <li>{tr({ ar: 'بيانات أدواتك الشخصية (الجدول، الميزانية) لتمكين الحفظ والمزامنة.', en: 'Your personal tool data (schedule, budget) to enable saving and sync.' })}</li>
          <li>{tr({ ar: 'رسائل التواصل التي ترسلها عبر نموذج اتصل بنا.', en: 'Messages you send via the contact form.' })}</li>
        </ul>
      </S>

      <S title={{ ar: '3. ما الذي لا نفعله أبداً', en: '3. What we never do' }}>
        <ul className="list-disc ps-5 space-y-1">
          <li>{tr({ ar: 'لا نبيع أو نؤجر بياناتك لأي طرف ثالث.', en: 'We never sell or rent your data to any third party.' })}</li>
          <li>{tr({ ar: 'لا نرسل رسائل تسويقية دون موافقتك.', en: 'We never send marketing emails without your consent.' })}</li>
          <li>{tr({ ar: 'لا نستخدم محتوى ملفاتك المحلية لأي غرض — فهي أصلاً لا تصلنا.', en: 'We never use your local files’ content for anything — it never reaches us in the first place.' })}</li>
        </ul>
      </S>

      <S title={{ ar: '4. خدمات الذكاء الاصطناعي', en: '4. AI services' }}>
        <p>{tr({ ar: 'عند استخدام المعلم الذكي أو الملخص أو مولد الاختبارات، يُرسل النص الذي تكتبه أو تلصقه إلى مزود الذكاء الاصطناعي (Google Gemini) لمعالجته وإرجاع النتيجة. لا تُرفق هويتك الشخصية بهذه الطلبات، وننصح بعدم إدخال بيانات حساسة في أدوات الذكاء الاصطناعي.', en: 'When using the AI tutor, summarizer or quiz generator, the text you type or paste is sent to the AI provider (Google Gemini) for processing. Your identity is not attached to these requests, and we advise against entering sensitive data into AI tools.' })}</p>
      </S>

      <S title={{ ar: '5. التخزين والأمان', en: '5. Storage & security' }}>
        <p>{tr({ ar: 'تُخزن بيانات الحسابات والمجتمع لدى مزود بنية تحتية سحابية آمن (Supabase) باتصالات مشفرة (HTTPS/TLS). كلمات المرور مُشفرة ولا يمكن لأحد الاطلاع عليها بما في ذلك فريقنا.', en: 'Account and community data is stored with a secure cloud infrastructure provider (Supabase) over encrypted connections (HTTPS/TLS). Passwords are hashed and unreadable by anyone, including our team.' })}</p>
      </S>

      <S title={{ ar: '6. حقوقك', en: '6. Your rights' }}>
        <p>{tr({ ar: 'يحق لك في أي وقت: حذف محتواك المنشور، طلب حذف حسابك وبياناتك بالكامل، أو الاستفسار عن بياناتك المخزنة — عبر مراسلتنا على Alsendi.11.a@gmail.com.', en: 'You may at any time: delete your published content, request full deletion of your account and data, or ask what data we hold — by emailing Alsendi.11.a@gmail.com.' })}</p>
      </S>

      <S title={{ ar: '7. التحديثات', en: '7. Updates' }}>
        <p>{tr({ ar: 'قد نحدث هذه السياسة من وقت لآخر، وسنوضح تاريخ آخر تحديث أعلى الصفحة. استمرارك في استخدام المنصة بعد التحديث يعني موافقتك عليه.', en: 'We may update this policy occasionally; the latest revision date is shown at the top. Continued use of the platform after an update constitutes acceptance.' })}</p>
      </S>
    </div>
  );
}
