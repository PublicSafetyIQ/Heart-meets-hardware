'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '../../../lib/supabase';

const PIN = 'AZFC2026';

const DISC_COLORS = { D: '#B91C1C', I: '#C9A23E', S: '#1E3A8A', C: '#F5EDD6' };

const POLL_QUESTIONS = [
  { id: 'poll_1', label: 'AI in your daily work?', options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_2', label: 'AI for boots on the ground?', options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_3', label: 'Feel prepared to use AI?', options: ['Yes', 'Somewhat', 'No'] },
  { id: 'poll_4', label: 'Provided AI training for workforce?', options: ['Yes', 'No', 'Working on it'] },
];

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
        <input
          type="text" value={pin} onChange={e => setPin(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter') { if (pin === PIN) setUnlocked(true); else setPinError(true); }}}
          placeholder="ENTER PIN" maxLength={10}
          className="text-center text-2xl tracking-widest bg-transparent border-b-2 border-hmh-gold text-hmh-cream w-48 pb-2 mb-4 outline-none"
        />
        {pinError && <p className="text-hmh-red text-sm">Incorrect PIN</p>}
        <button onClick={() => { if (pin === PIN) setUnlocked(true); else setPinError(true); }}
          className="mt-4 bg-hmh-gold text-hmh-black px-8 py-3 rounded-lg font-bold">
          Unlock
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{background:'#0a0a0a'}}>
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <h1 className="font-serif text-2xl text-hmh-cream">Live Dashboard</h1>
        <span className="text-xs text-hmh-gold tracking-widest uppercase">{discData.length} responses</span>
      </div>

      {/* Tabs */}
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

function DiscWheel({ data }) {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  data.forEach(r => { if (r.primary_type && counts[r.primary_type] !== undefined) counts[r.primary_type]++; });
  const total = data.length;

  // Place dots on wheel based on primary type quadrant + slight randomness
  const getDotPosition = (type, index) => {
    const quadrants = {
      D: { cx: 65, cy: 30 },
      I: { cx: 70, cy: 68 },
      S: { cx: 32, cy: 70 },
      C: { cx: 28, cy: 30 },
    };
    const base = quadrants[type] || { cx: 50, cy: 50 };
    // deterministic spread based on index
    const spread = 12;
    const angle = (index * 137.5) % 360;
    const radius = (index % 3) * (spread / 3);
    const x = base.cx + radius * Math.cos((angle * Math.PI) / 180);
    const y = base.cy + radius * Math.sin((angle * Math.PI) / 180);
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const typeIndices = { D: 0, I: 0, S: 0, C: 0 };

  return (
    <div className="flex flex-col items-center">
      {/* Wheel */}
      <div className="relative w-full max-w-sm mx-auto mb-8" style={{aspectRatio:'1'}}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Quadrant backgrounds */}
          <path d="M50,50 L50,2 A48,48 0 0,1 98,50 Z" fill="#B91C1C" opacity="0.15"/>
          <path d="M50,50 L98,50 A48,48 0 0,1 50,98 Z" fill="#C9A23E" opacity="0.15"/>
          <path d="M50,50 L50,98 A48,48 0 0,1 2,50 Z" fill="#1E3A8A" opacity="0.2"/>
          <path d="M50,50 L2,50 A48,48 0 0,1 50,2 Z" fill="#F5EDD6" opacity="0.07"/>
          {/* Circle outline */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="#333" strokeWidth="0.5"/>
          {/* Axis lines */}
          <line x1="50" y1="2" x2="50" y2="98" stroke="#333" strokeWidth="0.5"/>
          <line x1="2" y1="50" x2="98" y2="50" stroke="#333" strokeWidth="0.5"/>
          {/* Labels */}
          <text x="50" y="8" textAnchor="middle" fill="#B91C1C" fontSize="5" fontWeight="bold">D</text>
          <text x="93" y="53" textAnchor="middle" fill="#C9A23E" fontSize="5" fontWeight="bold">I</text>
          <text x="50" y="97" textAnchor="middle" fill="#1E3A8A" fontSize="5" fontWeight="bold">S</text>
          <text x="7" y="53" textAnchor="middle" fill="#aaa" fontSize="5" fontWeight="bold">C</text>
          {/* Dots */}
          {data.map((r, i) => {
            const type = r.primary_type;
            if (!type || !typeIndices[type] !== undefined) return null;
            const idx = typeIndices[type] !== undefined ? typeIndices[type]++ : 0;
            const pos = getDotPosition(type, idx);
            return (
              <circle key={i} cx={pos.x} cy={pos.y} r="2.5"
                fill={DISC_COLORS[type] || '#888'} opacity="0.85" stroke="#000" strokeWidth="0.3"/>
            );
          })}
        </svg>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-4 gap-4 w-full max-w-sm">
        {Object.entries(counts).map(([type, count]) => (
          <div key={type} className="text-center bg-hmh-gray rounded-lg py-4">
            <div className="text-3xl font-bold font-serif" style={{color: DISC_COLORS[type]}}>{count}</div>
            <div className="text-xs text-hmh-cream-dim mt-1">{type}</div>
            <div className="text-xs text-hmh-cream-dim">{total ? Math.round(count/total*100) : 0}%</div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="text-hmh-cream-dim text-sm mt-8 text-center">Waiting for responses...</p>
      )}
    </div>
  );
}

function PollResults({ data }) {
  return (
    <div className="space-y-8">
      {POLL_QUESTIONS.map(q => {
        const qData = data.filter(r => r.poll_id === q.id);
        const total = qData.length;
        const tally = {};
        q.options.forEach(o => tally[o] = 0);
        qData.forEach(r => { if (tally[r.answer] !== undefined) tally[r.answer]++; });

        return (
          <div key={q.id}>
            <p className="text-hmh-cream text-sm font-semibold mb-3">{q.label}</p>
            <p className="text-hmh-cream-dim text-xs mb-3">{total} response{total !== 1 ? 's' : ''}</p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const count = tally[opt] || 0;
                const pct = total ? Math.round(count / total * 100) : 0;
                return (
                  <div key={opt}>
                    <div className="flex justify-between text-xs text-hmh-cream-dim mb-1">
                      <span>{opt}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-6 bg-hmh-gray rounded overflow-hidden">
                      <div className="h-full bg-hmh-gold rounded transition-all duration-700"
                        style={{width:`${pct}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {data.length === 0 && <p className="text-hmh-cream-dim text-sm text-center pt-8">Waiting for poll responses...</p>}
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
      .filter(w => w.length > 3 && !['that','this','with','they','have','from','what','your','just','will','been','were','when','there','their','about','would'].includes(w))
      .forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  });

  const words = Object.entries(wordFreq).sort((a,b) => b[1]-a[1]).slice(0, 30);
  const maxFreq = words[0]?.[1] || 1;

  return (
    <div>
      {words.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 justify-center mb-8 p-4 bg-hmh-gray rounded-xl">
            {words.map(([word, freq]) => {
              const size = 12 + Math.round((freq / maxFreq) * 24);
              const opacity = 0.5 + (freq / maxFreq) * 0.5;
              return (
                <span key={word} style={{fontSize:`${size}px`, opacity, color:'#C9A23E', lineHeight:1.4}}>
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
