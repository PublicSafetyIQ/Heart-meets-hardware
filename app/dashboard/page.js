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
  'Yes': '#C9A23E', 'No': '#B91C1C', 'Not sure': '#4A90D9',
  'Somewhat': '#3DAA6E', 'Working on it': '#3DAA6E',
};

function DashboardContent() {
  const params = useSearchParams();
  const autoKey = params.get('key');
  const [unlocked, setUnlocked] = useState(autoKey === PIN);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState('home');

  const [discData, setDiscData] = useState([]);
  const [pollData, setPollData] = useState([]);
  const [brainstormData, setBrainstormData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);

  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [viewingSessionId, setViewingSessionId] = useState(null);

  const realtimeCleanup = useRef(null);

  function loadData(sessionId) {
    supabase.from('disc_responses').select('*').eq('session_id', sessionId)
      .then(({ data }) => { if (data) setDiscData(data); });
    supabase.from('poll_responses').select('*').eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setPollData(data.filter(r => r.poll_id !== 'brainstorm'));
          setBrainstormData(data.filter(r => r.poll_id === 'brainstorm'));
        }
      });
    supabase.from('leads').select('*').eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setLeadsData(data); });
  }

  function setupRealtime(sessionId) {
    if (realtimeCleanup.current) realtimeCleanup.current();

    const discSub = supabase.channel(`disc-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'disc_responses' }, payload => {
        if (payload.new.session_id === sessionId) setDiscData(prev => [...prev, payload.new]);
      }).subscribe();
    const pollSub = supabase.channel(`poll-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_responses' }, payload => {
        if (payload.new.session_id !== sessionId) return;
        if (payload.new.poll_id === 'brainstorm') setBrainstormData(prev => [payload.new, ...prev]);
        else setPollData(prev => [...prev, payload.new]);
      }).subscribe();
    const leadsSub = supabase.channel(`leads-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
        if (payload.new.session_id === sessionId) setLeadsData(prev => [...prev, payload.new]);
      }).subscribe();

    realtimeCleanup.current = () => {
      supabase.removeChannel(discSub);
      supabase.removeChannel(pollSub);
      supabase.removeChannel(leadsSub);
    };
  }

  useEffect(() => {
    if (!unlocked) return;

    async function init() {
      const [settingsRes, sessionsRes] = await Promise.all([
        supabase.from('app_settings').select('active_session_id').eq('id', 1).single(),
        supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      ]);
      const sid = settingsRes.data?.active_session_id;
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (sid) {
        setActiveSessionId(sid);
        loadData(sid);
        setupRealtime(sid);
      }
    }

    init();
    return () => { if (realtimeCleanup.current) realtimeCleanup.current(); };
  }, [unlocked]);

  async function handleNewSession(name) {
    const { data: newSession } = await supabase.from('sessions').insert({ name }).select().single();
    if (!newSession) return;
    await supabase.from('app_settings').update({ active_session_id: newSession.id }).eq('id', 1);
    setActiveSessionId(newSession.id);
    setSessions(prev => [newSession, ...prev]);
    setViewingSessionId(null);
    setDiscData([]); setPollData([]); setBrainstormData([]); setLeadsData([]);
    setupRealtime(newSession.id);
  }

  function handleSwitchSession(sessionId) {
    const isActive = sessionId === activeSessionId;
    setViewingSessionId(isActive ? null : sessionId);
    loadData(sessionId);
    if (isActive) setupRealtime(sessionId);
    else if (realtimeCleanup.current) realtimeCleanup.current();
  }

  async function handleAnalyze() {
    if (analysisLoading || !discData.length) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discData, sessionId: activeSessionId }),
      });
      const json = await res.json();
      if (json.content) setAnalysisResult(json.content);
    } catch (e) {
      console.error('Analysis error:', e);
    }
    setAnalysisLoading(false);
  }

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

  const currentSessionId = viewingSessionId || activeSessionId;

  return (
    <main className="min-h-screen flex flex-col" style={{background:'#0a0a0a'}}>
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <h1 className="font-serif text-2xl text-hmh-cream">Live Dashboard</h1>
        <span className="text-xs text-hmh-gold tracking-widest uppercase">{discData.length} assessments</span>
      </div>
      <div className="flex border-b border-hmh-gray mx-6 mb-6">
        {[['home','Home'],['disc','DiSC Wheel'],['polls','Poll Results'],['brainstorm','Brainstorm']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-3 text-sm font-semibold mr-2 border-b-2 transition-colors ${tab===key ? 'border-hmh-gold text-hmh-gold' : 'border-transparent text-hmh-cream-dim'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 px-6 pb-10">
        {tab === 'home'       && <HomeView leadsData={leadsData} discCount={discData.length} pollCount={pollData.length} brainstormCount={brainstormData.length} sessions={sessions} activeSessionId={activeSessionId} viewingSessionId={viewingSessionId} onNewSession={handleNewSession} onSwitchSession={handleSwitchSession} />}
        {tab === 'disc'       && <DiscWheel data={discData} analysisResult={analysisResult} analysisLoading={analysisLoading} onAnalyze={handleAnalyze} />}
        {tab === 'polls'      && <PollResults data={pollData} />}
        {tab === 'brainstorm' && <BrainstormView data={brainstormData} />}
      </div>
    </main>
  );
}

function HomeView({ leadsData, discCount, pollCount, brainstormCount, sessions, activeSessionId, viewingSessionId, onNewSession, onSwitchSession }) {
  const [showNewSession, setShowNewSession] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const currentSession = sessions.find(s => s.id === (viewingSessionId || activeSessionId));
  const isViewingArchive = viewingSessionId && viewingSessionId !== activeSessionId;
  const roster = leadsData.filter(l => l.name && l.source === 'roster');

  const stats = [
    { label: 'Roster Sign-Ins', value: roster.length, color: '#C9A23E' },
    { label: 'DiSC Assessments', value: discCount, color: '#B91C1C' },
    { label: 'Poll Votes', value: pollCount, color: '#1E3A8A' },
    { label: 'Brainstorm', value: brainstormCount, color: '#3DAA6E' },
  ];

  async function handleCreate() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    await onNewSession(newName.trim());
    setShowNewSession(false);
    setNewName('');
    setCreating(false);
  }

  return (
    <div>
      {/* Session header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-hmh-cream-dim text-xs uppercase tracking-widest mb-0.5">Active Session</p>
          <p className="text-hmh-cream font-semibold">{currentSession?.name || '—'}</p>
          {currentSession && (
            <p className="text-hmh-cream-dim text-xs">{new Date(currentSession.created_at).toLocaleDateString([], {month:'short', day:'numeric', year:'numeric'})}</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {sessions.length > 1 && (
            <select
              value={viewingSessionId || activeSessionId || ''}
              onChange={e => onSwitchSession(e.target.value)}
              className="bg-hmh-gray border border-hmh-gray-light text-hmh-cream text-xs rounded-lg px-3 py-2 focus:outline-none"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id === activeSessionId ? `★ ${s.name}` : s.name}
                </option>
              ))}
            </select>
          )}
          <button onClick={() => { setShowNewSession(!showNewSession); setNewName(''); }}
            className="bg-hmh-gold text-hmh-black text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap">
            + New Session
          </button>
        </div>
      </div>

      {/* New session form */}
      {showNewSession && (
        <div className="bg-hmh-gray rounded-xl p-4 mb-5 border border-hmh-gold" style={{borderColor:'rgba(201,162,62,0.5)'}}>
          <p className="text-hmh-cream font-semibold mb-1">Start a New Session</p>
          <p className="text-hmh-cream-dim text-xs mb-3">Current data will be archived. New responses track separately.</p>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            placeholder={`e.g. AZFC ${new Date().getFullYear()}`}
            className="w-full bg-hmh-black border border-hmh-gray-light text-hmh-cream rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:border-hmh-gold"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim() || creating}
              className="flex-1 bg-hmh-gold text-hmh-black font-bold py-2 rounded-lg text-sm disabled:opacity-40">
              {creating ? 'Starting...' : 'Confirm & Start'}
            </button>
            <button onClick={() => setShowNewSession(false)}
              className="px-4 py-2 rounded-lg text-hmh-cream-dim text-sm border border-hmh-gray-light">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isViewingArchive && (
        <div className="bg-hmh-gray rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
          <p className="text-hmh-gold text-xs">Viewing: {currentSession?.name}</p>
          <button onClick={() => onSwitchSession(activeSessionId)} className="text-xs text-hmh-cream-dim underline">Back to live</button>
        </div>
      )}

      {/* Participation stats */}
      <h3 className="font-serif text-lg text-hmh-cream mb-3">Participation</h3>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-hmh-gray rounded-xl py-4 px-4 text-center">
            <div className="text-4xl font-bold font-serif mb-1" style={{color: s.color}}>{s.value}</div>
            <div className="text-xs text-hmh-cream-dim leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Roster */}
      <h3 className="font-serif text-lg text-hmh-cream mb-3">
        Roster <span className="text-hmh-cream-dim text-sm font-sans font-normal ml-1">({roster.length})</span>
      </h3>
      {roster.length === 0 ? (
        <p className="text-hmh-cream-dim text-sm text-center pt-6">Waiting for sign-ins...</p>
      ) : (
        <div className="space-y-2">
          {roster.map((lead, i) => (
            <div key={lead.id || i} className="bg-hmh-gray rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-hmh-cream font-semibold">{lead.name}</p>
                {lead.email && <p className="text-hmh-cream-dim text-xs mt-0.5">{lead.email}</p>}
              </div>
              <p className="text-hmh-cream-dim text-xs shrink-0 ml-4">
                {lead.created_at ? new Date(lead.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PollResults({ data }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {POLL_QUESTIONS.map(q => {
        const qData = data.filter(r => r.poll_id === q.id);
        const total = qData.length;
        const counts = {};
        q.options.forEach(o => { counts[o] = 0; });
        qData.forEach(r => { if (counts[r.answer] !== undefined) counts[r.answer]++; });
        const slices = q.options.map(o => ({ value: counts[o], color: OPTION_COLORS[o] || '#888' }));

        return (
          <div key={q.id} className="bg-hmh-gray rounded-xl p-4 flex flex-col items-center">
            <p className="text-hmh-cream font-semibold text-sm mb-3 text-center leading-snug">{q.label}</p>
            <PieChart slices={slices} size={220} />
            <div className="w-full mt-4 space-y-2">
              {q.options.map(o => {
                const pct = total ? Math.round(counts[o] / total * 100) : 0;
                return (
                  <div key={o} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: OPTION_COLORS[o] || '#888'}} />
                      <span className="text-xs" style={{color: OPTION_COLORS[o] || '#ccc'}}>{o}</span>
                    </div>
                    <span className="text-hmh-cream font-bold text-sm">{pct}%</span>
                  </div>
                );
              })}
              <p className="text-hmh-cream-dim text-xs text-center pt-1">{total} vote{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ slices, size = 130 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 4, ri = R * 0.42;
  const total = slices.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={R} fill="#333"/>
        <circle cx={cx} cy={cy} r={ri} fill="#1a1a1a"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="9">Waiting...</text>
      </svg>
    );
  }

  let angle = -Math.PI / 2;
  const paths = [];
  const labels = [];

  slices.forEach(({ value, color }, i) => {
    if (value === 0) return;
    const pct = Math.round((value / total) * 100);
    const slice = (value / total) * Math.PI * 2;
    const mid = angle + slice / 2;
    let pathD;
    if (value === total) {
      pathD = `M${cx},${cy - R} A${R},${R} 0 1,1 ${cx},${cy + R} A${R},${R} 0 1,1 ${cx},${cy - R} Z`;
    } else {
      const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
      const x2 = cx + R * Math.cos(angle + slice), y2 = cy + R * Math.sin(angle + slice);
      const large = slice > Math.PI ? 1 : 0;
      pathD = `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z`;
    }
    paths.push(<path key={i} d={pathD} fill={color} stroke="#1a1a1a" strokeWidth="1.5"/>);
    if (pct >= 8) {
      const lx = cx + (R * 0.68) * Math.cos(mid);
      const ly = cy + (R * 0.68) * Math.sin(mid);
      labels.push(<text key={`l${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="11" fontWeight="bold">{pct}%</text>);
    }
    angle += slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <circle cx={cx} cy={cy} r={ri} fill="#1a1a1a"/>
      {labels}
    </svg>
  );
}

