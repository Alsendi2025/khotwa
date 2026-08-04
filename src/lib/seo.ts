import { useEffect } from 'react';
import { useLang } from './i18n';
import { SERVICES } from './services';

type Meta = { ar: string; en: string; kw: string };

const BRAND = { ar: 'خطوة — منصة الطالب الذكية', en: 'Khotwa — Smart Student Platform' };

/** وصف مخصص وكلمات مفتاحية مستهدفة لكل صفحة وخدمة */
export const PAGE_META: Record<string, Meta> = {
  'ai-tutor': {
    ar: 'استخدم أداة المعلم الذكي عبر منصة خطوة لتبسيط المفاهيم الأكاديمية والمناهج الدراسية مجاناً باستغلال تقنيات الذكاء الاصطناعي المتقدمة للطلاب والباحثين.',
    en: 'Use the AI Tutor tool on Khotwa to simplify academic concepts and curricula for free, leveraging advanced AI technologies for students and researchers.',
    kw: 'معلم ذكي, AI tutor, شرح دروس, study tutor',
  },
  summarizer: {
    ar: 'احصل على تلخيص سريع ودقيق للملفات والأبحاث العلمية والكتب بصيغ متعددة مع استخراج أهم النقاط والمحاور الرئيسية عبر أداة ملخص الأبحاث من منصة خطوة.',
    en: 'Get fast, accurate summaries of documents, research papers and books in multiple formats, extracting key points and main topics using Khotwa\'s Summarizer.',
    kw: 'تلخيص, PDF summarizer, ملخص ابحاث, document summary',
  },
  quiz: {
    ar: 'أنشئ اختبارات تفاعلية وبطاقات استذكار تلقائياً من محتوى المحاضرات والكتب لمراجعة المواد الجامعية والدراسية بذكاء على منصة خطوة.',
    en: 'Automatically generate interactive quizzes and flashcards from lecture notes and books to smartly review university material on Khotwa.',
    kw: 'اختبارات, quiz generator, بطاقات ذاكرة, flashcards',
  },
  writing: {
    ar: 'أداة المساعد الأكاديمي للكتابة على منصة خطوة تتيح لك كتابة وتحسين المقالات والأوراق الأكاديمية وصياغة النصوص باحترافية وبشكل خالي من الأخطاء.',
    en: 'The Academic Writing Assistant helps you write and improve essays and academic papers professionally and error-free on Khotwa.',
    kw: 'مساعد كتابة, writing assistant, proofreading, كتابة اكاديمية',
  },
  citation: {
    ar: 'قم بتوليد التوثيق والاستشهادات المرجعية الأكاديمية تلقائياً بمختلف الأساليب العلمية مثل APA و MLA و Harvard بضغطة زر واحدة عبر منصة خطوة.',
    en: 'Automatically generate academic citations in APA, MLA, Harvard and other styles with one click on Khotwa.',
    kw: 'توثيق مراجع, citation generator, APA MLA, مراجع',
  },
  cv: {
    ar: 'اصنع سيرة ذاتية احترافية واكتب خطاب الدافع المخصص للتقديم على المنح الدراسية والفرص الوظيفية بنجاح من خلال منصة خطوة.',
    en: 'Create a professional CV and tailored cover letters for scholarships and job applications using Khotwa\'s CV builder.',
    kw: 'سيرة ذاتية, CV builder, resume maker, خطاب دافع',
  },
  gpa: {
    ar: 'احسب معدلك الفصلي والتراكمي الجامعي (GPA) بدقة عالية وفق نظام الساعات المعتمدة مع إمكانية توقع المعدل المستهدف عبر منصة خطوة.',
    en: 'Calculate your term and cumulative GPA accurately according to credit hours, with target GPA prediction on Khotwa.',
    kw: 'حاسبة المعدل, GPA calculator, معدل تراكمي',
  },
  math: {
    ar: 'حل المعادلات الرياضية المعقدة ورسم الدوال البيانية خطوة بخ��وة بالذكاء الاصطناعي عبر أداة محلل الرياضيات المتقدمة مجاناً على منصة خطوة.',
    en: 'Solve complex math problems and graph functions step-by-step with the AI-powered Math Analyzer on Khotwa.',
    kw: 'حل مسائل رياضيات, math solver, رسم دوال, graphing calculator',
  },
  latex: {
    ar: 'محرّر ومحرك تنسيق معادلات ومستندات LaTeX الأكاديمية أونلاين مع المعاينة الفورية والتصدير المباشر للمقالات البحثية على منصة خطوة.',
    en: 'Online LaTeX editor and renderer with instant preview and export, ideal for academic equations and research papers on Khotwa.',
    kw: 'محرر LaTeX, KaTeX, معادلات, LaTeX editor',
  },
  schedule: {
    ar: 'نظم جدولك الدراسي الأسبوعي والمواعيد الأكاديمية والمحاضرات بشكل تفاعلي لزيادة تحصيلك الدراسي باستخدام أداة الجدول من منصة خطوة.',
    en: 'Organize your weekly class timetable, exam reminders and academic schedule interactively to boost study productivity on Khotwa.',
    kw: 'جدول دراسي, timetable, منظم محاضرات',
  },
  focus: {
    ar: 'هيئ بيئة دراسة هادئة تعتمد تقنية البومودورو والأصوات الخلفية المحفزة لزيادة التركيز والإنتاجية الدراسية اليومية على منصة خطوة.',
    en: 'Create a calm study environment with a Pomodoro timer and ambient sounds to increase focus and daily study productivity on Khotwa.',
    kw: 'تركيز, Pomodoro, مؤقت مذاكرة, focus timer',
  },
  budget: {
    ar: 'تتبع وادارة ميزانية الطالب ومتابعة المصاريف والمدخرات الشخصية والنفقات التقديرية خلال فترة الدراسة عبر منصة خطوة.',
    en: 'Track and manage student budgets, monitor expenses and savings with charts and live balance on Khotwa.',
    kw: 'ميزانية الطالب, expense tracker, تتبع مصاريف',
  },
  'pdf-merge': {
    ar: 'أدوات دمج وتقسيم ملفات PDF أونلاين مجاناً؛ ادمج عدة مستندات في ملف واحد أو جزئ الملفات الكبيرة بسهولة وأمان على منصة خطوة.',
    en: 'Merge and split PDF files online for free; combine documents or extract pages securely on Khotwa.',
    kw: 'دمج PDF, تقسيم PDF, merge split PDF',
  },
  'pdf-pages': {
    ar: 'قلل حجم ملفات PDF مع الحفاظ على الجودة وقم بإعادة ترتيب أو حذف الصفحات غير المرغوبة من مستنداتك الدراسية عبر منصة خطوة.',
    en: 'Compress PDFs and manage pages: reorder, rotate, delete and reduce file size locally on Khotwa.',
    kw: 'ضغط PDF, ترتيب صفحات, تقليل حجم PDF',
  },
  'pdf-protect': {
    ar: 'اضف كلمة سر لحماية مستندات PDF الخاصة بك أو فك الحماية عنها بأمان وسرعة تامة دون رفع الملفات على خوادم خارجية.',
    en: 'Password-protect PDFs or remove passwords locally and securely without uploading files on Khotwa.',
    kw: 'حماية PDF, فك حماية PDF, كلمة مرور PDF',
  },
  ocr: {
    ar: 'حوّل الصور والمستندات الممسوحة ضوئياً إلى نص عربي وإنجليزي قابل للتحرير والنسخ باستخدام أداة OCR الذكية من منصة خطوة.',
    en: 'Convert images and scanned documents into editable Arabic and English text using Khotwa\'s OCR tool.',
    kw: 'OCR عربي, تحويل صورة الى نص, استخراج نص',
  },
  convert: {
    ar: 'حوّل صيغ الملفات والمستندات والصور والأوفيس أونلاين بسرعة وبجودة ��الية دون الحاجة لتثبيت برامج عبر أداة تحويل الصيغ في منصة خطوة.',
    en: 'Convert files and documents online (images, PDFs, PPTX) quickly and with high quality using Khotwa\'s converter.',
    kw: 'محول صيغ, file converter, تحويل ملفات',
  },
  'pdf-watermark': {
    ar: 'أضف توقيعك الإلكتروني أو علامة مائية مخصصة على ملفات الـ PDF لحماية ملكيتك الفكرية وحقوق أبحاثك الأكاديمية على منصة خطوة.',
    en: 'Add an electronic signature or custom watermark to PDFs to protect intellectual property on Khotwa.',
    kw: 'علامة مائية, توقيع PDF, watermark',
  },
  'image-tools': {
    ar: 'أدوات معالجة الصور الذكية لإزالة الخلفية بنقرة واحدة وتعديل جودة الصور الشخصية والأكاديمية فورياً مجاناً على منصة خطوة.',
    en: 'Smart image tools for background removal and instant quality adjustments for profile and academic images on Khotwa.',
    kw: 'إزالة خلفية, background remover, image editor',
  },
  majors: {
    ar: 'استكشف دليل التخصصات الجامعية لمعرفة مجالات العمل المستقبلية وشروط القبول والمحتوى الدراسي لمساعدتك في اختيار تخصصك عبر منصة خطوة.',
    en: 'Explore university majors, admission requirements and study content to help choose your field via Khotwa\'s majors guide.',
    kw: 'دليل تخصصات, majors guide, ادارة اختيار تخصص',
  },
  scholarships: {
    ar: 'تصفح أحدث المنح الدراسية المموّلة بالكامل والفرص التدريبية والمؤتمرات والمسابقات الطلابية المحدثة يومياً على منصة خطوة.',
    en: 'Browse the latest fully-funded scholarships, training opportunities and competitions updated daily on Khotwa.',
    kw: 'منح دراسية, scholarships, منح ممولة',
  },
  projects: {
    ar: 'مكتبة شاملة تضم أفضل أفكار ونماذج مشاريع التخرج الأكاديمية والتطبيقية لمختلف التخصصات الجامعية لمساعدتك في التخطيط عبر منصة خطوة.',
    en: 'A library of graduation project ideas with implementation steps and tools for various university disciplines on Khotwa.',
    kw: 'مشاريع تخرج, graduation projects, افكار مشروع',
  },
  notes: {
    ar: 'شارك وتصفح آلاف التلخيصات والمل��حظات الدراسية والملازم الأكاديمية المرفوعة من الطلاب في مختلف المواد والتخصصات على منصة خطوة.',
    en: 'Share and browse thousands of student summaries and lecture notes across subjects and universities on Khotwa.',
    kw: 'ملخصات, notes library, lecture summaries',
  },
  forums: {
    ar: 'انضم إلى مجتمع الطلاب الأكاديمي في منتديات خطوة للتفاعل وطرح الأسئلة وتبادل الخبرات والنقاش حول المواد والجامعات.',
    en: 'Join the student academic community in Khotwa forums to ask questions, share experiences and discuss subjects and universities.',
    kw: 'منتديات, student forum, نقاش طلابي',
  },
  market: {
    ar: 'سوق طلابي لبيع وشراء وتداول الكتب والمستلزمات الدراسية والأجهزة المستعملة بين الطلاب بأسعار مناسبة عبر منصة خطوة.',
    en: 'A student marketplace to buy and sell used books and study gear affordably among students on Khotwa.',
    kw: 'سوق طلابي, used textbooks, بيع كتب',
  },
  guide: {
    ar: 'نصائح ومقالات متخصصة في التوجيه الأكاديمي والتعامل مع ضغوط الامتحانات والحياة الجامعية وتطوير المهارات الشخصية عبر منصة خطوة.',
    en: 'Specialized guidance articles on academic and mental wellbeing: exam anxiety, study techniques and motivation on Khotwa.',
    kw: 'ارشاد اكاديمي, نصائح دراسة, guidance',
  },
};

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** يضبط وسم العنوان والوصف والكلمات المفتاحية للصفحة الحالية */
export function usePageMeta(id: string) {
  const { lang } = useLang();
  useEffect(() => {
    const svc = SERVICES.find((s) => s.id === id);
    const meta = PAGE_META[id];
    const title = svc
      ? `${svc.name[lang]} | ${BRAND[lang]}`
      : id === 'login'
        ? `${lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'} | ${BRAND[lang]}`
        : BRAND[lang];
    document.title = title;
    if (meta) {
      upsertMeta('description', meta[lang]);
      upsertMeta('keywords', meta.kw);
      upsertMeta('og:title', title, 'property');
      upsertMeta('og:description', meta[lang], 'property');
      // canonical link
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.href = window.location.href;
      // og:url and og:type
      upsertMeta('og:url', window.location.href, 'property');
      upsertMeta('og:type', 'website', 'property');
    }
  }, [id, lang]);
}
