'use client';
export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateResult, getBlendDescription } from '../../lib/disc-data';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId } from '../../lib/session';

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
  const [saved, setSaved]   = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function saveResult() {
      const sessionId = await getActiveSessionId();
      await supabase.from('disc_responses').insert({
        d_score: scores.D, i_score: scores.I, s_score: scores.S, c_score: scores.C,
        primary_type: primary, secondary_type: secondary,
        session_id: sessionId,
      });

      // Save to localStorage so the DiSC page can display it later
      if (sessionId && blend) {
        const resultData = {
          primary,
          secondary,
          headline: blend.headline,
          tagline: blend.primaryTagline,
          description: blend.description,
          strengths: blend.strengths,
          watchout: blend.watchout,
          primaryColor: blend.primaryColor,
          scores: { D: scores.D, I: scores.I, S: scores.S, C: scores.C },
        };
        localStorage.setItem(`hmh_disc_result_${sessionId}`, JSON.stringify(resultData));
      }

      setSaved(true);
    }
    if (!saved) saveResult();
  }, []);

  async function handleSave() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `My DiSC Result: ${blend.headline}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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

      <a href="https://www.discprofile.com/what-is-disc/disc-styles" target="_blank" rel="noreferrer"
        className="block text-center text-hmh-gold text-sm underline mb-8">
        Learn more about DiSC styles →
      </a>

      <div className="space-y-3">
        <button onClick={handleSave}
          className="w-full bg-hmh-gold text-hmh-black py-4 rounded-lg text-lg font-bold hover:bg-hmh-gold-light transition-colors">
          {copied ? '✓ Link Copied!' : 'Save My Results'}
        </button>
        <Link href="/disc">
          <button className="w-full border border-hmh-gold text-hmh-gold py-4 rounded-lg text-lg font-semibold hover:bg-hmh-gold hover:text-hmh-black transition-colors">
            View Room Analysis
          </button>
        </Link>
        <Link href="/">
          <button className="w-full border border-hmh-gray-light text-hmh-cream-dim py-4 rounded-lg text-lg font-semibold hover:bg-hmh-gray transition-colors">
            Back to Home
          </button>
        </Link>
      </div>
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