function parseInline(str) {
  const parts = [];
  let remaining = str;
  let key = 0;
  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf('**');
    const italicIdx = remaining.search(/(?<!\*)\*(?!\*)/);
    if (boldIdx !== -1 && (italicIdx === -1 || boldIdx <= italicIdx)) {
      const end = remaining.indexOf('**', boldIdx + 2);
      if (end !== -1) {
        if (boldIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
        parts.push(<strong key={key++} className="font-bold text-hmh-cream">{remaining.slice(boldIdx + 2, end)}</strong>);
        remaining = remaining.slice(end + 2);
        continue;
      }
    }
    if (italicIdx !== -1) {
      const end = remaining.indexOf('*', italicIdx + 1);
      if (end !== -1) {
        if (italicIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, italicIdx)}</span>);
        parts.push(<em key={key++} className="italic text-hmh-cream-dim">{remaining.slice(italicIdx + 1, end)}</em>);
        remaining = remaining.slice(end + 1);
        continue;
      }
    }
    parts.push(<span key={key++}>{remaining}</span>);
    remaining = '';
  }
  return parts;
}

function MarkdownDisplay({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  lines.forEach((line, idx) => {
    if (line.startsWith('# ')) {
      elements.push(<h1 key={idx} className="font-serif text-xl text-hmh-cream mt-6 mb-2 pb-2 border-b border-hmh-gray-light">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={idx} className="font-serif text-base text-hmh-gold mt-5 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={idx} className="text-xs font-bold uppercase tracking-widest text-hmh-gold mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.trim() === '---') {
      elements.push(<hr key={idx} className="border-hmh-gray-light my-4" />);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={idx} className="text-hmh-cream text-sm leading-relaxed ml-4 list-disc mb-1">{parseInline(line.slice(2))}</li>);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={idx} className="border-l-2 border-hmh-gold pl-3 my-1 text-hmh-cream text-sm leading-relaxed">{parseInline(line.slice(2))}</blockquote>);
    } else if (line.trim() === '>') {
      elements.push(<div key={idx} className="h-2" />);
    } else if (line.trim() === '') {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(<p key={idx} className="text-hmh-cream text-sm leading-relaxed">{parseInline(line)}</p>);
    }
  });
  return <div className="space-y-1">{elements}</div>;
}

