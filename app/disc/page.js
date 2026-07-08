'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId } from '../../lib/session';

const DISC_COLORS = { D: '#B91C1C', I: '#C9A23E', S: '#1E3A8A', C: '#aaaaaa' };

export default function DiscPage() {
  const [personalResult, setPersonalResult] = useState(null);
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sessionId = await getActiveSessionId();

      if (sessionId) {
        // Personal result from localStorage
        try {
          const stored = localStorage.getItem(`hmh_disc_result_${sessionId}`);
          if (stored) setPersonalResult(JSON.parse(stored));
        } catch {}

        // Room analysis from Supabase
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
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="mb-8">
        <p className="text-hmh-gold text-xs tracking-[0.3em] uppercase mb-1">Heart Meets Hardware</p>
        <h1 className="font-serif text-3xl text-hmh-cream">DiSC</h1>
        <div className="w-16 h-px bg-hmh-gold mt-4" />
      </div>

      {/* Personal Result */}
      <section className="mb-10">
        <h2 className="font-serif text-xl text-hmh-cream mb-4">Your Result</h2>
        {personalResult ? (
          <div className="bg-hmh-gray rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-serif font-bold text-xl shrink-0"
                style={{ borderColor: personalResult.primaryColor, color: personalResult.primaryColor }}
              >
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
            <Link href={`/result?d=${personalResult.scores?.D||0}&i=${personalResult.scores?.I||0}&s=${personalResult.scores?.S||0}&c=${personalResult.scores?.C||0}`}>
              <button className="w-full mt-4 border border-hmh-gold text-hmh-gold py-2 rounded-lg text-sm font-semibold hover:bg-hmh-gold hover:text-hmh-black transition-colors">
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
      </section>

      {/* Room Analysis */}
      <section className="mb-10">
        <h2 className="font-serif text-xl text-hmh-cream mb-1">Your Room's Profile</h2>
        <p className="text-hmh-cream-dim text-xs mb-4">AI analysis generated during the presentation</p>
        {roomAnalysis ? (
          <div className="bg-hmh-gray rounded-xl p-5">
            <p className="text-hmh-gold text-xs tracking-widest uppercase mb-3">Room Analysis</p>
            <div className="text-hmh-cream text-sm leading-relaxed whitespace-pre-wrap">
              {roomAnalysis}
            </div>
          </div>
        ) : (
          <div className="bg-hmh-gray rounded-xl p-5 text-center">
            <p className="text-hmh-cream-dim text-sm">
              The room analysis will appear here after it's generated during the presentation.
            </p>
          </div>
        )}
      </section>

      <Link href="/">
        <button className="w-full border border-hmh-gold text-hmh-gold py-3 rounded-lg font-semibold hover:bg-hmh-gold hover:text-hmh-black transition-colors">
          Back to Home
        </button>
      </Link>
    </main>
  );
}
