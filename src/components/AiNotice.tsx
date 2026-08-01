import { Hourglass, AlertTriangle, Settings } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { AiError } from '../lib/ai';

/** Generic, user-friendly notices only — never exposes providers or technical details. */
export default function AiNotice({ error }: { error: Error | null }) {
  const { tr } = useLang();
  if (!error) return null;
  const code = error instanceof AiError ? error.code : 'unavailable';

  const content = {
    unconfigured: {
      icon: Settings,
      msg: {
        ar: 'الخدمة الذكية غير مفعّلة بعد على هذا الخادم. تواصل مع مسؤول المنصة لتفعيلها.',
        en: 'The smart service is not activated on this server yet. Contact the platform admin.',
      },
    },
    busy: {
      icon: Hourglass,
      msg: {
        ar: 'الخدمة مشغولة حالياً بسبب كثرة الطلبات — انتظر لحظات ثم أعد المحاولة.',
        en: 'The service is busy right now — wait a moment and try again.',
      },
    },
    network: {
      icon: AlertTriangle,
      msg: {
        ar: 'تعذر الاتصال — تحقق من اتصالك بالإنترنت وأعد المحاولة.',
        en: 'Connection failed — check your internet and retry.',
      },
    },
    unavailable: {
      icon: AlertTriangle,
      msg: {
        ar: 'تعذر إكمال الطلب حالياً — أعد المحاولة بعد قليل.',
        en: 'Could not complete the request right now — please try again shortly.',
      },
    },
  } as const;

  const c = content[code as keyof typeof content] || content.unavailable;
  const Icon = c.icon;

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex gap-3 items-start my-4">
      <Icon className="text-amber-600 shrink-0 mt-0.5" size={20} />
      <p className="text-sm text-amber-900 leading-relaxed">{tr(c.msg)}</p>
    </div>
  );
}
