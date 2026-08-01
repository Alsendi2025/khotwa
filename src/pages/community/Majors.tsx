import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Building2, ChevronLeft, ChevronRight, GraduationCap, Landmark, BookMarked, X, MapPin, Home, Globe, ExternalLink, BadgeCheck, Languages as LangIcon, CalendarRange, ClipboardList, TrendingUp, Briefcase, Sparkles, ArrowLeft, ArrowRight, School } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';
import { COUNTRIES, UNIVERSITIES } from '../../data/directory';
import type { Uni, Faculty, Program } from '../../data/directory';
import { TOP_MAJORS } from '../../data/topMajors';
import type { TopMajor } from '../../data/topMajors';

type Degree = 'bachelor' | 'master' | 'phd';
type View = 'home' | 'browse';

const DEGREES: { id: Degree | 'all'; ar: string; en: string }[] = [
  { id: 'all', ar: 'كل الدرجات العلمية', en: 'All degree levels' },
  { id: 'bachelor', ar: 'بكالوريوس', en: "Bachelor's" },
  { id: 'master', ar: 'ماجستير', en: "Master's" },
  { id: 'phd', ar: 'دكتوراه', en: 'Doctorate' },
];

const DEGREE_BADGE: Record<string, { ar: string; en: string; cls: string }> = {
  bachelor: { ar: 'بكالوريوس', en: 'BSc', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  master: { ar: 'ماجستير', en: 'MSc', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  phd: { ar: 'دكتوراه', en: 'PhD', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const PAGE_SIZE = 24;

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** شريط مؤشر الطلب في سوق العمل */
function DemandBar({ level, label }: { level: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-stone-400">{label}</span>
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`w-3.5 h-1.5 rounded-full ${i < level ? (level >= 5 ? 'bg-teal-500' : 'bg-amber-500') : 'bg-stone-200'}`} />
        ))}
      </span>
    </div>
  );
}

