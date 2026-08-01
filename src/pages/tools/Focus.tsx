import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CloudRain, Waves, Wind, Flame } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

type Mode = 'focus' | 'short' | 'long';
const DUR: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

// Web-Audio ambient sound synthesis — zero external files
function makeNoise(ctx: AudioContext, type: 'rain' | 'waves' | 'wind' | 'fire') {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'rain') { data[i] = (lastOut + 0.02 * white) / 1.02; lastOut = data[i]; data[i] *= 3.5; }
    else if (type === 'waves' || type === 'wind') { data[i] = (lastOut + 0.015 * white) / 1.015; lastOut = data[i]; data[i] *= 4; }
    else { data[i] = white * 0.3 + (lastOut + 0.05 * white) / 1.05 * 0.7; lastOut = (lastOut + 0.05 * white) / 1.05; }
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = type === 'rain' ? 2600 : type === 'fire' ? 900 : 600;
  const gain = ctx.createGain();
  gain.gain.value = 0.22;
  src.connect(filter).connect(gain).connect(ctx.destination);

  let lfo: OscillatorNode | null = null;
  if (type === 'waves' || type === 'wind') {
    lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = type === 'waves' ? 0.08 : 0.15;
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();
  }
  src.start();
  return () => { src.stop(); lfo?.stop(); };
}

export default function Focus() {
  const { tr } = useLang();
  const [mode, setMode] = useState<Mode>('focus');
  const [left, setLeft] = useState(DUR.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [sound, setSound] = useState<'rain' | 'waves' | 'wind' | 'fire' | null>(null);
  const audioRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1) {
        setRunning(false);
        if (mode === 'focus') setSessions((s) => s + 1);
        try { new AudioContext().resume(); } catch { /* noop */ }
        return 0;
      }
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running, mode]);

  useEffect(() => {
    audioRef.current?.stop();
    audioRef.current?.ctx.close();
    audioRef.current = null;
    if (sound) {
      const ctx = new AudioContext();
      const stop = makeNoise(ctx, sound);
      audioRef.current = { ctx, stop };
    }
    return () => { audioRef.current?.stop(); audioRef.current?.ctx.close(); audioRef.current = null; };
  }, [sound]);

  const switchMode = (m: Mode) => { setMode(m); setLeft(DUR[m]); setRunning(false); };
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const pct = 1 - left / DUR[mode];

  const SOUNDS = [
    { id: 'rain' as const, icon: CloudRain, label: { ar: 'مطر', en: 'Rain' } },
    { id: 'waves' as const, icon: Waves, label: { ar: 'أمواج', en: 'Waves' } },
    { id: 'wind' as const, icon: Wind, label: { ar: 'رياح', en: 'Wind' } },
    { id: 'fire' as const, icon: Flame, label: { ar: 'مدفأة', en: 'Fireplace' } },
  ];

  return (
    <ToolPage id="focus">
      <div className="card !bg-gradient-to-b !from-teal-950 !to-teal-900 !border-teal-900 text-white text-center py-10">
        <div className="flex justify-center gap-2 mb-8">
          {(['focus', 'short', 'long'] as Mode[]).map((m) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${mode === m ? 'bg-amber-400 text-teal-950' : 'bg-white/10 text-teal-100 hover:bg-white/20'}`}>
              {m === 'focus' ? tr({ ar: 'تركيز 25د', en: 'Focus 25m' }) : m === 'short' ? tr({ ar: 'راحة 5د', en: 'Break 5m' }) : tr({ ar: 'راحة 15د', en: 'Break 15m' })}
            </button>
          ))}
        </div>

        <div className="relative w-64 h-64 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 283} 283`} className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-bold tabular-nums" dir="ltr">{mm}:{ss}</span>
            <span className="text-teal-300 text-sm mt-1">{running ? tr({ ar: 'ركّز الآن...', en: 'Stay focused...' }) : left === 0 ? tr({ ar: 'انتهى الوقت!', en: "Time's up!" }) : tr({ ar: 'جاهز؟', en: 'Ready?' })}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => setRunning((r) => !r)} className="w-16 h-16 rounded-full bg-amber-400 text-teal-950 flex items-center justify-center hover:bg-amber-300 active:scale-95 transition-all shadow-xl">
            {running ? <Pause size={26} /> : <Play size={26} className="ms-1" />}
          </button>
          <button onClick={() => switchMode(mode)} className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <RotateCcw size={22} />
          </button>
        </div>

        <p className="text-teal-300 text-sm mt-6">{tr({ ar: `جلسات مكتملة اليوم: ${sessions} 🍅`, en: `Sessions completed: ${sessions} 🍅` })}</p>
      </div>

      <div className="card mt-5">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          {sound ? <Volume2 size={18} className="text-teal-700" /> : <VolumeX size={18} className="text-stone-400" />}
          {tr({ ar: 'أصوات محيطة (مولّدة محلياً)', en: 'Ambient sounds (locally synthesized)' })}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SOUNDS.map((s) => {
            const I = s.icon;
            return (
              <button key={s.id} onClick={() => setSound(sound === s.id ? null : s.id)}
                className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1.5 text-sm font-semibold transition-all ${sound === s.id ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-stone-200 hover:border-teal-400'}`}>
                <I size={22} /> {tr(s.label)}
              </button>
            );
          })}
          <button onClick={() => setSound(null)}
            className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1.5 text-sm font-semibold transition-all ${sound === null ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-stone-200 hover:border-teal-400'}`}>
            <VolumeX size={22} /> {tr({ ar: 'صامت', en: 'Silent' })}
          </button>
        </div>
      </div>
    </ToolPage>
  );
}
