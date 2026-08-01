import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, MessageSquareText, Clock3 } from 'lucide-react';
import { useLang } from '../../lib/i18n';

const CONTACT_EMAIL = 'Alsendi.11.a@gmail.com';

export default function Contact() {
  const { tr } = useLang();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError(tr({ ar: 'الاسم مطلوب', en: 'Name is required' })); return; }
    if (!form.email.includes('@')) { setError(tr({ ar: 'أدخل بريداً إلكترونياً صالحاً', en: 'Enter a valid email' })); return; }
    if (form.message.trim().length < 10) { setError(tr({ ar: 'اكتب رسالة أوضح (10 أحرف على الأقل)', en: 'Write a clearer message (min 10 chars)' })); return; }
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('failed');
      setSent(true);
    } catch {
      setError(tr({ ar: 'تعذر الإرسال — حاول مجدداً أو راسلنا مباشرة عبر البريد', en: 'Sending failed — retry or email us directly' }));
    }
    setSending(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex w-14 h-14 rounded-3xl bg-teal-800 text-amber-300 items-center justify-center shadow-lg mb-3"><MessageSquareText size={26} /></span>
        <h1 className="font-display text-3xl font-bold text-ink">{tr({ ar: 'اتصل بنا', en: 'Contact Us' })}</h1>
        <p className="text-stone-500 mt-2 text-sm max-w-md mx-auto">{tr({ ar: 'سؤال، اقتراح، بلاغ عن مشكلة، أو فرصة تعاون؟ نقرأ كل رسالة ونرد بأسرع وقت.', en: 'A question, suggestion, bug report or partnership? We read every message and reply promptly.' })}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <a href={`mailto:${CONTACT_EMAIL}`} className="card text-center hover:border-teal-600 transition-colors">
          <Mail size={22} className="mx-auto text-teal-700 mb-2" />
          <p className="font-bold text-sm">{tr({ ar: 'البريد الرسمي', en: 'Official email' })}</p>
          <p className="text-xs text-teal-800 mt-1 break-all" dir="ltr">{CONTACT_EMAIL}</p>
        </a>
        <div className="card text-center">
          <Clock3 size={22} className="mx-auto text-teal-700 mb-2" />
          <p className="font-bold text-sm">{tr({ ar: 'وقت الرد', en: 'Response time' })}</p>
          <p className="text-xs text-stone-500 mt-1">{tr({ ar: 'خلال 24–48 ساعة غالباً', en: 'Usually within 24–48 hours' })}</p>
        </div>
        <div className="card text-center">
          <MessageSquareText size={22} className="mx-auto text-teal-700 mb-2" />
          <p className="font-bold text-sm">{tr({ ar: 'أو استخدم النموذج', en: 'Or use the form' })}</p>
          <p className="text-xs text-stone-500 mt-1">{tr({ ar: 'يصلنا فوراً دون فتح بريدك', en: 'Reaches us instantly, no email app needed' })}</p>
        </div>
      </div>

      {sent ? (
        <div className="card text-center py-12">
          <CheckCircle2 size={44} className="mx-auto text-teal-600 mb-3" />
          <h2 className="font-display text-xl font-bold">{tr({ ar: 'وصلت رسالتك بنجاح!', en: 'Message received!' })}</h2>
          <p className="text-sm text-stone-500 mt-2">{tr({ ar: 'شكراً لتواصلك — سنرد على بريدك في أقرب وقت.', en: 'Thanks for reaching out — we\'ll reply to your email soon.' })}</p>
          <button className="btn-soft mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
            {tr({ ar: 'إرسال رسالة أخرى', en: 'Send another message' })}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">{tr({ ar: 'الاسم *', en: 'Name *' })}</label>
              <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={tr({ ar: 'اسمك الكريم', en: 'Your name' })} />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">{tr({ ar: 'البريد الإلكتروني *', en: 'Email *' })}</label>
              <input className="field" type="email" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">{tr({ ar: 'الموضوع', en: 'Subject' })}</label>
            <select className="field" value={form.subject} onChange={(e) => set('subject', e.target.value)}>
              <option value="">{tr({ ar: 'اختر نوع الرسالة...', en: 'Pick a topic...' })}</option>
              <option value="suggestion">{tr({ ar: 'اقتراح ميزة أو تحسين', en: 'Feature suggestion' })}</option>
              <option value="bug">{tr({ ar: 'بلاغ عن مشكلة تقنية', en: 'Bug report' })}</option>
              <option value="content">{tr({ ar: 'تصحيح معلومة في الأدلة', en: 'Content correction' })}</option>
              <option value="partnership">{tr({ ar: 'شراكة أو تعاون', en: 'Partnership' })}</option>
              <option value="other">{tr({ ar: 'أخرى', en: 'Other' })}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">{tr({ ar: 'الرسالة *', en: 'Message *' })}</label>
            <textarea className="field min-h-32" value={form.message} onChange={(e) => set('message', e.target.value)}
              placeholder={tr({ ar: 'اكتب تفاصيل رسالتك هنا...', en: 'Write your message details here...' })} />
          </div>
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <button className="btn w-full sm:w-auto" disabled={sending}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {tr({ ar: 'إرسال الرسالة', en: 'Send message' })}
          </button>
        </form>
      )}
    </div>
  );
}
