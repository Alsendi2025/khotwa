import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n';
import { SERVICES, CATEGORIES } from '../lib/services';

export default function ToolPage({ id, children, wide }: { id: string; children: ReactNode; wide?: boolean }) {
  const { lang, tr } = useLang();
  const svc = SERVICES.find((s) => s.id === id)!;
  const cat = CATEGORIES.find((c) => c.id === svc.cat)!;
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;
  const Icon = svc.icon;
  return (
    <div className={`mx-auto px-4 py-8 w-full ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-teal-800 hover:text-teal-600 font-medium mb-5">
        <Back size={16} /> {tr({ ar: 'كل الخدمات', en: 'All services' })}
      </Link>
      <div className="flex items-center gap-4 mb-2">
        <div className={`w-12 h-12 rounded-2xl ${cat.color} text-white flex items-center justify-center shadow-lg`}>
          <Icon size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">{tr(svc.name)}</h1>
          <p className="text-sm text-stone-500">{tr(svc.desc)}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
