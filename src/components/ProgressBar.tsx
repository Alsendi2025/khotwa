import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ProgressBar({ pct, label, done }: { pct: number; label: string; done?: boolean }) {
  return (
    <div className="my-3">
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
        <span className={`flex items-center gap-1.5 ${done ? 'text-teal-700' : 'text-stone-600'}`}>
          {done ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="animate-spin text-teal-700" />}
          {label}
        </span>
        <span className="text-stone-400 tabular-nums" dir="ltr">{Math.min(100, Math.round(pct))}%</span>
      </div>
      <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-200 ${done ? 'bg-teal-500' : 'bg-teal-700'}`}
          style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
