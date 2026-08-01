import { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquareText, Clock3 } from 'lucide-react';
import { useLang } from '../../lib/i18n';

const CONTACT_EMAIL = 'Alsendi.11.a@gmail.com';

export default function Contact() {
  const { tr } = useLang();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = tr({ ar: 'الاسم مطلوب', en: 'Name is required' });
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = tr({ ar: 'أدخل بريداً صالحاً', en: 'Enter a valid email' });
    if (form.message.trim().length < 10) e.message = tr({ ar: 'الرسالة قصيرة جداً (10 أحرف على الأقل)', en: 'Message too short (min 10 chars)' });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    // فتح برنامج البريد برسالة جاهزة — تواصل مباشر وموثوق دون خادم وسيط
    const body = `الاسم: ${form.name}\nالبريد: ${form.email}\n\n${form.message}`;
    const subject = form.subject.trim() || tr({ ar: 'رسالة من منصة خطوة', en: 'Message from Khotwa' });
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-3"><MessageSquareText size={26} /></span>
        <h1 className="font-display text-3xl font-bold text-ink">{tr({ ar: 'اتصل بنا', en: 'Contact Us' })}</h1>
        <p className="text-stone-500 mt-2">{tr({ ar: 'نسعد بملاحظاتكم واقتراحاتكم — رأيك يطور المنصة', en: 'We welcome your feedback — your input shapes the platform' })}</p>
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        <div className="md:col-span-2 space-y-3">
          <a href={`mailto:${CONTACT_EMAIL}`} className="card flex items-center gap-3 hover:border-teal-600 transition-colors">
            <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><Mail size={19} /></span>
            <div className="min-w-0">
              <p className="font-bold text-sm">{tr({ ar: 'البريد الرسمي', en: 'Official Email' })}</p>
              <p className="text-xs text-teal-700 truncate" dir="ltr">{CONTACT_EMAIL}</p>
            </div>
          </a>
          <div className="card flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Clock3 size={19} /></span>
            <div>
              <p className="font-bold text-sm">{tr({ ar: 'وقت الرد', en: 'Response Time' })}</p>
              <p className="text-xs text-stone-500">{tr({ ar: 'خلال 24–48 ساعة غالباً', en: 'Usually within 24–48 hours' })}</p>
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed px-1">
            {tr({ ar: 'للإبلاغ عن محتوى مخالف في المنتديات أو المكتبة، أو لطلب حذف بياناتك، راسلنا على نفس البريد.', en: 'To report violating content in forums/library, or request data deletion, use the same email.' })}
          </p>
        </div>

        <div className="md:col-span-3 card">
          {sent ? (
            <div className="text-center py-10">
              <CheckCircle2 size={44} className="mx-auto text-teal-600 mb-3" />
              <p className="font-bold">{tr({ ar: 'تم فتح برنامج البريد لديك', en: 'Your email app was opened' })}</p>
              <p className="text-sm text-stone-500 mt-1">{tr({ ar: 'أرسل الرسالة من بريدك وسنرد عليك قريباً', en: 'Send it from your mail app and we will reply soon' })}</p>
              <button className="btn-soft mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                {tr({ ar: 'رسالة أخرى', en: 'Another message' })}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <input className="field" placeholder={tr({ ar: 'الاسم *', en: 'Name *' })} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <input className="field" type="email" dir="ltr" placeholder={tr({ ar: 'البريد الإلكتروني *', en: 'Email *' })} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <input className="field" placeholder={tr({ ar: 'الموضوع (اختياري)', en: 'Subject (optional)' })} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <div>
                <textarea className="field min-h-32" placeholder={tr({ ar: 'رسالتك *', en: 'Your message *' })} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {errors.message && <p className="text-rose-600 text-xs mt-1">{errors.message}</p>}
              </div>
              <button type="submit" className="btn w-full"><Send size={16} /> {tr({ ar: 'إرسال الرسالة', en: 'Send message' })}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
