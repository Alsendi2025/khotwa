/** تعريب الرياضيات: تحويل الرموز والأرقام العربية إلى صيغة يفهمها المحرك، والعكس للعرض */

const EASTERN = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';

/** يحوّل المدخلات العربية (س، ص، أرقام مشرقية، × ÷، جا/جتا/ظا، جذر...) إلى تعبير قياسي */
export function normalizeMathInput(raw: string): string {
  let s = raw;

  // الأرقام المشرقية والفارسية → غربية
  for (let i = 0; i < 10; i++) {
    s = s.replaceAll(EASTERN[i], String(i)).replaceAll(PERSIAN[i], String(i));
  }

  // الدوال العربية (قبل استبدال الحروف المفردة)
  s = s
    .replace(/جذر\s*/g, 'sqrt')
    .replace(/جتا/g, 'cos')
    .replace(/جا/g, 'sin')
    .replace(/ظا/g, 'tan')
    .replace(/لوغ|لو/g, 'log')
    .replace(/مطلق/g, 'abs');

  // المتغيرات العربية
  s = s
    .replace(/س/g, 'x')
    .replace(/ص/g, 'y')
    .replace(/ع/g, 'z')
    .replace(/ن/g, 'n');

  // الرموز والعوامل
  s = s
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−|–/g, '-')
    .replace(/،/g, ',')
    .replace(/π|باي/g, 'pi')
    .replace(/θ/g, 'theta')
    .replace(/√/g, 'sqrt')
    .replace(/∞/g, 'Infinity')
    .replace(/\s+/g, ' ')
    .trim();

  // الضرب الضمني: 2x → 2*x ، 3( → 3*( ، )( → )*( ، x( تبقى استدعاء دالة فقط للدوال المعروفة
  s = s
    .replace(/(\d)\s*([a-zA-Z(])/g, '$1*$2')
    .replace(/\)\s*\(/g, ')*(')
    .replace(/\)\s*([a-zA-Z0-9])/g, ')*$1');

  return s;
}

/** يحوّل الأرقام الغربية إلى مشرقية للعرض (عند تفعيل خيار الأرقام العربية) */
export function toEasternDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => EASTERN[+d]);
}

/** يعيد التعبير القياسي إلى شكل عربي للعرض النصي (x→س ...) */
export function toArabicExpr(expr: string): string {
  return expr
    .replace(/\bsqrt\b/g, 'جذر')
    .replace(/\bsin\b/g, 'جا')
    .replace(/\bcos\b/g, 'جتا')
    .replace(/\btan\b/g, 'ظا')
    .replace(/\bpi\b/g, 'π')
    .replace(/x/g, 'س')
    .replace(/y/g, 'ص')
    .replace(/z/g, 'ع')
    .replace(/\*/g, '×');
}

/** هل المدخل معادلة (يحوي =)؟ يعيد الطرفين */
export function splitEquation(s: string): { lhs: string; rhs: string } | null {
  const idx = s.indexOf('=');
  if (idx < 0) return null;
  return { lhs: s.slice(0, idx).trim(), rhs: s.slice(idx + 1).trim() };
}
