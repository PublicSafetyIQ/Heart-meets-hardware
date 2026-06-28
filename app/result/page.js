'use client';
export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateResult, getBlendDescription } from '../../lib/disc-data';
import { supabase } from '../../lib/supabase';

function ResultContent() {
  const params = useSearchParams();
  const scores = {
    D: parseInt(params.get('d') || '0'),
    I: parseInt(params.get('i') || '0'),
    S: parseInt(params.get('s') || '0'),
    C: parseInt(params.get('c') || '0'),
  };

  const { primary, secondary } = calculateResult(scores);
  const blend = getBlendDescription(primary, secondary);

  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    async function saveResult() {
      await supabase.from('disc_responses').insert({ d_score: scores.D, i_score: scores.I, s_score: scores.S, c_score: scores.C, primary_type: primary, secondary_type: secondary });
      setSaved(true);
    }
    if (!saved) saveResult();
  }, []);

  async function handleEmail() {
    if (!email || sending) return;
    setSending(true);
    try {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, primary, secondary, blend, scores }) });
      setSent(true);
    } catch (e) { console.error(e); }
    setSending(false);
  }

  if (!blend) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-hmh-cream-dim">Something went wrong. Please retake the assessment.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="text-center mb-8">
        <p className="text-hmh-gold text-xs tracking-[0.3em] uppercase mb-3">Your Communication Style</p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <TypeBadge letter={primary} color={blend.primaryColor} size="large" />
          <div className="text-hmh-cream-dim text-2xl">+</div>
          <TypeBadge letter={secondary} color="#888" size="medium" />
        </div>
        <h1 className="font-serif text-3xl text-hmh-cream mt-2">{blend.headline}</h1>
        <p className="text-hmh-gold text-sm mt-1 italic">{blend.primaryTagline}</p>
        <div className="w-16 h-px bg-hmh-gold mx-auto mt-5" />
      </div>

      <div className="mb-6">
        <p className="text-hmh-cream leading-relaxed text-base">{blend.description}</p>
      </div>

      <div className="space-y-4 mb-8">
        <InfoCard label="Your Strengths" text={blend.strengths} color="hmh-gold" />
        <InfoCard label="Watch Out For" text={blend.watchout} color="hmh-red" />
      </div>

      <div className="bg-hmh-gray rounded-lg p-4 mb-8">
        <p className="text-hmh-gold text-xs tracking-widest uppercase mb-3">Your Score Breakdown</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[{label:'D',score:scores.D,color:'#B91C1C'},{label:'I',score:scores.I,color:'#C9A23E'},{label:'S',score:scores.S,color:'#1E3A8A'},{label:'C',score:scores.C,color:'#F5EDD6'}].map(({label,score,color}) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-2xl font-bold" style={{color}}>{score}</span>
              <span className="text-xs text-hmh-cream-dim mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-hmh-gray rounded-lg p-5 mb-6">
        <p className="text-hmh-cream font-semibold mb-1">Send these results to yourself</p>
        <p className="text-hmh-cream-dim text-xs mb-4">One email with your full result and links to learn more.</p>
        {sent ? (
          <p className="text-hmh-gold text-sm text-center py-2">✓ Sent — check your inbox.</p>
        ) : (
          <div className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
              className="flex-1 bg-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-sm border border-hmh-gray-light focus:border-hmh-gold focus:outline-none" />
            <button onClick={handleEmail} disabled={!email || sending}
              className="bg-hmh-gold text-hmh-black font-bold px-4 py-3 rounded-lg text-sm hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed">
              {sending ? '...' : 'Send'}
            </button>
          </div>
        )}
      </div>

      <a href="https://www.discprofile.com/what-is-disc/disc-styles" target="_blank" rel="noreferrer"
        className="block text-center text-hmh-gold text-sm underline mb-6">
        Learn more about DiSC styles →
      </a>

      <Link href="/">
        <button className="w-full border border-hmh-gold text-hmh-gold py-4 rounded-lg text-lg font-semibold hover:bg-hmh-gold hover:text-hmh-black transition-colors">
          Back to Home
        </button>
      </Link>
    </main>
  );
}

function TypeBadge({ letter, color, size }) {
  const dim = size === 'large' ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-xl';
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-serif font-bold border-2`} style={{borderColor:color,color}}>
      {letter}
    </div>
  );
}

function InfoCard({ label, text, color }) {
  return (
    <div className="bg-hmh-gray rounded-lg p-4">
      <p className={`text-xs tracking-widest uppercase mb-2 text-${color}`}>{label}</p>
      <p className="text-hmh-cream text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><p className="text-hmh-cream-dim">Loading your results...</p></main>}>
      <ResultContent />
    </Suspense>
  );
}
