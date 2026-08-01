import {
  Calculator, LineChart, Sigma, CalendarDays, Timer, Wallet,
  Layers, Settings2, Lock, ScanLine, Repeat, Stamp, Image,
  GraduationCap, FileText, ListChecks, PenLine, Quote, Briefcase,
  Compass, Award, Lightbulb, BookOpen, MessagesSquare, ShoppingBag, HeartHandshake,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Category = 'tools' | 'pdf' | 'ai' | 'community';

export type Service = {
  id: string;
  path: string;
  icon: LucideIcon;
  cat: Category;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
};

export const CATEGORIES: { id: Category; name: { ar: string; en: string }; color: string }[] = [
  { id: 'ai', name: { ar: 'خدمات الذكاء الاصطناعي', en: 'AI-Powered Services' }, color: 'bg-violet-600' },
  { id: 'tools', name: { ar: 'أدوات الطالب الذكية', en: 'Smart Student Tools' }, color: 'bg-teal-700' },
  { id: 'pdf', name: { ar: 'أدوات PDF والصور', en: 'PDF & Image Utilities' }, color: 'bg-amber-600' },
  { id: 'community', name: { ar: 'المجتمع والأدلة', en: 'Community & Guides' }, color: 'bg-sky-700' },
];

export const SERVICES: Service[] = [
  // Category B — client tools
  { id: 'gpa', path: '/gpa', icon: Calculator, cat: 'tools',
    name: { ar: 'حاسبة المعدل التراكمي', en: 'GPA Calculator' },
    desc: { ar: 'نظام 4.0 و 5.0 والنسبة المئوية مع التنبؤ بالمعدل', en: '4.0, 5.0 & percentage scales with GPA prediction' } },
  { id: 'math', path: '/math', icon: LineChart, cat: 'tools',
    name: { ar: 'محلل الرياضيات والرسم البياني', en: 'Math & Graph Solver' },
    desc: { ar: 'تبسيط، اشتقاق، تقييم الدوال مع رسم بياني تفاعلي', en: 'Simplify, differentiate & evaluate with live plotting' } },
  { id: 'latex', path: '/latex', icon: Sigma, cat: 'tools',
    name: { ar: 'منسق ومحرك LaTeX', en: 'LaTeX Engine' },
    desc: { ar: 'محرر معادلات مباشر مع معاينة فورية KaTeX', en: 'Live equation editor with instant KaTeX preview' } },
  { id: 'schedule', path: '/schedule', icon: CalendarDays, cat: 'tools',
    name: { ar: 'منظم الجداول الدراسية', en: 'Schedule Manager' },
    desc: { ar: 'جدولك الأسبوعي وتذكيرات الاختبارات في مكان واحد', en: 'Weekly timetable & exam reminders in one place' } },
  { id: 'focus', path: '/focus', icon: Timer, cat: 'tools',
    name: { ar: 'مساحة التركيز', en: 'Focus Timer' },
    desc: { ar: 'مؤقت بومودورو مع أصوات محيطة للمذاكرة', en: 'Pomodoro timer with ambient study sounds' } },
  { id: 'budget', path: '/budget', icon: Wallet, cat: 'tools',
    name: { ar: 'مساعد التخطيط المالي', en: 'Budget Planner' },
    desc: { ar: 'تتبع مصروفاتك الطلابية ودخلك بسهولة', en: 'Track your student income & expenses easily' } },
  // Category D — PDF & image
  { id: 'pdf-merge', path: '/pdf-merge', icon: Layers, cat: 'pdf',
    name: { ar: 'دمج وتقسيم PDF', en: 'Merge & Split PDF' },
    desc: { ar: 'ادمج عدة ملفات أو استخرج صفحات محددة محلياً', en: 'Merge files or extract specific pages locally' } },
  { id: 'pdf-pages', path: '/pdf-pages', icon: Settings2, cat: 'pdf',
    name: { ar: 'ضغط وتنظيم الصفحات', en: 'Compress & Page Manager' },
    desc: { ar: 'أعد الترتيب، دوّر، احذف الصفحات واضغط الملف', en: 'Reorder, rotate, delete pages & compress the file' } },
  { id: 'pdf-protect', path: '/pdf-protect', icon: Lock, cat: 'pdf',
    name: { ar: 'حماية وفك حماية PDF', en: 'Protect & Unlock PDF' },
    desc: { ar: 'أضف كلمة مرور لملفاتك أو أزلها', en: 'Add or remove a password from your PDFs' } },
  { id: 'ocr', path: '/ocr', icon: ScanLine, cat: 'pdf',
    name: { ar: 'استخراج النصوص من الصور', en: 'Image OCR' },
    desc: { ar: 'استخراج نصوص عربية وإنجليزية من الصور مجاناً', en: 'Extract Arabic & English text from images free' } },
  { id: 'convert', path: '/convert', icon: Repeat, cat: 'pdf',
    name: { ar: 'تحويل الصيغ', en: 'File Converters' },
    desc: { ar: 'صورة إلى PDF، وPDF إلى صور، وPPTX إلى PDF', en: 'Image to PDF, PDF to images, PPTX to PDF' } },
  { id: 'pdf-watermark', path: '/pdf-watermark', icon: Stamp, cat: 'pdf',
    name: { ar: 'التوقيع والعلامة المائية', en: 'Annotate & Watermark' },
    desc: { ar: 'أضف علامة مائية أو توقيعك على أي ملف PDF', en: 'Add a watermark or your signature to any PDF' } },
  { id: 'image-tools', path: '/image-tools', icon: Image, cat: 'pdf',
    name: { ar: 'معالجة الصور وإزالة الخلفية', en: 'Scanner Filter & BG Remover' },
    desc: { ar: 'فلتر ماسح ضوئي وإزالة خلفية صور السيرة الذاتية', en: 'Scanner filter & CV headshot background removal' } },
  // Category A — AI
  { id: 'ai-tutor', path: '/ai-tutor', icon: GraduationCap, cat: 'ai',
    name: { ar: 'المعلم الذكي ومبسط المفاهيم', en: 'AI Tutor' },
    desc: { ar: 'شرح تفاعلي خطوة بخطوة لأي مفهوم دراسي', en: 'Step-by-step interactive explanations of any concept' } },
  { id: 'summarizer', path: '/summarizer', icon: FileText, cat: 'ai',
    name: { ar: 'ملخص المستندات والأبحاث', en: 'PDF Summarizer' },
    desc: { ar: 'ارفع PDF واحصل على النقاط الرئيسية واسأل عنه', en: 'Upload a PDF, get key points & ask questions' } },
  { id: 'quiz', path: '/quiz', icon: ListChecks, cat: 'ai',
    name: { ar: 'مولد الاختبارات والبطاقات', en: 'Quiz & Flashcards' },
    desc: { ar: 'حوّل أي نص إلى اختبار وبطاقات مراجعة ذكية', en: 'Turn any text into MCQs & smart flashcards' } },
  { id: 'writing', path: '/writing', icon: PenLine, cat: 'ai',
    name: { ar: 'المساعد الأكاديمي للكتابة', en: 'Writing Assistant' },
    desc: { ar: 'تدقيق وإعادة صياغة أكاديمية بالعربية والإنجليزية', en: 'Academic proofreading & rephrasing (Ar/En)' } },
  { id: 'citation', path: '/citation', icon: Quote, cat: 'ai',
    name: { ar: 'مولد المراجع والاستشهادات', en: 'Citation Generator' },
    desc: { ar: 'APA و MLA و Harvard و IEEE بضغطة واحدة', en: 'APA, MLA, Harvard & IEEE in one click' } },
  { id: 'cv', path: '/cv', icon: Briefcase, cat: 'ai',
    name: { ar: 'منشئ السيرة الذاتية ورسائل الدافع', en: 'CV & Letter Builder' },
    desc: { ar: 'سيرة ذاتية احترافية ورسالة دافع مع تصدير PDF', en: 'Pro resume & motivation letters with PDF export' } },
  // Category C — community & database
  { id: 'majors', path: '/majors', icon: Compass, cat: 'community',
    name: { ar: 'دليل التخصصات والجامعات', en: 'Majors & Universities' },
    desc: { ar: 'موسوعة جامعات اليمن والخليج ومصر والأردن مع الروابط الرسمية', en: 'Yemen, Gulf, Egypt & Jordan universities with official links' } },
  { id: 'scholarships', path: '/scholarships', icon: Award, cat: 'community',
    name: { ar: 'بوابة المنح والفرص', en: 'Scholarships Portal' },
    desc: { ar: 'منح دراسية قابلة للبحث مع تنبيهات المواعيد', en: 'Searchable scholarships with deadline alerts' } },
  { id: 'projects', path: '/projects', icon: Lightbulb, cat: 'community',
    name: { ar: 'بنك مشاريع التخرج', en: 'Graduation Projects Bank' },
    desc: { ar: 'أفكار مشاريع مع خطوات التنفيذ والأدوات', en: 'Project ideas with steps & required tools' } },
  { id: 'notes', path: '/notes', icon: BookOpen, cat: 'community',
    name: { ar: 'مكتبة الملاحظات والملخصات', en: 'Notes Sharing Library' },
    desc: { ar: 'شارك وحمّل ملخصات الطلاب مجاناً', en: 'Share & download student notes for free' } },
  { id: 'forums', path: '/forums', icon: MessagesSquare, cat: 'community',
    name: { ar: 'منتديات النقاش', en: 'Student Forums' },
    desc: { ar: 'نقاشات دراسية مصنفة حسب المواد', en: 'Classified study discussion boards' } },
  { id: 'market', path: '/market', icon: ShoppingBag, cat: 'community',
    name: { ar: 'سوق الأدوات والكتب المستعملة', en: 'Used Marketplace' },
    desc: { ar: 'بيع وشراء الكتب وأدوات المعامل بين الطلاب', en: 'P2P books & lab gear between students' } },
  { id: 'guide', path: '/guide', icon: HeartHandshake, cat: 'community',
    name: { ar: 'دليل الإرشاد الأكاديمي والنفسي', en: 'Academic & Psych Guide' },
    desc: { ar: 'مقالات إدارة الوقت والتعامل مع ضغط الدراسة', en: 'Time management & study-stress articles' } },
];
