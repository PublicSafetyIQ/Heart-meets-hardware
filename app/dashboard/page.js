'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '../../lib/supabase';

const PIN = 'AZFC2026';
const DISC_COLORS = { D: '#B91C1C', I: '#C9A23E', S: '#1E3A8A', C: '#aaaaaa' };
const WORD_COLORS = ['#C9A23E', '#B91C1C', '#4A90D9', '#7ED07E', '#F5EDD6', '#3DAA6E', '#A78BFA'];

const POLL_QUESTIONS = [
  { id: 'poll_1', label: 'AI in your daily work?', options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_2', label: 'AI for boots on the ground?', options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_3', label: 'Feel prepared to use AI?', options: ['Yes', 'Somewhat', 'No'] },
  { id: 'poll_4', label: 'Provided AI training for workforce?', options: ['Yes', 'No', 'Working on it'] },
];

const OPTION_COLORS = {
  'Yes': '#C9A23E',
  'No': '#B91C1C',
  'Not sure': '#4A90D9',
  'Somewhat': '#3DAA6E',
  'Working on it': '#3DAA6E',
};

function DashboardContent() {
  const params = useSearchParams();
  const autoKey = params.get('key');
  const [unlocked, setUnlocked] = useState(autoKey === PIN);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState('disc');
  const [discData, setDiscData] = useState([]);
  const [pollData, setPollData] = useState([]);
  const [brainstormData, setBrainstormData] = useState([]);

  useEffect(() => {
    if (!unlocked) return;
    supabase.from('disc_responses').select('*').then(({ data }) => { if (data) setDiscData(data); });
    supabase.from('poll_responses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) {
        setPollData(data.filter(r => r.poll_id !== 'brainstorm'));
        setBrainstormData(data.filter(r => r.poll_id === 'brainstorm'));
      }
    });
    const discSub = supabase.channel('disc-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'disc_responses' }, payload => {
        setDiscData(prev => [...prev, payload.new]);
      }).subscribe();
    const pollSub = supabase.channel('poll-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_responses' }, payload => {
        if (payload.new.poll_id === 'brainstorm') {
          setBrainstormData(prev => [payload.new, ...prev]);
        } else {
          setPollData(prev => [...prev, payload.new]);
        }
      }).subscribe();
    return () => { supabase.removeChannel(discSub); supabase.removeChannel(pollSub); };
  }, [unlocked]);

  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{background:'#0a0a0a'}}>
        <h1 className="font-serif text-3xl text-hmh-cream mb-2">Dashboard</h1>
        <p className="text-hmh-cream-dim text-sm mb-8">Enter PIN to continue</p>
        <input type="text" value={pin} onChange={e => setPin(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter') { if (pin === PIN) setUnlocked(true); else setPinError(true); }}}
          placeholder="ENTER PIN" maxLength={10}
          className="text-center text-2xl tracking-widest bg-transparent border-b-2 border-hmh-gold text-hmh-cream w-48 pb-2 mb-4 outline-none" />
        {pinError && <p className="text-hmh-red text-sm">Incorrect PIN</p>}
        <button onClick={() => { if (pin === PIN) setUnlocked(true); else setPinError(true); }}
          className="mt-4 bg-hmh-gold text-hmh-black px-8 py-3 rounded-lg font-bold">Unlock</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{background:'#0a0a0a'}}>
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <h1 className="font-serif text-2xl text-hmh-cream">Live Dashboard</h1>
        <span className="text-xs text-hmh-gold tracking-widest uppercase">{discData.length} responses</span>
      </div>
      <div className="flex border-b border-hmh-gray mx-6 mb-6">
        {[['disc','DiSC Wheel'],['polls','Poll Results'],['brainstorm','Brainstorm']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-3 text-sm font-semibold mr-2 border-b-2 transition-colors ${tab===key ? 'border-hmh-gold text-hmh-gold' : 'border-transparent text-hmh-cream-dim'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 px-6 pb-10">
        {tab === 'disc' && <DiscWheel data={discData} />}
        {tab === 'polls' && <PollResults data={pollData} />}
        {tab === 'brainstorm' && <BrainstormView data={brainstormData} />}
      </div>
    </main>
  );
}

function PieChart({ slices, size = 130 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 4, ri = R * 0.42;
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={R} fill="#333"/>
      <circle cx={cx} cy={cy} r={ri} fill="#1a1a1a"/>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="10">No data</text>
    </svg>
  );

  let angle = -Math.PI / 2;
  const paths = [];
  const labels = [];

  slices.forEach(({ label, value, color }, i) => {
    const slice = (value / total) * Math.PI * 2;
    const mid = angle + slice / 2;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    angle += slice;
    const x2 = cx + R * Math.cos(angle), y2 = cy + R * Math.sin(angle);
    const large = slice > Math.PI ? 1 : 0;
    const pct = Math.round((value / total) * 100);

    paths.push(
      <path key={i} d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z`} fill={color}/>
    );

    if (pct >= 10) {
      const lr = R * 0.68;
      const lx = cx + lr * Math.cos(mid);
      const ly = cy + lr * Math.sin(mid);
      labels.push(
        <text key={`l${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="9.5" fontWeight="bold">{pct}%</text>
      );
    }
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <circle cx={cx} cy={cy} r={ri} fill="#1a1a1a"/>
      {labels}
    </svg>
  );
}

function PollResults({ data }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {POLL_QUESTIONS.map(q => {
        const qData = data.filter(r => r.poll_id === q.id);
        const total = qData.length;
        const tally = {};
        q.options.forEach(o => tally[o] = 0);
        qData.forEach(r => { if (tally[r.answer] !== undefined) tally[r.answer]++; });

        const slices = q.options.map(opt => ({
          label: opt,
          value: tally[opt] || 0,
          color: OPTION_COLORS[opt] || '#888',
        }));

        return (
          <div key={q.id} style={{background:'#1a1a1a'}} className="rounded-xl p-4 flex flex-col items-center">
            <p className="text-hmh-gold text-xs font-semibold text-center mb-3 leading-tight">{q.label}</p>
            <PieChart slices={slices} size={130} />
            <div className="mt-3 w-full space-y-1">
              {q.options.map(opt => (
                <div key={opt} className="flex items-center gap-2 text-xs" style={{color:'#ccc'}}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: OPTION_COLORS[opt] || '#888'}}/>
                  <span>{opt}</span>
                  <span className="ml-auto text-hmh-cream-dim">{tally[opt] || 0}</span>
                </div>
              ))}
            </div>
            <p className="text-hmh-cream-dim text-xs mt-2">{total} response{total !== 1 ? 's' : ''}</p>
          </div>
        );
      })}
    </div>
  );
}

