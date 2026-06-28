'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getDotPosition } from '../../lib/disc-data';

const PIN = 'AZFC2026';

export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin]           = useState('');
  const [pinError, setPinError] = useState(false);
  const [responses, setResponses] = useState([]);
  const [painPoints, setPainPoints] = useState([]);
  const [tab, setTab] = useState('disc'); // 'disc' | 'stats' | 'pain'

  function handleUnlock() {
    if (pin === PIN) {
      setUnlocked(true);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  }

  useEffect(() => {
    if (!unlocked) return;

    // Load existing responses
    supabase.from('disc_responses').select('*').then(({ data }) => {
      if (data) setResponses(data);
    });

    supabase
      .from('poll_responses')
      .select('*')
      .eq('poll_id', 'pain_points')
      .then(({ data }) => {
        if (data) setPainPoints(data.map((r) => r.answer));
      });

    // Real-time subscription for DiSC responses
    const discChannel = supabase
      .channel('disc-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'disc_responses' },
        (payload) => setResponses((prev) => [...prev, payload.new])
      )
      .subscribe();

    // Real-time subscription for pain points
    const painChannel = supabase
      .channel('pain-live')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'poll_responses',
        filter: 'poll_id=eq.pain_points',
      },
        (payload) => setPainPoints((prev) => [...prev, payload.new.answer])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(discChannel);
      supabase.removeChannel(painChannel);
    };
  }, [unlocked]);

  // Aggregate counts
  const counts = responses.reduce(
    (acc, r) => ({ ...acc, [r.primary_type]: (acc[r.primary_type] || 0) + 1 }),
    { D: 0, I: 0, S: 0, C: 0 }
  );
  const total = responses.length;

  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-hmh-gold text-xs tracking-widest uppercase mb-6">Presenter Access</p>
        <h1 className="font-serif text-3xl text-hmh-cream mb-8">Dashboard</h1>
        <div className="w-full max-w-xs space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter PIN"
            className={`w-full bg-hmh-gray border text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-center text-lg tracking-widest focus:outline-none
              ${pinError ? 'border-hmh-red' : 'border-hmh-gray-light focus:border-hmh-gold'}`}
          />
          {pinError && <p className="text-hmh-red text-sm text-center">Incorrect PIN</p>}
          <button
            onClick={handleUnlock}
            className="w-full py-4 rounded-lg font-bold bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light"
          >
            Enter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-hmh-black px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-hmh-cream">Presenter Dashboard</h1>
          <p className="text-hmh-cream-dim text-xs mt-0.5">Heart Meets Hardware · AZFC 2026</p>
        </div>
        <div className="text-right">
          <p className="text-hmh-gold text-3xl font-bold">{total}</p>
          <p className="text-hmh-cream-dim text-xs">responded</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg overflow-hidden border border-hmh-gray-light mb-6">
        {[['disc', 'DiSC Wheel'], ['pain', 'Pain Points']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors
              ${tab === id ? 'bg-hmh-gold text-hmh-black' : 'bg-hmh-gray text-hmh-cream-dim'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── DiSC WHEEL TAB ── */}
      {tab === 'disc' && (
        <>
          {/* Type counts */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { label: 'D', color: '#B91C1C' },
              { label: 'I', color: '#C9A23E' },
              { label: 'S', color: '#1E3A8A' },
              { label: 'C', color: '#F5EDD6' },
            ].map(({ label, color }) => (
              <div key={label} className="bg-hmh-gray rounded-lg py-3 text-center">
                <p className="text-2xl font-bold" style={{ color }}>{counts[label] || 0}</p>
                <p className="text-hmh-cream-dim text-xs mt-1">{label}</p>
                {total > 0 && (
                  <p className="text-hmh-cream-dim text-xs">
                    {Math.round(((counts[label] || 0) / total) * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* DiSC Wheel SVG */}
          <div className="bg-hmh-gray rounded-xl p-4">
            <DiscWheel responses={responses} />
          </div>

          {total === 0 && (
            <p className="text-center text-hmh-cream-dim text-sm mt-6">
              Waiting for responses...
            </p>
          )}
        </>
      )}

      {/* ── PAIN POINTS TAB ── */}
      {tab === 'pain' && (
        <div>
          <p className="text-hmh-gold text-xs tracking-widest uppercase mb-4">
            {painPoints.length} response{painPoints.length !== 1 ? 's' : ''}
          </p>
          {painPoints.length === 0 ? (
            <p className="text-hmh-cream-dim text-sm text-center mt-10">
              Waiting for responses...
            </p>
          ) : (
            <div className="space-y-3">
              {painPoints.map((text, i) => (
                <div key={i} className="bg-hmh-gray rounded-lg px-4 py-3">
                  <p className="text-hmh-cream text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

// ── DiSC WHEEL COMPONENT ──────────────────────────────────────────────────────

function DiscWheel({ responses }) {
  const cx = 200;
  const cy = 200;
  const r  = 165;

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto block">
      {/* Background */}
      <circle cx={cx} cy={cy} r={r + 10} fill="#1A1A1A" />

      {/* Quadrant fills */}
      <path d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r},${cy} Z`} fill="#B91C1C" opacity="0.08" />
      <path d={`M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 0,1 ${cx},${cy + r} Z`} fill="#C9A23E" opacity="0.08" />
      <path d={`M${cx},${cy} L${cx},${cy + r} A${r},${r} 0 0,1 ${cx - r},${cy} Z`} fill="#1E3A8A" opacity="0.08" />
      <path d={`M${cx},${cy} L${cx - r},${cy} A${r},${r} 0 0,1 ${cx},${cy - r} Z`} fill="#F5EDD6" opacity="0.05" />

      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C9A23E" strokeWidth="1" opacity="0.4" />

      {/* Axis lines */}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#333" strokeWidth="1" />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#333" strokeWidth="1" />

      {/* Type labels */}
      <text x={cx - r / 2} y={cy - r / 2 + 8} textAnchor="middle" fill="#B91C1C" fontSize="28" fontWeight="bold" opacity="0.7">D</text>
      <text x={cx + r / 2} y={cy - r / 2 + 8} textAnchor="middle" fill="#C9A23E" fontSize="28" fontWeight="bold" opacity="0.7">I</text>
      <text x={cx + r / 2} y={cy + r / 2 + 8} textAnchor="middle" fill="#1E3A8A" fontSize="28" fontWeight="bold" opacity="0.9">S</text>
      <text x={cx - r / 2} y={cy + r / 2 + 8} textAnchor="middle" fill="#F5EDD6" fontSize="28" fontWeight="bold" opacity="0.5">C</text>

      {/* Dots for each response */}
      {responses.map((resp, i) => {
        const scores = { d: resp.d_score, i: resp.i_score, s: resp.s_score, c: resp.c_score };
        const pos = getDotPosition(scores, cx, cy, r);
        const typeColors = { D: '#B91C1C', I: '#C9A23E', S: '#4A7FD4', C: '#D4C5A9' };
        const color = typeColors[resp.primary_type] || '#C9A23E';
        return (
          <circle
            key={resp.id || i}
            cx={pos.x}
            cy={pos.y}
            r="8"
            fill={color}
            stroke="#0D0D0D"
            strokeWidth="1.5"
            opacity="0.85"
          />
        );
      })}
    </svg>
  );
}
