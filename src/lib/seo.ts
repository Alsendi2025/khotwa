import { useEffect } from 'react';
import { useLang } from './i18n';
import { SERVICES } from './services';

type Meta = { ar: string; en: string; kw: string };

const BRAND = { ar: 'خطوة — منصة الطالب الذكية', en: 'Khotwa — Smart Student Platform' };

/** وصف مخصص وكلمات مفتاحية مستهدفة لكل صفحة وخدمة */
export const PAGE_META: Record<string, Meta> = {
  home: {
    ar: 'منصة خطوة: 26 خدمة مجانية للطلاب — معلم ذكي بالذكاء الاصطناعي، ملخص PDF، مولد اختبارات، أدوات PDF كاملة، حاسبة المعدل، دليل الجامعات والمنح، منتديات وسوق طلابي. كل أدوات الطالب في مكان واحد.',
    en: 'Khotwa: 26 free student services — AI tutor, PDF summarizer, quiz generator, full PDF toolkit, GPA calculator, universities & scholarships guide, forums and marketplace.',
    kw: 'منصة طلابية, أدوات الطالب, ذكاء اصطناعي للدراسة, student platform, free study tools, خطوة',
  },
  login: {
    ar: 'سجّل الدخول إلى منصة خطوة للمشاركة في المنتديات ومكتبة الملخصات وسوق الأدوات المستعملة — بالبريد الإلكتروني أو حساب Google.',
    en: 'Sign in to Khotwa to join forums, notes library and the student marketplace — via email or Google.',
    kw: 'تسجيل دخول, حساب طالب, login, student account',
  },
  gpa: {
    ar: 'حاسبة المعدل التراكمي أونلاين مجاناً: نظام 4.0 و 5.0 والنسبة المئوية، حساب معدل الفصل والتراكمي، والتنبؤ بالمعدل المطلوب لتحقيق هدفك.',
    en: 'Free online GPA calculator: 4.0, 5.0 and percentage scales, term & cumulative GPA, plus target GPA prediction.',
    kw: 'حاسبة المعدل التراكمي, حساب GPA, معدل الفصل, GPA calculator, CGPA, نظام 5 من 4',
  },
  math: {
    ar: 'محلل رياضيات مجاني: تبسيط التعابير، حساب المشتقات، تقييم الدوال، مع رسم بياني تفاعلي فوري للدوال الرياضية في متصفحك.',
    en: 'Free math solver: simplify expressions, compute derivatives, evaluate functions with instant interactive graphing.',
    kw: 'حل مسائل رياضيات, رسم دوال, مشتقات, math solver, function plotter, graphing calculator',
  },
  latex: {
    ar: 'محرر LaTeX مباشر مع معاينة فورية بمحرك KaTeX: اكتب المعادلات الرياضية والرموز العلمية وانسخ الكود جاهزاً لبحثك.',
    en: 'Live LaTeX editor with instant KaTeX preview: write math equations and scientific symbols, copy code for your paper.',
    kw: 'محرر لاتك, معادلات رياضية, LaTeX editor, KaTeX, equation editor',
  },
  schedule: {
    ar: 'منظم الجدول الدراسي الأسبوعي مع تذكيرات الاختبارات وعدّاد الأيام المتبقية — نظّم محاضراتك ومعاملك واختباراتك في مكان واحد.',
    en: 'Weekly class timetable organizer with exam reminders and countdown — classes, labs and exams in one place.',
    kw: 'جدول دراسي, تنظيم المحاضرات, تذكير اختبارات, class schedule, timetable, exam reminder',
  },
  focus: {
    ar: 'مؤقت بومودورو للمذاكرة مع أصوات محيطة (مطر، أمواج، مدفأة) مولّدة محلياً — ارفع تركيزك بجلسات 25 دقيقة وراحات منظمة.',
    en: 'Pomodoro study timer with locally-synthesized ambient sounds (rain, waves, fireplace) — 25-minute deep focus sessions.',
    kw: 'بومودورو, مؤقت مذاكرة, تركيز, Pomodoro timer, focus timer, study sounds',
  },
  budget: {
    ar: 'مخطط مصروف الطالب: سجّل دخلك ومصروفاتك حسب الفئة (طعام، مواصلات، كتب) مع رسوم توضيحية ورصيد لحظي.',
    en: 'Student budget planner: track income & expenses by category (food, transport, books) with charts and live balance.',
    kw: 'ميزانية الطالب, تتبع مصروفات, إدارة مالية, student budget, expense tracker',
  },
  'pdf-merge': {
    ar: 'دمج وتقسيم ملفات PDF مجاناً وبخصوصية كاملة — المعالجة تتم في متصفحك دون رفع الملفات لأي خادم. ادمج عدة ملفات أو استخرج صفحات محددة.',
    en: 'Merge & split PDF files free with full privacy — processing happens in your browser, no uploads. Merge files or extract page ranges.',
    kw: 'دمج PDF, تقسيم PDF, استخراج صفحات, merge PDF, split PDF, بدون رفع',
  },
  'pdf-pages': {
    ar: 'ضغط PDF وتنظيم الصفحات: أعد ترتيب الصفحات بالسحب، دوّرها، احذفها، واضغط حجم الملف — كل ذلك محلياً في المتصفح.',
    en: 'Compress PDF & manage pages: reorder, rotate, delete pages and shrink file size — all locally in your browser.',
    kw: 'ضغط PDF, تصغير حجم PDF, ترتيب صفحات, compress PDF, reduce PDF size, rotate pages',
  },
  'pdf-protect': {
    ar: 'حماية PDF بكلمة مرور أو إزالة الحماية من ملفاتك — تشفير وفك تشفير محلي 100% دون مغادرة الملف لجهازك.',
    en: 'Password-protect PDFs or remove passwords — 100% local encryption/decryption, files never leave your device.',
    kw: 'حماية PDF بكلمة سر, فك حماية PDF, تشفير ملفات, protect PDF, unlock PDF, PDF password',
  },
  ocr: {
    ar: 'استخراج النصوص من الصور (OCR) بالعربية والإنجليزية مجاناً — حوّل صور المستندات والملازم إلى نص قابل للنسخ والتعديل في متصفحك.',
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
    ar: 'فلتر ماسح ضوئي لصور المستندات وإزالة خلفية الصور الشخصية للسيرة الذاتية — معالجة صور فورية محلية مجانية.',
    en: 'Scanner filter for document photos and headshot background remover for CVs — instant free local image processing.',
    kw: 'إزالة خلفية الصورة, فلتر مسح ضوئي, صورة شخصية للسيرة, background remover, scanner filter',
  },
  'ai-tutor': {
    ar: 'معلم ذكي بالذكاء الاصطناعي يشرح أي مفهوم دراسي خطوة بخطوة بالعربية — رياضيات، فيزياء، برمجة، اقتصاد ولكل المستويات.',
    en: 'AI tutor explaining any concept step-by-step — math, physics, coding, economics, for every level.',
    kw: 'معلم ذكاء اصطناعي, شرح دروس, مساعد دراسة, AI tutor, homework help, study assistant',
  },
  summarizer: {
    ar: 'ملخص المستندات بالذكاء الاصطناعي: ارفع PDF أو ملفاً نصياً واحصل على النقاط الرئيسية فوراً، ثم اسأل أسئلة عن المحتوى وأجب منه مباشرة.',
    en: 'AI document summarizer: upload a PDF or text file, get key points instantly, then ask questions answered from the content.',
    kw: 'تلخيص PDF, ملخص ابحاث, تلخيص بالذكاء الاصطناعي, PDF summarizer, AI summary, document QA',
  },
  quiz: {
    ar: 'مولد اختبارات وبطاقات مراجعة ذكية: حوّل ملزمتك أو أي نص إلى أسئلة اختيار من متعدد مع شرح الإجابات وبطاقات Flashcards تفاعلية.',
    en: 'AI quiz & flashcard generator: turn notes into multiple-choice questions with explanations and interactive flashcards.',
    kw: 'مولد اسئلة, اختبار من نص, بطاقات مراجعة, quiz generator, flashcards, MCQ maker',
  },
  writing: {
    ar: 'مساعد الكتابة الأكاديمية بالذكاء الاصطناعي: تدقيق لغوي، إعادة صياغة، أسلوب أكاديمي رسمي، توسيع وتلخيص — بالعربية والإنجليزية.',
    en: 'AI academic writing assistant: proofreading, rephrasing, formal tone, expanding & shortening — Arabic and English.',
    kw: 'تدقيق لغوي, إعادة صياغة, كتابة اكاديمية, proofreading, paraphrasing tool, academic writing',
  },
  citation: {
    ar: 'مولد المراجع والاستشهادات: أنشئ مراجع بأنماط APA و MLA و Harvard و IEEE تلقائياً للكتب والمقالات والمواقع بضغطة واحدة.',
    en: 'Citation generator: create APA, MLA, Harvard & IEEE references for books, articles and websites in one click.',
    kw: 'توثيق مراجع, APA بالعربي, مولد اقتباسات, citation generator, APA MLA Harvard IEEE, references',
  },
  cv: {
    ar: 'منشئ سيرة ذاتية ورسائل دافع بالذكاء الاصطناعي: أدخل بياناتك واحصل على سيرة احترافية أو رسالة دافع للمنح مع تصدير PDF يدعم العربية.',
    en: 'AI CV & motivation letter builder: enter your details, get a professional resume or scholarship letter with Arabic-ready PDF export.',
    kw: 'انشاء سيرة ذاتية, رسالة دافع, CV بالذكاء الاصطناعي, resume builder, motivation letter, CV maker',
  },
  majors: {
    ar: 'دليل التخصصات والجامعات: موسوعة جامعات اليمن والخليج ومصر والأردن — الكليات والبرامج والدرجات العلمية مع الروابط الرسمية وأهم التخصصات المطلوبة في سوق العمل.',
    en: 'Majors & universities directory: Yemen, Gulf, Egypt & Jordan — faculties, programs and degrees with official links, plus top in-demand majors.',
    kw: 'دليل الجامعات, تخصصات جامعية, جامعات اليمن, جامعات السعودية, أفضل التخصصات, university guide, majors',
  },
  scholarships: {
    ar: 'بوابة المنح الدراسية: منح ممولة بالكامل للبكالوريوس والماجستير والدكتوراه (تشيفننغ، فولبرايت، إيراسموس، كاوست) مع المواعيد النهائية وروابط التقديم.',
    en: 'Scholarships portal: fully-funded bachelor, master & PhD scholarships (Chevening, Fulbright, Erasmus, KAUST) with deadlines and links.',
    kw: 'منح دراسية مجانية, منح ممولة بالكامل, منح ماجستير, scholarships, fully funded, study abroad',
  },
  projects: {
    ar: 'بنك أفكار مشاريع التخرج: أفكار جاهزة في الذكاء الاصطناعي والبرمجة والهندسة مع خطوات التنفيذ والأدوات المطلوبة، وشارك فكرتك مع الطلاب.',
    en: 'Graduation project ideas bank: ready ideas in AI, coding and engineering with steps & tools, plus share your own.',
    kw: 'افكار مشاريع تخرج, مشروع تخرج حاسوب, graduation project ideas, capstone project',
  },
  notes: {
    ar: 'مكتبة الملخصات والملاحظات الطلابية: حمّل ملخصات المواد مجاناً أو ارفع ملخصاتك وشاركها مع آلاف الطلاب.',
    en: 'Student notes library: download course summaries free or upload and share yours with thousands of students.',
    kw: 'ملخصات جامعية, تحميل ملازم, مشاركة ملاحظات, study notes, lecture notes, course summaries',
  },
  forums: {
    ar: 'منتديات نقاش طلابية مصنفة: اسأل وناقش في الرياضيات والبرمجة واللغات والاختبارات والقبول الجامعي مع طلاب من كل مكان.',
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
    }
  }, [id, lang]);
}