export default function Majors() {
  const { tr, lang } = useLang();

  const [view, setView] = useState<View>('home');
  const [country, setCountry] = useState('all');
  const [city, setCity] = useState('all');
  const [uniId, setUniId] = useState('all');
  const [degree, setDegree] = useState<Degree | 'all'>('all');
  const [rawQuery, setRawQuery] = useState('');
  const [page, setPage] = useState(0);
  const [infoUni, setInfoUni] = useState<Uni | null>(null);
  const [expandedMajor, setExpandedMajor] = useState<string | null>(null);
  const query = useDebounced(rawQuery, 250);
  const listTopRef = useRef<HTMLDivElement>(null);

  const N = (o: { name_ar: string; name_en: string }) => (lang === 'ar' ? o.name_ar : o.name_en);
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;
  const Prev = lang === 'ar' ? ChevronRight : ChevronLeft;
  const Next = lang === 'ar' ? ChevronLeft : ChevronRight;

  const countryUnis = useMemo(
    () => (country === 'all' ? UNIVERSITIES : UNIVERSITIES.filter((u) => u.country === country)),
    [country]
  );
  const cities = useMemo(() => {
    const seen = new Map<string, { ar: string; en: string }>();
    for (const u of countryUnis) if (!seen.has(u.city)) seen.set(u.city, { ar: u.city, en: u.city_en });
    return [...seen.entries()];
  }, [countryUnis]);

  const cityUnis = useMemo(
    () => (city === 'all' ? countryUnis : countryUnis.filter((u) => u.city === city)),
    [countryUnis, city]
  );
  const selectedUni = uniId === 'all' ? null : cityUnis.find((u) => u.id === uniId) || null;

  type Row = { uni: Uni; faculty: Faculty; program: Program };
  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Row[] = [];
    const unis = selectedUni ? [selectedUni] : cityUnis;
    for (const uni of unis) {
      for (const faculty of uni.faculties) {
        for (const program of faculty.programs) {
          if (degree !== 'all' && !program.degrees.includes(degree)) continue;
          if (q) {
            const hay = `${program.name_ar} ${program.name_en} ${faculty.name_ar} ${faculty.name_en} ${uni.name_ar} ${uni.name_en} ${uni.city} ${uni.city_en}`.toLowerCase();
            if (!hay.includes(q)) continue;
          }
          out.push({ uni, faculty, program });
        }
      }
    }
    return out;
  }, [cityUnis, selectedUni, degree, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [country, city, uniId, degree, query]);
  useEffect(() => { setUniId('all'); }, [city, country]);
  useEffect(() => { setCity('all'); }, [country]);

  const gotoPage = (p: number) => {
    setPage(p);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** كم جامعة تقدم هذا التخصص (للبطاقات الرئيسية) */
  const majorAvailability = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of TOP_MAJORS) {
      const key = m.searchKey.toLowerCase();
      const enKey = m.name_en.toLowerCase().split(' ')[0];
      let count = 0;
      for (const u of UNIVERSITIES) {
        let found = false;
        for (const f of u.faculties) {
          for (const p of f.programs) {
            if (p.name_ar.toLowerCase().includes(key) || p.name_en.toLowerCase().includes(enKey)) { found = true; break; }
          }
          if (found) break;
        }
        if (found) count++;
      }
      map[m.id] = count;
    }
    return map;
  }, []);

  const exploreMajor = (m: TopMajor) => {
    setRawQuery(m.searchKey);
    setCountry('all'); setCity('all'); setUniId('all'); setDegree('all');
    setView('browse');
  };

  const isPublic = (u: Uni) => u.type.includes('حكومية') || u.type_en.toLowerCase().includes('public') || u.type.includes('إقليمية');

  /* ==================== الصفحة الرئيسية: أهم التخصصات ==================== */
  if (view === 'home') {
    return (
      <ToolPage id="majors" wide>
        {/* مقدمة */}
        <div className="rounded-2xl bg-gradient-to-l from-sky-50 to-teal-50 border border-sky-100 p-5 mb-6">
          <h2 className="font-display text-lg font-bold text-sky-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-teal-600" />
            {tr({ ar: 'أهم التخصصات المطلوبة في سوق العمل', en: 'Top in-demand majors in the job market' })}
          </h2>
          <p className="text-sm text-stone-600 mt-1 leading-relaxed">
            {tr({
              ar: 'نظرة سريعة على التخصصات الأعلى طلباً مع فرص العمل والمهارات المطلوبة — انقر أي تخصص لعرض الجامعات التي تقدمه في اليمن والخليج ومصر والأردن.',
              en: 'A quick look at the highest-demand majors with jobs and required skills — tap any major to see universities offering it across Yemen, the Gulf, Egypt & Jordan.',
            })}
          </p>
          <button onClick={() => { setRawQuery(''); setView('browse'); }} className="btn mt-3 !py-2 text-sm">
            <Search size={15} /> {tr({ ar: 'تصفح كل الجامعات والبرامج', en: 'Browse all universities & programs' })}
          </button>
        </div>

        {/* بطاقات التخصصات */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOP_MAJORS.map((m) => {
            const open = expandedMajor === m.id;
            return (
              <div key={m.id}
                className={`card !p-4 transition-all cursor-pointer ${open ? 'border-sky-500 shadow-md' : 'hover:border-sky-400 hover:-translate-y-0.5'}`}
                onClick={() => setExpandedMajor(open ? null : m.id)}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none">{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm leading-snug">{lang === 'ar' ? m.name_ar : m.name_en}</h3>
                    <p className="text-[10px] text-stone-400" dir="ltr">{lang === 'ar' ? m.name_en : m.name_ar}</p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed mt-2.5">{lang === 'ar' ? m.brief_ar : m.brief_en}</p>

                <div className="mt-3">
                  <DemandBar level={m.demand} label={tr({ ar: 'الطلب في السوق', en: 'Market demand' })} />
                </div>

                {open && (
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-2.5">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mb-1"><Briefcase size={10} /> {tr({ ar: 'فرص العمل', en: 'Job opportunities' })}</p>
                      <p className="text-xs text-stone-600 leading-relaxed">{lang === 'ar' ? m.jobs_ar : m.jobs_en}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mb-1"><Sparkles size={10} /> {tr({ ar: 'المهارات المطلوبة', en: 'Required skills' })}</p>
                      <div className="flex flex-wrap gap-1">
                        {m.skills.map((s, i) => <span key={i} className="text-[10px] bg-sky-50 text-sky-800 rounded-full px-2 py-0.5">{s}</span>)}
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={(e) => { e.stopPropagation(); exploreMajor(m); }}
                  className="btn-soft w-full mt-3 !py-1.5 text-xs justify-center">
                  <Building2 size={13} />
                  {tr({ ar: `متوفر في ${majorAvailability[m.id]} جامعة — اعرضها`, en: `Offered at ${majorAvailability[m.id]} universities — view` })}
                </button>
              </div>
            );
          })}
        </div>
      </ToolPage>
    );
  }

  /* ==================== صفحة التصفح: القوائم المنسدلة والنتائج ==================== */
  return (
    <ToolPage id="majors" wide>
      <button onClick={() => { setView('home'); setRawQuery(''); }} className="flex items-center gap-1.5 text-sm text-sky-800 hover:text-sky-600 font-semibold mb-4">
        <Back size={16} /> {tr({ ar: 'أهم التخصصات', en: 'Top majors' })}
      </button>

      {/* مسار التنقل */}
      <nav className="flex items-center flex-wrap gap-1 text-xs text-stone-500 mb-4">
        <button onClick={() => setView('home')} className="flex items-center gap-1 hover:text-sky-700 font-semibold"><Home size={12} /> {tr({ ar: 'الدليل', en: 'Directory' })}</button>
        <span className="text-stone-300">/</span>
        <span className="font-semibold text-sky-800">{N(COUNTRIES.find((c) => c.id === country)!)}</span>
        {city !== 'all' && (<><span className="text-stone-300">/</span><span className="font-semibold text-sky-800">{lang === 'ar' ? city : cities.find(([c]) => c === city)?.[1].en || city}</span></>)}
        {selectedUni && (<><span className="text-stone-300">/</span><span className="font-semibold text-sky-800">{N(selectedUni)}</span></>)}
      </nav>

      {/* القوائم المنسدلة */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1 mb-1.5"><Landmark size={13} className="text-sky-700" /> {tr({ ar: 'الدولة', en: 'Country' })}</label>
            <select className="field !py-2.5" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => {
                const count = c.id === 'all' ? UNIVERSITIES.length : UNIVERSITIES.filter((u) => u.country === c.id).length;
                return <option key={c.id} value={c.id}>{c.flag} {N(c)} ({count})</option>;
              })}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1 mb-1.5"><MapPin size={13} className="text-sky-700" /> {tr({ ar: 'المدينة', en: 'City' })}</label>
            <select className="field !py-2.5" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="all">{tr({ ar: 'كل المدن', en: 'All cities' })} ({cities.length})</option>
              {cities.map(([key, names]) => <option key={key} value={key}>{lang === 'ar' ? names.ar : names.en}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1 mb-1.5"><Building2 size={13} className="text-sky-700" /> {tr({ ar: 'الجامعة', en: 'University' })}</label>
            <select className="field !py-2.5" value={uniId} onChange={(e) => setUniId(e.target.value)}>
              <option value="all">{tr({ ar: 'كل الجامعات', en: 'All universities' })} ({cityUnis.length})</option>
              {cityUnis.map((u) => <option key={u.id} value={u.id}>{N(u)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1 mb-1.5"><GraduationCap size={13} className="text-sky-700" /> {tr({ ar: 'الدرجة العلمية', en: 'Degree level' })}</label>
            <select className="field !py-2.5" value={degree} onChange={(e) => setDegree(e.target.value as Degree | 'all')}>
              {DEGREES.map((d) => <option key={d.id} value={d.id}>{tr(d)}</option>)}
            </select>
          </div>
        </div>

        {/* البحث */}
        <div className="relative mt-3">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="field !ps-9 !py-2.5" placeholder={tr({ ar: 'ابحث عن تخصص أو كلية أو جامعة...', en: 'Search major, faculty or university...' })}
            value={rawQuery} onChange={(e) => setRawQuery(e.target.value)} />
          {rawQuery && <button onClick={() => setRawQuery('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500"><X size={15} /></button>}
        </div>

        <p className="text-[11px] text-stone-400 mt-2.5">
          <b className="text-teal-700">{rows.length}</b> {tr({ ar: 'برنامج مطابق', en: 'matching programs' })} · {cityUnis.length} {tr({ ar: 'جامعة', en: 'universities' })}
        </p>
      </div>

      {/* بطاقة الجامعة المختارة */}
      {selectedUni && (
        <div className="card !py-3 mb-4 flex flex-wrap items-center gap-3">
          <School size={18} className="text-sky-700 shrink-0" />
          <div className="flex-1 min-w-40">
            <p className="font-bold text-sm">{N(selectedUni)}</p>
            <p className="text-[11px] text-stone-400">{lang === 'ar' ? selectedUni.city : selectedUni.city_en} · {lang === 'ar' ? selectedUni.type : selectedUni.type_en}{selectedUni.accredited && <span className="text-teal-700"> · ✓ {tr({ ar: 'معتمدة', en: 'Accredited' })}</span>}</p>
          </div>
          <button onClick={() => setInfoUni(selectedUni)} className="btn-soft !py-1.5 text-xs"><ClipboardList size={13} /> {tr({ ar: 'بطاقة الجامعة', en: 'Info card' })}</button>
          {selectedUni.website && <a href={selectedUni.website} target="_blank" rel="noreferrer" className="btn-soft !py-1.5 text-xs"><Globe size={13} /> {tr({ ar: 'الموقع', en: 'Website' })}</a>}
        </div>
      )}

      {/* النتائج */}
      <div ref={listTopRef} />
      {rows.length === 0 ? (
        <p className="text-center text-stone-400 py-12 text-sm">{tr({ ar: 'لا توجد برامج مطابقة — جرّب تعديل الفلاتر', en: 'No matching programs — adjust the filters' })}</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pageRows.map((r, i) => (
              <div key={`${r.uni.id}-${safePage}-${i}`} className="card !p-4 hover:border-sky-500 transition-colors">
                <div className="flex items-start gap-2">
                  <BookMarked size={16} className="text-sky-700 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm leading-snug">{N(r.program)}</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{N(r.faculty)}</p>
                    <button onClick={() => setInfoUni(r.uni)} className="text-[11px] text-sky-700 font-semibold hover:underline mt-0.5 flex items-center gap-1">
                      <Building2 size={10} /> {N(r.uni)} · {lang === 'ar' ? r.uni.city : r.uni.city_en}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {r.program.degrees.map((d) => {
                    const b = DEGREE_BADGE[d];
                    return b ? <span key={d} className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${b.cls}`}>{tr(b)}</span> : null;
                  })}
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ms-auto ${isPublic(r.uni) ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>{lang === 'ar' ? r.uni.type : r.uni.type_en}</span>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              <button onClick={() => gotoPage(safePage - 1)} disabled={safePage === 0} className="btn-soft !px-2.5 !py-1.5 disabled:opacity-30"><Prev size={16} /></button>
              {Array.from({ length: pageCount }, (_, i) => i)
                .filter((i) => i === 0 || i === pageCount - 1 || Math.abs(i - safePage) <= 1)
                .reduce<(number | 'gap')[]>((acc, i, idx, arr) => {
                  if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push('gap');
                  acc.push(i);
                  return acc;
                }, [])
                .map((p, i) => p === 'gap'
                  ? <span key={`g${i}`} className="text-stone-400 text-xs">…</span>
                  : <button key={p} onClick={() => gotoPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${p === safePage ? 'bg-sky-700 text-white border-sky-700' : 'bg-white border-stone-300 hover:border-sky-500'}`}>
                      {(p as number) + 1}
                    </button>)}
              <button onClick={() => gotoPage(safePage + 1)} disabled={safePage === pageCount - 1} className="btn-soft !px-2.5 !py-1.5 disabled:opacity-30"><Next size={16} /></button>
            </div>
          )}
        </>
      )}

      {/* بطاقة معلومات الجامعة */}
      {infoUni && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setInfoUni(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h2 className="font-display text-xl font-bold">{infoUni.name_ar}</h2>
                <p className="text-sm text-stone-400" dir="ltr">{infoUni.name_en}</p>
              </div>
              <button onClick={() => setInfoUni(null)} className="text-stone-400 hover:text-rose-600 shrink-0"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="bg-stone-50 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><Landmark size={10} /> {tr({ ar: 'النوع', en: 'Type' })}</p>
                <p className="font-semibold text-xs mt-0.5">{lang === 'ar' ? infoUni.type : infoUni.type_en}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><MapPin size={10} /> {tr({ ar: 'المدينة', en: 'City' })}</p>
                <p className="font-semibold text-xs mt-0.5">{lang === 'ar' ? infoUni.city : infoUni.city_en} — {N(COUNTRIES.find((c) => c.id === infoUni.country)!)}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><BadgeCheck size={10} /> {tr({ ar: 'الاعتماد', en: 'Accreditation' })}</p>
                <p className={`font-semibold text-xs mt-0.5 ${infoUni.accredited ? 'text-teal-700' : 'text-stone-500'}`}>
                  {infoUni.accredited ? tr({ ar: 'معتمدة رسمياً', en: 'Officially accredited' }) : tr({ ar: 'غير مؤكد', en: 'Unverified' })}
                </p>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><LangIcon size={10} /> {tr({ ar: 'لغة التدريس', en: 'Language' })}</p>
                <p className="font-semibold text-xs mt-0.5">{lang === 'ar' ? infoUni.language_ar || '—' : infoUni.language_en || '—'}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5 col-span-2">
                <p className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><CalendarRange size={10} /> {tr({ ar: 'نظام الدراسة', en: 'Study system' })}</p>
                <p className="font-semibold text-xs mt-0.5">{lang === 'ar' ? infoUni.system_ar || '—' : infoUni.system_en || '—'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-bold text-stone-500 mb-1.5">{tr({ ar: 'أبرز الكليات', en: 'Key faculties' })}</p>
              <div className="flex flex-wrap gap-1">
                {infoUni.faculties.slice(0, 6).map((f, i) => (
                  <span key={i} className="text-[10px] bg-sky-50 text-sky-800 rounded-full px-2 py-0.5">{N(f)}</span>
                ))}
                {infoUni.faculties.length > 6 && <span className="text-[10px] text-stone-400">+{infoUni.faculties.length - 6}</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {infoUni.website && (
                <a href={infoUni.website} target="_blank" rel="noreferrer" className="btn !py-2 text-xs flex-1 justify-center">
                  <Globe size={14} /> {tr({ ar: 'الموقع الرسمي', en: 'Official website' })} <ExternalLink size={11} />
                </a>
              )}
              {infoUni.admission && (
                <a href={infoUni.admission} target="_blank" rel="noreferrer" className="btn-soft !py-2 text-xs flex-1 justify-center">
                  <ClipboardList size={14} /> {tr({ ar: 'القبول والتسجيل', en: 'Admission' })} <ExternalLink size={11} />
                </a>
              )}
              <button onClick={() => { setCountry(infoUni.country); setCity(infoUni.city); setUniId(infoUni.id); setRawQuery(''); setInfoUni(null); }} className="btn-soft !py-2 text-xs w-full justify-center">
                <School size={14} /> {tr({ ar: 'عرض كل برامج هذه الجامعة', en: 'View all programs of this university' })}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-3 text-center">{tr({ ar: 'تحقق دائماً من الموقع الرسمي — قد تتغير البرامج وشروط القبول', en: 'Always verify on the official site — programs & requirements may change' })}</p>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
