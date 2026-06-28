'use client';
import { useState } from 'react';
import Link from 'next/link';
import { statsQuestions } from '../../lib/disc-data';
import { supabase } from '../../lib/supabase';

export default function PollsPage() {
  const [tab, setTab] = useState('stats'); // 'stats' or 'pain'
  const [statIndex, setStatIndex]     = useState(0);
  const [statAnswer, setStatAnswer]   = useState(null);
  const [statRevealed, setStatRevealed] = useState(false);
  const [statDone, setStatDone]       = useState(false);
  const [painText, setPainText]       = useState('');
  const [painSent, setPainSent]       = useState(false);

  const currentQ = statsQuestions[statIndex];

  async function submitStat() {
    if (!statAnswer) return;
    await supabase.from('poll_responses').insert({
      poll_id: currentQ.id,
      answer:  statAnswer,
    });
    setStatRevealed(true);
  }

  function nextStat() {
    if (statIndex + 1 < statsQuestions.length) {
      setStatIndex(statIndex + 1);
      setStatAnswer(null);
      setStatRevealed(false);
    } else {
      setStatDone(true);
    }
  }

  async function submitPain() {
    if (!painText.trim()) return;
    await supabase.from('poll_responses').insert({
      poll_id: 'pain_points',
      answer:  painText.trim(),
    });
    setPainSent(true);
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">

      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Live Polls</h1>
        <p className="text-hmh-cream-dim text-sm">Your presenter will direct you to each section.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg overflow-hidden border border-hmh-gray-light mb-8">
        <TabBtn label="Stats Quiz" active={tab === 'stats'} onClick={() => setTab('stats')} />
        <TabBtn label="Pain Points" active={tab === 'pain'}  onClick={() => setTab('pain')}  />
      </div>

      {/* ── STATS TAB ── */}
      {tab === 'stats' && (
        <div className="flex-1">
          {statDone ? (
            <div className="text-center py-10">
              <p className="text-hmh-gold text-4xl mb-4">✓</p>
              <p className="text-hmh-cream font-semibold text-lg mb-2">All done.</p>
              <p className="text-hmh-cream-dim text-sm">Thanks for participating.</p>
            </div>
          ) : (
            <>
              <p className="text-hmh-gold text-xs tracking-widest uppercase mb-4">
                Question {statIndex + 1} of {statsQuestions.length}
              </p>
              <h2 className="font-serif text-xl text-hmh-cream leading-snug mb-8">
                {currentQ.question}
              </h2>

              {!statRevealed ? (
                <>
                  <div className="space-y-3 mb-8">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setStatAnswer(opt)}
                        className={`w-full text-left px-5 py-4 rounded-lg border text-sm transition-all
                          ${statAnswer === opt
                            ? 'bg-hmh-gold border-hmh-gold text-hmh-black font-semibold'
                            : 'bg-hmh-gray border-hmh-gray-light text-hmh-cream hover:border-hmh-gold'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={submitStat}
                    disabled={!statAnswer}
                    className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-hmh-gray rounded-lg p-5 mb-6">
                    <p className="text-hmh-gold text-xs tracking-widest uppercase mb-2">The Answer</p>
                    <p className="text-hmh-cream font-bold text-xl mb-4">{currentQ.answer}</p>
                    <p className="text-hmh-cream text-sm leading-relaxed">{currentQ.reveal}</p>
                  </div>
                  <button
                    onClick={nextStat}
                    className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light"
                  >
                    {statIndex + 1 < statsQuestions.length ? 'Next Question' : 'Finish'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── PAIN POINTS TAB ── */}
      {tab === 'pain' && (
        <div className="flex-1">
          <h2 className="font-serif text-xl text-hmh-cream leading-snug mb-3">
            What is the biggest challenge on your desk right now that you don&apos;t have enough time, people, or resources to solve?
          </h2>
          <p className="text-hmh-cream-dim text-sm mb-6">
            Be specific. Your response appears live on screen.
          </p>

          {painSent ? (
            <div className="text-center py-10">
              <p className="text-hmh-gold text-4xl mb-4">✓</p>
              <p className="text-hmh-cream font-semibold text-lg">Response received.</p>
              <p className="text-hmh-cream-dim text-sm mt-2">Watch the screen.</p>
            </div>
          ) : (
            <>
              <textarea
                value={painText}
                onChange={(e) => setPainText(e.target.value)}
                placeholder="Type your response here..."
                rows={5}
                className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-sm focus:border-hmh-gold focus:outline-none resize-none mb-4"
              />
              <button
                onClick={submitPain}
                disabled={!painText.trim()}
                className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-semibold transition-colors
        ${active
          ? 'bg-hmh-gold text-hmh-black'
          : 'bg-hmh-gray text-hmh-cream-dim hover:text-hmh-cream'
        }`}
    >
      {label}
    </button>
  );
}
