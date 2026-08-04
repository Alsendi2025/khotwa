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
    ar: 'حل المعادلات الرياضية المعقدة ورسم الدوال البيانية خطوة بخطوة بالذكاء الاصطناعي عبر أداة محلل الرياضيات المتقدمة مجاناً على منصة خطوة.',
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
    ar: 'تتبع وادارة ميزانية الطالب ومتابعة المصاريف والمدخرات الشخصية والنفقات التقديرية خلال فترة الدراسة الجامعية الذكية عبر منصة خطوة.',
    en: 'Track and manage student budgets, monitor expenses and savings with charts and live balance on Khotwa.',
    kw: 'ميزانية الطالب, expense tracker, تتبع مصاريف',
  },
  'pdf-merge': {
    ar: 'أدوات دمج وتقسيم ملفات PDF أونلاين مجاناً؛ ادمج عدة مستندات في ملف واحد أو جزئ الملفات الكبيرة بسهولة وأمان عاليين على منصة خطوة.',
    en: 'Merge and split PDF files online for free; combine documents or extract pages securely on Khotwa.',
    kw: 'دمج PDF, تقسيم PDF, merge split PDF',
  },
  'pdf-pages': {
    ar: 'قلل حجم ملفات PDF مع الحفاظ على الجودة وقم بإعادة ترتيب أو حذف الصفحات غير المرغوبة من مستنداتك الدراسية عبر منصة خطوة.',
    en: 'Compress PDFs and manage pages: reorder, rotate, delete and reduce file size locally on Khotwa.',
    kw: 'ضغط PDF, ترتيب صفحات, تقليل حجم PDF',
  },
  'pdf-protect': {
    ar: 'حماية PDF بكلمة مرور أو إزالة الحماية من ملفاتك — تشفير وفك تشفير محلي 100% دون مغادرة الملف لجهازك.',
    en: 'Password-protect PDFs or remove passwords — 100% local encryption/decryption, files never leave your device.',
    kw: 'حماية PDF بكلمة سر, فك حماية PDF, تشفير ملفات, protect PDF, unlock PDF, PDF password',
  },
  ocr: {
    ar: 'استخراج النصوص من الصور (OCR) بالعربية والإنجليزية مجاناً — حوّل صور المستندات والملازم إلى نص قابل للتحرير والنسخ باستخدام أداة OCR من منصة خطوة.',
    en: 'Free Arabic & English OCR — extract editable text from document photos and scans, right in your browser.',
    kw: 'استخراج نص من صورة, OCR عربي, تحويل صورة الى نص, image to text, Arabic OCR, Tesseract',
  },
  convert: {
    ar: 'محول ملفات مجاني: صور إلى PDF، PDF إلى صور PNG عالية الجودة، وعروض PPTX إلى PDF — تحويل فوري محلي دون رفع.',
    en: 'Free file converter: images to PDF, PDF to high-quality PNG images, and PPTX to PDF — instant local conversion.',
    kw: 'تحويل صور الى PDF, تحويل PDF الى صور, PPT الى PDF, image to PDF, PDF to image, converter',
  },
  'pdf-watermark': {
    ar: 'أضف علامة مائية نصية (تدعم العربية) أو وقّع ملفات PDF برسم توقيعك بيدك — أدوات توثيق ملفاتك مجاناً في المتصفح.',
    en: 'Add a text watermark (Arabic supported) or hand-draw your signature onto PDFs — free document tools in the browser.',
    kw: 'علامة مائية PDF, توقيع PDF, watermark PDF, sign PDF, إمضاء إلكتروني',
  },
  'image-tools': {
    ar: 'فلتر ماسح ضوئي لصور المستندات وإزالة خلفية صور السيرة الذاتية — معالجة صور فورية محلية مجاناً.',
    en: 'Scanner filter for document photos and headshot background remover for CVs — instant free local image processing.',
    kw: 'إزالة خلفية الصورة, فلتر مسح ضوئي, صورة شخصية للسيرة, background remover, scanner filter',
  },
  majors: {
    ar: 'دليل التخصصات والجامعات: موسوعة جامعات اليمن والخليج ومصر والأردن — الكليات والبرامج والدرجات العلمية وروابط رسمية.',
    en: 'Majors & universities directory: Yemen, Gulf, Egypt & Jordan — faculties, programs and degrees with official links, plus top in-demand majors.',
    kw: 'دليل الجامعات, تخصصات جامعية, جامعات اليمن, جامعات السعودية, أفضل التخصصات, university guide, majors',
  },
  scholarships: {
    ar: 'بوابة المنح الدراسية: منح ممولة بالكامل للبكالوريوس والماجستير والدكتوراه مع المواعيد وروابط التقديم.',
    en: 'Scholarships portal: fully-funded bachelor, master & PhD scholarships (Chevening, Fulbright, Erasmus, KAUST) with deadlines and links.',
    kw: 'منح دراسية مجانية, منح ممولة بالكامل, منح ماجستير, scholarships, fully funded, study abroad',
  },
  projects: {
    ar: 'بنك أفكار مشاريع التخرج: أفكار جاهزة في الذكاء الاصطناعي والبرمجة والهندسة مع خطوات التنفيذ والأدوات المقترحة.',
    en: 'Graduation project ideas bank: ready ideas in AI, coding and engineering with steps & tools, plus share your own.',
    kw: 'افكار مشاريع تخرج, مشروع تخرج حاسوب, graduation project ideas, capstone project',
  },
  notes: {
    ar: 'مكتبة الملخصات والملاحظات الطلابية: حمّل ملخصات المواد مجاناً أو ارفع ملخصاتك وشاركها مع آلاف الطلاب.',
    en: 'Student notes library: download course summaries free or upload and share yours with thousands of students.',
    kw: 'ملخصات جامعية, تحميل ملازم, مشاركة ملاحظات, study notes, lecture notes, course summaries',
  },
  forums: {
    ar: 'منتديات نقاش طلابية مصنفة: اسأل وناقش في الرياضيات والبرمجة واللغات والاختبارات والقبول الجامعي مع طلاب من مختلف الجامعات.',
    en: 'Classified student discussion forums: ask & discuss math, coding, languages, exams and admissions with students everywhere.',
    kw: 'منتدى طلاب, نقاش دراسي, اسئلة جامعية, student forum, study discussion',
  },
  market: {
    ar: 'سوق الطلاب للكتب والأدوات المستعملة: بِع واشترِ الكتب الجامعية والآلات الحاسبة وأدوات المعامل بأسعار طلابية مباشرة بين الطلاب.',
    en: 'Student marketplace for used books & gear: buy and sell textbooks, calculators and lab equipment peer-to-peer.',
    kw: 'كتب جامعية مستعملة, بيع كتب, سوق طلابي, used textbooks, student marketplace',
  },
  guide: {
    ar: 'دليل الإرشاد الأكاديمي والنفسي: مقالات عملية في إدارة الوقت، قلق الاختبارات، الاحتراق الدراسي، تقنيات المذاكرة الفعالة والدافعية.',
    en: 'Academic & psychological guide: practical articles on time management, exam anxiety, burnout, effective study techniques and motivation.',
    kw: 'ادارة الوقت للطلاب, قلق الامتحانات, طرق مذاكرة, study tips, exam anxiety, time management',
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

function upsertJsonLd(obj: object, dataId = 'khotwa-jsonld') {
  let el = document.head.querySelector(`script[type="application/ld+json"][data-id="${dataId}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-id', dataId);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(obj, null, 2);
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

      // JSON-LD structured data
      const jsonLd: any = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": window.location.href,
        "description": meta ? meta[lang] : BRAND[lang],
        "publisher": {
          "@type": "Organization",
          "name": BRAND[lang],
          "url": "https://khotwa-weld.vercel.app"
        }
      };
      if (svc) {
        jsonLd.mainEntity = {
          "@type": "Service",
          "serviceType": svc.name[lang],
          "url": window.location.href,
          "description": meta ? meta[lang] : undefined
        };
      }
      upsertJsonLd(jsonLd, `khotwa-${id}`);
    }
  }, [id, lang]);
}
