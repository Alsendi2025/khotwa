import yemenData from './yemen_universities_data.json';
import regionData from './gulf_egypt_jordan_data.json';

export type Program = { name_ar: string; name_en: string; degrees: string[] };
export type Faculty = { name_ar: string; name_en: string; programs: Program[] };
export type Uni = {
  id: string; country: string;
  name_ar: string; name_en: string;
  type: string; type_en: string;
  city: string; city_en: string;
  website?: string; admission?: string;
  accredited?: boolean;
  language_ar?: string; language_en?: string;
  system_ar?: string; system_en?: string;
  faculties: Faculty[];
};
export type Country = { id: string; name_ar: string; name_en: string; flag: string };

export const COUNTRIES: Country[] = [
  { id: 'all', name_ar: 'كل الدول', name_en: 'All countries', flag: '🌍' },
  { id: 'ye', name_ar: 'اليمن', name_en: 'Yemen', flag: '🇾🇪' },
  { id: 'sa', name_ar: 'السعودية', name_en: 'Saudi Arabia', flag: '🇸🇦' },
  { id: 'ae', name_ar: 'الإمارات', name_en: 'UAE', flag: '🇦🇪' },
  { id: 'qa', name_ar: 'قطر', name_en: 'Qatar', flag: '🇶🇦' },
  { id: 'kw', name_ar: 'الكويت', name_en: 'Kuwait', flag: '🇰🇼' },
  { id: 'bh', name_ar: 'البحرين', name_en: 'Bahrain', flag: '🇧🇭' },
  { id: 'om', name_ar: 'عُمان', name_en: 'Oman', flag: '🇴🇲' },
  { id: 'eg', name_ar: 'مصر', name_en: 'Egypt', flag: '🇪🇬' },
  { id: 'jo', name_ar: 'الأردن', name_en: 'Jordan', flag: '🇯🇴' },
];

/** Official websites & metadata for Yemen universities (patched onto the base dataset). */
const YE_META: Record<string, Partial<Uni>> = {
  sanaa: { website: 'https://su.edu.ye', admission: 'https://su.edu.ye/admission', accredited: true, language_ar: 'عربي وإنجليزي', language_en: 'Arabic & English', system_ar: 'فصلي', system_en: 'Semester' },
  ust: { website: 'https://ust.edu', admission: 'https://ust.edu/admission', accredited: true, language_ar: 'عربي وإنجليزي', language_en: 'Arabic & English', system_ar: 'فصلي', system_en: 'Semester' },
  sep21: { website: 'https://21umas.edu.ye', accredited: true, language_ar: 'عربي وإنجليزي', language_en: 'Arabic & English', system_ar: 'فصلي', system_en: 'Semester' },
  amran: { website: 'https://amranuniv.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  dhamar: { website: 'https://tu.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  ibb: { website: 'https://ibbuniv.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  hodeidah: { website: 'https://hoduniv.net.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  'modern-sciences': { website: 'https://msu.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  'queen-arwa': { website: 'https://qau.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  future: { website: 'https://fu.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  alrazi: { website: 'https://alraziuni.edu.ye', accredited: true, language_ar: 'عربي وإنجليزي', language_en: 'Arabic & English', system_ar: 'فصلي', system_en: 'Semester' },
  genius: { website: 'https://gu.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  alnasser: { website: 'https://al-edu.com', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  alsaeeda: { website: 'https://alsaeedah-university.com', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  saba: { website: 'https://saba.edu.ye', accredited: true, language_ar: 'عربي', language_en: 'Arabic', system_ar: 'فصلي', system_en: 'Semester' },
  liu: { website: 'https://liu.edu.lb', accredited: true, language_ar: 'إنجليزي', language_en: 'English', system_ar: 'فصلي / ساعات معتمدة', system_en: 'Semester / Credit hours' },
};

const yeUnis: Uni[] = (yemenData.universities as Uni[]).map((u) => ({ ...u, ...YE_META[u.id] }));
const regionUnis: Uni[] = regionData.universities as Uni[];

export const UNIVERSITIES: Uni[] = [...yeUnis, ...regionUnis];