function DiscWheel({ data }) {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  data.forEach(r => { if (r.primary_type && counts[r.primary_type] !== undefined) counts[r.primary_type]++; });
  const total = data.length;

  const getDotPosition = (type, index) => {
    const quadrants = { D: { cx: 33, cy: 33 }, I: { cx: 67, cy: 33 }, S: { cx: 67, cy: 67 }, C: { cx: 33, cy: 67 } };
    const base = quadrants[type] || { cx: 50, cy: 50 };
    const angle = (index * 137.5) % 360;
    const radius = (index % 5) * 3;
    const x = base.cx + radius * Math.cos((angle * Math.PI) / 180);
    const y = base.cy + radius * Math.sin((angle * Math.PI) / 180);
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  const typeIndices = { D: 0, I: 0, S: 0, C: 0 };
  const dots = data.map((r, i) => {
    const type = r.primary_type;
    if (!type || typeIndices[type] === undefined) return null;
    const idx = typeIndices[type]++;
    const pos = getDotPosition(type, idx);
    return { key: i, cx: pos.x, cy: pos.y, fill: DISC_COLORS[type] || '#888' };
  }).filter(Boolean);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-xs mx-auto mb-6" style={{aspectRatio:'1'}}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50,50 L2,50 A48,48 0 0,1 50,2 Z" fill="#B91C1C" opacity="0.25"/>
          <path d="M50,50 L50,2 A48,48 0 0,1 98,50 Z" fill="#C9A23E" opacity="0.25"/>
          <path d="M50,50 L98,50 A48,48 0 0,1 50,98 Z" fill="#1E3A8A" opacity="0.3"/>
          <path d="M50,50 L50,98 A48,48 0 0,1 2,50 Z" fill="#888888" opacity="0.15"/>
          <circle cx="50" cy="50" r="48" fill="none" stroke="#444" strokeWidth="0.5"/>
          <line x1="50" y1="2" x2="50" y2="98" stroke="#444" strokeWidth="0.5"/>
          <line x1="2" y1="50" x2="98" y2="50" stroke="#444" strokeWidth="0.5"/>
          {dots.map(d => (
            <circle key={d.key} cx={d.cx} cy={d.cy} r="2.8" fill={d.fill} opacity="0.9" stroke="#000" strokeWidth="0.4"/>
          ))}
          <circle cx="21" cy="21" r="6" fill="#0a0a0a" opacity="0.8"/>
          <text x="21" y="21" textAnchor="middle" dominantBaseline="middle" fill="#B91C1C" fontSize="9" fontWeight="bold">D</text>
          <circle cx="79" cy="21" r="6" fill="#0a0a0a" opacity="0.8"/>
          <text x="79" y="21" textAnchor="middle" dominantBaseline="middle" fill="#C9A23E" fontSize="9" fontWeight="bold">I</text>
          <circle cx="79" cy="79" r="6" fill="#0a0a0a" opacity="0.8"/>
          <text x="79" y="79" textAnchor="middle" dominantBaseline="middle" fill="#4A7DD9" fontSize="9" fontWeight="bold">S</text>
          <circle cx="21" cy="79" r="6" fill="#0a0a0a" opacity="0.8"/>
          <text x="21" y="79" textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize="9" fontWeight="bold">C</text>
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
        {['D','I','S','C'].map(type => (
          <div key={type} className="text-center bg-hmh-gray rounded-lg py-3">
            <div className="text-3xl font-bold font-serif" style={{color: DISC_COLORS[type]}}>{counts[type]}</div>
            <div className="text-xs font-bold mt-1" style={{color: DISC_COLORS[type]}}>{type}</div>
            <div className="text-xs text-hmh-cream-dim">{total ? Math.round(counts[type]/total*100) : 0}%</div>
          </div>
        ))}
      </div>
      {total === 0 && <p className="text-hmh-cream-dim text-sm mt-8 text-center">Waiting for responses...</p>}
    </div>
  );
}

