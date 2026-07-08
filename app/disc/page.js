'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId } from '../../lib/session';

const DISC_COLORS = { D: '#B91C1C', I: '#C9A23E', S: '#1E3A8A', C: '#aaaaaa' };

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
      elements.push(
        <h1 key={idx} className="font-serif text-2xl text-hmh-cream mt-8 mb-3 pb-2 border-b border-hmh-gray-light">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="font-serif text-lg text-hmh-gold mt-6 mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-xs font-bold uppercase tracking-widest text-hmh-gold mt-5 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.trim() === '---') {
      elements.push(<hr key={idx} className="border-hmh-gray-light my-5" />);
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={idx} className="text-hmh-cream text-sm leading-relaxed ml-4 list-disc mb-1">
          {parseInline(line.slice(2))}
        </li>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={idx} className="border-l-2 border-hmh-gold pl-3 my-1 text-hmh-cream text-sm leading-relaxed">
          {parseInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === '>') {
      elements.push(<div key={idx} className="h-2" />);
    } else if (line.trim() === '') {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p key={idx} className="text-hmh-cream text-sm leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

export default function DiscPage() {
  const [personalResult, setPersonalResult] = useState(null);
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    async function load() {
      const sessionId = await getActiveSessionId();
      if (sessionId) {
        try {
          const stored = localStorage.getItem(`hmh_disc_result_${sessionId}`);
          if (stored) setPersonalResult(JSON.parse(stored));
        } catch {}
        const { data } = await supabase
          .from('disc_analysis')
          .select('content, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data) setRoomAnalysis(data.content);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-hmh-cream-dim">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <p className="text-hmh-gold text-xs tracking-[0.3em] uppercase mb-1">Heart Meets Hardware</p>
        <h1 className="font-serif text-3xl text-hmh-cream">DiSC</h1>
        <div className="w-16 h-px bg-hmh-gold mt-4" />
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-hmh-gray mx-6 mb-6">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-3 text-sm font-semibold mr-2 border-b-2 transition-colors ${activeTab === 'personal' ? 'border-hmh-gold text-hmh-gold' : 'border-transparent text-hmh-cream-dim'}`}>
          Your Result
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'room' ? 'border-hmh-gold text-hmh-gold' : 'border-transparent text-hmh-cream-dim'}`}>
          Room Profile
        </button>
      </div>

      {/* Personal Result Tab */}
      {activeTab === 'personal' && (
        <div className="px-6 pb-10">
          {personalResult ? (
            <div>
              <div className="bg-hmh-gray rounded-xl p-5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-serif font-bold text-xl shrink-0"
                    style={{ borderColor: personalResult.primaryColor, color: personalResult.primaryColor }}>
                    {personalResult.primary}
                  </div>
                  <div>
                    <p className="text-hmh-cream font-semibold">{personalResult.headline}</p>
                    <p className="text-hmh-gold text-xs italic mt-0.5">{personalResult.tagline}</p>
                  </div>
                </div>
                <p className="text-hmh-cream text-sm leading-relaxed mb-4">{personalResult.description}</p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-hmh-gold text-xs tracking-widest uppercase mb-1">Strengths</p>
                    <p className="text-hmh-cream text-sm leading-relaxed">{personalResult.strengths}</p>
                  </div>
                  <div>
                    <p className="text-hmh-red text-xs tracking-widest uppercase mb-1">Watch Out For</p>
                    <p className="text-hmh-cream text-sm leading-relaxed">{personalResult.watchout}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-4 border-t border-hmh-gray-light">
                  {['D','I','S','C'].map(l => (
                    <div key={l}>
                      <span className="text-xl font-bold" style={{ color: DISC_COLORS[l] }}>
                        {personalResult.scores?.[l] ?? 0}
                      </span>
                      <p className="text-xs text-hmh-cream-dim mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Link href={`/result?d=${personalResult.scores?.D||0}&i=${personalResult.scores?.I||0}&s=${personalResult.scores?.S||0}&c=${personalResult.scores?.C||0}`}>
                <button className="w-full border border-hmh-gold text-hmh-gold py-3 rounded-lg text-sm font-semibold hover:bg-hmh-gold hover:text-hmh-black transition-colors">
                  View Full Results
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-hmh-gray rounded-xl p-5 text-center">
              <p className="text-hmh-cream-dim text-sm mb-4">You haven't taken the assessment yet.</p>
              <Link href="/assessment">
                <button className="bg-hmh-gold text-hmh-black font-bold px-6 py-3 rounded-lg text-sm">
                  Begin Assessment
                </button>
              </Link>
            </div>
          )}
          <Link href="/">
            <button className="w-full mt-4 border border-hmh-gray-light text-hmh-cream-dim py-3 rounded-lg font-semibold hover:bg-hmh-gray transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      )}

      {/* Room Profile Tab */}
      {activeTab === 'room' && (
        <div className="px-6 pb-10">
          {roomAnalysis ? (
            <div>
              <div className="bg-hmh-gray rounded-xl p-5 mb-4">
                <p className="text-hmh-gold text-xs tracking-widest uppercase mb-4">AI Analysis — Generated During Session</p>
                <MarkdownDisplay text={roomAnalysis} />
              </div>
            </div>
          ) : (
            <div className="bg-hmh-gray rounded-xl p-5 text-center">
              <p className="text-hmh-cream-dim text-sm">
                The room analysis will appear here after it's generated during the presentation.
              </p>
            </div>
          )}
          <Link href="/">
            <button className="w-full mt-4 border border-hmh-gray-light text-hmh-cream-dim py-3 rounded-lg font-semibold hover:bg-hmh-gray transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      )}
    </main>
  );
}
