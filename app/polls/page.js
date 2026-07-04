'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId } from '../../lib/session';

const questions = [
  { id: 'poll_1', question: 'Do you see a role for AI in your daily work?', options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_2', question: 'Do you see a role for AI in the daily work of the boots on the ground?', options: ['Yes', 'No', 'Not sure'] },
  { id: 'poll_3', question: 'Do you feel prepared to use AI at work?', options: ['Yes', 'Somewhat', 'No'] },
  { id: 'poll_4', question: 'Have you provided AI training for your workforce?', options: ['Yes', 'No', 'Working on it'] },
];

export default function PollsPage() {
  const [index, setIndex]           = useState(0);
  const [done, setDone]             = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const current = questions[index];

  async function handleAnswer(answer) {
    if (submitting) return;
    setSubmitting(true);
    const sessionId = await getActiveSessionId();
    await supabase.from('poll_responses').insert({ poll_id: current.id, answer, session_id: sessionId });
    if (index + 1 < questions.length) { setIndex(index + 1); } else { setDone(true); }
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Live Polls</h1>
        <p className="text-hmh-cream-dim text-sm">Tap your answer — your presenter will share the results.</p>
      </div>
      {done ? (
        <div className="text-center py-10">
          <p className="text-hmh-gold text-4xl mb-4">✓</p>
          <p className="text-hmh-cream font-semibold text-lg mb-2">All done. Thank you.</p>
          <p className="text-hmh-cream-dim text-sm">Watch the screen.</p>
        </div>
      ) : (
        <div className="flex-1">
          <p className="text-hmh-gold text-xs tracking-widest uppercase mb-4">Question {index + 1} of {questions.length}</p>
          <h2 className="font-serif text-2xl text-hmh-cream leading-snug mb-8">{current.question}</h2>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button key={opt} onClick={() => handleAnswer(opt)} disabled={submitting}
                className="w-full text-left px-5 py-4 rounded-lg border text-base bg-hmh-gray border-hmh-gray-light text-hmh-cream hover:border-hmh-gold hover:bg-hmh-gray-light transition-all disabled:opacity-40">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