function BrainstormView({ data }) {
  const wordFreq = {};
  data.forEach(r => {
    if (!r.answer) return;
    r.answer.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['that','this','with','they','have','from','what','your','just','will','been','were','when','there','their','about','would','also','more','very','some','into','than'].includes(w))
      .forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  });

  const words = Object.entries(wordFreq).sort((a,b) => b[1]-a[1]).slice(0, 35);
  const maxFreq = words[0]?.[1] || 1;

  return (
    <div>
      {words.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-3 justify-center mb-8 p-5 rounded-xl" style={{background:'#111'}}>
            {words.map(([word, freq], i) => {
              const size = 13 + Math.round((freq / maxFreq) * 26);
              const opacity = 0.55 + (freq / maxFreq) * 0.45;
              const color = WORD_COLORS[i % WORD_COLORS.length];
              return (
                <span key={word} style={{fontSize:`${size}px`, opacity, color, lineHeight:1.5, fontWeight: freq > 1 ? 'bold' : 'normal'}}>
                  {word}
                </span>
              );
            })}
          </div>
          <p className="text-hmh-cream-dim text-xs mb-4 text-center">{data.length} response{data.length !== 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {data.map((r, i) => (
              <div key={i} className="bg-hmh-gray rounded-lg p-3">
                <p className="text-hmh-cream text-sm leading-relaxed">{r.answer}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-hmh-cream-dim text-sm text-center pt-8">Waiting for brainstorm responses...</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center" style={{background:'#0a0a0a'}}><p className="text-hmh-cream-dim">Loading dashboard...</p></main>}>
      <DashboardContent />
    </Suspense>
  );
}