function DiscWheel({ data, analysisResult, analysisLoading, onAnalyze }) {
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
      <div className="relative mx-auto mb-4" style={{aspectRatio:'1', width:'min(68vh, 100%)'}}>
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
      <div className="grid grid-cols-4 gap-3 w-full">
        {['D','I','S','C'].map(type => (
          <div key={type} className="text-center bg-hmh-gray rounded-lg py-3">
            <div className="text-3xl font-bold font-serif" style={{color: DISC_COLORS[type]}}>{counts[type]}</div>
            <div className="text-xs font-bold mt-1" style={{color: DISC_COLORS[type]}}>{type}</div>
            <div className="text-xs text-hmh-cream-dim">{total ? Math.round(counts[type]/total*100) : 0}%</div>
          </div>
        ))}
      </div>
      {total === 0 && <p className="text-hmh-cream-dim text-sm mt-8 text-center">Waiting for responses...</p>}

      <div className="w-full mt-4">
        <button
          onClick={onAnalyze}
          disabled={analysisLoading || total === 0}
          className="w-full bg-hmh-gold text-hmh-black font-bold py-4 rounded-lg text-sm disabled:opacity-40 transition-opacity"
        >
          {analysisLoading ? 'Analyzing the room...' : 'Analyze This Room'}
        </button>
        {total === 0 && (
          <p className="text-hmh-cream-dim text-xs text-center mt-2">Waiting for DiSC responses before analyzing</p>
        )}
      </div>

      {analysisResult && (
        <div className="w-full mt-6 bg-hmh-gray rounded-xl p-5">
          <p className="text-hmh-gold text-xs tracking-widest uppercase mb-3">Room Analysis</p>
          <div className="overflow-y-auto max-h-[500px]">
            <MarkdownDisplay text={analysisResult} />
          </div>
        </div>
      )}
    </div>
  );
}

function BrainstormView({ data }) {
  const wordFreq = {};
  data.forEach(r => {
    if (!r.answer) return;
    r.answer.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
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
              return <span key={word} style={{fontSize:`${size}px`, opacity, color, lineHeight:1.5, fontWeight: freq > 1 ? 'bold' : 'normal'}}>{word}</span>;
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
