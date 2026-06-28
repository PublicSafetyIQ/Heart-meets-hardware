'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getDotPosition } from '../../lib/disc-data';

const PIN = 'AZFC2026';

const POLL_QUESTIONS = [
  { id: 'poll_1', label: 'Do you see a role for AI in your daily work?',                       options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_2', label: 'Do you see a role for AI in the work of boots on the ground?',       options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_3', label: 'Do you feel prepared to use AI at work?',                            options: ['Yes', 'Somewhat', 'No'] },
  { id: 'poll_4', label: 'Have you provided AI training for your workforce?',                   options: ['Yes', 'No', 'Working on it'] },
];

const STOP_WORDS = new Set(['the','and','a','an','to','of','in','is','it','for','on','at','i','my','we','our','with','are','be','this','that','have','not','from','but','or','as','by','so','do','they','their','what','when','how','all','no','can','if','just','more','get','has','was','been','will','need','dont','cant','dont','its','very','too','also','about','up','out','like','time','right','know','think']);

export default function DashboardPage() {
  const [unlocked, setUnlocked]   = useState(false);
  const [pin, setPin]             = useState('');
  const [pinError, setPinError]   = useState(false);
  const [tab, setTab]             = useState('disc');

  // DiSC data
  const [responses, setResponses] = useState([]);

  // Poll data: { poll_1: { Yes: 3, No: 1 }, poll_2: {...}, ... }
  const [pollData, setPollData]   = useState({ poll_1: {}, poll_2: {}, poll_3: {}, poll_4: {} });

  // Brainstorm data
  const [brainstorm, setBrainstorm] = useState([]);

  function handleUnlock() {
    if (pin === PIN) { setUnlocked(true); }
    else { setPinError(true); setTimeout(() => setPinError(false), 2000); }
  }

  useEffect(() => {
    if (!unlocked) return;

    // Load DiSC responses
    supabase.from('disc_responses').select('*').then(({ data }) => { if (data) setResponses(data); });

    // Load poll responses
    supabase.from('poll_responses')
      .select('*')
      .in('poll_id', ['poll_1','poll_2','poll_3','poll_4'])
      .then(({ data }) => {
        if (!data) return;
        const agg = { poll_1: {}, poll_2: {}, poll_3: {}, poll_4: {} };
        data.forEach(({ poll_id, answer }) => {
          if (!agg[poll_id]) return;
          agg[poll_id][answer] = (agg[poll_id][answer] || 0) + 1;
        });
        setPollData(agg);
      });

    // Load brainstorm
    supabase.from('poll_responses').select('*').eq('poll_id', 'brainstorm').then(({ data }) => {
      if (data) setBrainstorm(data.map((r) => r.answer));
    });

    // Real-time: DiSC
    const discCh = supabase.channel('disc-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'disc_responses' },
        (p) => setResponses((prev) => [...prev, p.new]))
      .subscribe();

    // Real-time: polls
    const pollCh = supabase.channel('poll-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_responses' },
        (p) => {
          const { poll_id, answer } = p.new;
          if (['poll_1','poll_2','poll_3','poll_4'].includes(poll_id)) {
            setPollData((prev) => ({
              ...prev,
              [poll_id]: { ...prev[poll_id], [answer]: (prev[poll_id][answer] || 0) + 1 },
            }));
          }
          if (poll_id === 'brainstorm') {
            setBrainstorm((prev) => [...prev, answer]);
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(discCh); supabase.removeChannel(pollCh); };
  }, [unlocked]);

  const discCounts = responses.reduce(
    (acc, r) => ({ ...acc, [r.primary_type]: (acc[r.primary_type] || 0) + 1 }),
    { D: 0, I: 0, S: 0, C: 0 }
  );
  const discTotal = responses.length;

  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-hmh-black">
        <p className="text-hmh-gold text-xs tracking-widest uppercase mb-6">Presenter Access</p>
        <h1 className="font-serif text-3xl text-hmh-cream mb-8">Dashboard</h1>
        <div className="w-full max-w-xs space-y-4">
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} placeholder="Enter PIN"
            className={`w-full bg-hmh-gray border text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-center text-lg tracking-widest focus:outline-none ${pinError ? 'border-red-600' : 'border-hmh-gray-light focus:border-hmh-gold'}`} />
          {pinError && <p className="text-red-500 text-sm text-center">Incorrect PIN</p>}
          <button onClick={handleUnlock} className="w-full py-4 rounded-lg font-bold bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light">Enter</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-hmh-black px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-hmh-cream">Live Dashboard</h1>
          <p className="text-hmh-cream-dim text-xs mt-0.5">Heart Meets Hardware · AZFC 2026</p>
        </div>
        <div className="text-right">
          <p className="text-hmh-gold text-3xl font-bold">{discTotal}</p>
          <p className="text-hmh-cream-dim text-xs">assessments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-hmh-gray-light mb-6">
        {[['disc','DiSC Wheel'],['polls','Poll Results'],['brainstorm','Brainstorm']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === id ? 'bg-hmh-gold text-hmh-black' : 'bg-hmh-gray text-hmh-cream-dim'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* DiSC WHEEL */}
      {tab === 'disc' && (
        <>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[{label:'D',color:'#B91C1C'},{label:'I',color:'#C9A23E'},{label:'S',color:'#1E3A8A'},{label:'C',color:'#F5EDD6'}].map(({ label, color }) => (
              <div key={label} className="bg-hmh-gray rounded-lg py-3 text-center">
                <p className="text-2xl font-bold" style={{ color }}>{discCounts[label] || 0}</p>
                <p className="text-hmh-cream-dim text-xs mt-1">{label}</p>
                {discTotal > 0 && <p className="text-hmh-cream-dim text-xs">{Math.round(((discCounts[label] || 0) / discTotal) * 100)}%</p>}
              </div>
            ))}
          </div>
          <div className="bg-hmh-gray rounded-xl p-4">
            <DiscWheel responses={responses} />
          </div>
          {discTotal === 0 && <p className="text-center text-hmh-cream-dim text-sm mt-6">Waiting for responses...</p>}
        </>
      )}

      {/* POLL RESULTS */}
      {tab === 'polls' && (
        <div className="space-y-6">
          {POLL_QUESTIONS.map((q) => {
            const data = pollData[q.id] || {};
            const qTotal = Object.values(data).reduce((a, b) => a + b, 0);
            return (
              <div key={q.id} className="bg-hmh-gray rounded-xl p-5">
                <p className="text-hmh-cream font-semibold text-base mb-4 leading-snug">{q.label}</p>
                {qTotal === 0 ? (
                  <p className="text-hmh-cream-dim text-sm">No responses yet</p>
                ) : (
                  <div className="space-y-3">
                    {q.options.map((opt) => {
                      const count = data[opt] || 0;
                      const pct   = qTotal > 0 ? Math.round((count / qTotal) * 100) : 0;
                      return (
                        <div key={opt}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-hmh-cream">{opt}</span>
                            <span className="text-hmh-gold font-bold">{pct}% <span className="text-hmh-cream-dim font-normal">({count})</span></span>
                          </div>
                          <div className="w-full h-3 bg-hmh-gray-light rounded-full overflow-hidden">
                            <div className="h-full bg-hmh-gold rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-hmh-cream-dim text-xs mt-1">{qTotal} response{qTotal !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BRAINSTORM */}
      {tab === 'brainstorm' && (
        <div>
          <p className="text-hmh-gold text-xs tracking-widest uppercase mb-4">{brainstorm.length} response{brainstorm.length !== 1 ? 's' : ''}</p>
          {brainstorm.length === 0 ? (
            <p className="text-hmh-cream-dim text-sm text-center mt-10">Waiting for responses...</p>
          ) : (
            <>
              <WordCloud texts={brainstorm} />
              <div className="mt-6 space-y-3">
                {[...brainstorm].reverse().map((text, i) => (
                  <div key={i} className="bg-hmh-gray rounded-lg px-4 py-3">
                    <p className="text-hmh-cream text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}

// DISC WHEEL
function DiscWheel({ responses }) {
  const cx = 200, cy = 200, r = 165;
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto block">
      <circle cx={cx} cy={cy} r={r + 10} fill="#1A1A1A" />
      <path d={`M${cx},${cy} L${cx},${cy-r} A${r},${r} 0 0,1 ${cx+r},${cy} Z`} fill="#B91C1C" opacity="0.08" />
      <path d={`M${cx},${cy} L${cx+r},${cy} A${r},${r} 0 0,1 ${cx},${cy+r} Z`} fill="#C9A23E" opacity="0.08" />
      <path d={`M${cx},${cy} L${cx},${cy+r} A${r},${r} 0 0,1 ${cx-r},${cy} Z`} fill="#1E3A8A" opacity="0.08" />
      <path d={`M${cx},${cy} L${cx-r},${cy} A${r},${r} 0 0,1 ${cx},${cy-r} Z`} fill="#F5EDD6" opacity="0.05" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C9A23E" strokeWidth="1" opacity="0.4" />
      <line x1={cx} y1={cy-r} x2={cx} y2={cy+r} stroke="#333" strokeWidth="1" />
      <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#333" strokeWidth="1" />
      <text x={cx-r/2} y={cy-r/2+8} textAnchor="middle" fill="#B91C1C" fontSize="28" fontWeight="bold" opacity="0.7">D</text>
      <text x={cx+r/2} y={cy-r/2+8} textAnchor="middle" fill="#C9A23E" fontSize="28" fontWeight="bold" opacity="0.7">I</text>
      <text x={cx+r/2} y={cy+r/2+8} textAnchor="middle" fill="#1E3A8A" fontSize="28" fontWeight="bold" opacity="0.9">S</text>
      <text x={cx-r/2} y={cy+r/2+8} textAnchor="middle" fill="#F5EDD6" fontSize="28" fontWeight="bold" opacity="0.5">C</text>
      {responses.map((resp, i) => {
        const scores = { d: resp.d_score, i: resp.i_score, s: resp.s_score, c: resp.c_score };
        const pos = getDotPosition(scores, cx, cy, r);
        const color = {D:'#B91C1C',I:'#C9A23E',S:'#4A7FD4',C:'#D4C5A9'}[resp.primary_type] || '#C9A23E';
        return <circle key={resp.id||i} cx={pos.x} cy={pos.y} r="8" fill={color} stroke="#0D0D0D" strokeWidth="1.5" opacity="0.85" />;
      })}
    </svg>
  );
}

// WORD CLOUD
function WordCloud({ texts }) {
  const allWords = texts.join(' ').toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const freq = {};
  allWords.forEach((w) => { if (w.length > 3 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 40);
  if (sorted.length === 0) return null;
  const max = sorted[0][1];
  const colors = ['#C9A23E','#F5EDD6','#B91C1C','#4A7FD4','#C9A23E','#F5EDD6'];
  return (
    <div className="bg-hmh-gray rounded-xl p-6 flex flex-wrap gap-3 justify-center items-center min-h-40">
      {sorted.map(([word, count], i) => {
        const size = 14 + Math.round((count / max) * 28);
        return (
          <span key={word} style={{ fontSize: `${size}px`, color: colors[i % colors.length], lineHeight: 1.3, transition: 'all 0.5s' }}>
            {word}
          </span>
        );
      })}
    </div>
  );
}
