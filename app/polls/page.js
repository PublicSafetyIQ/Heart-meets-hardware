'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const questions = [
  {
    id: 'poll_1',
    question: 'Do you see a role for AI in your daily work?',
    options: ['Yes', 'No', 'Not sure'],
    reveal: '95% of NFPA 2025 conference respondents said yes — they see a role for AI in daily fire service work.',
  },
  {
    id: 'poll_2',
    question: 'Do you see a role for AI in the daily work of the boots on the ground?',
    options: ['Yes', 'No', 'Not sure'],
    reveal: 'The people closest to the mission are often the most ready. The question is whether leadership is giving them the tools and the guardrails.',
  },
  {
    id: 'poll_3',
    question: 'Do you feel prepared to use AI at work?',
    options: ['Yes', 'Somewhat', 'No'],
    reveal: '79% of employees across industries say they feel unprepared to use AI at work. You are not alone — and that number can change.',
  },
  {
    id: 'poll_4',
    question: 'Have you provided AI training for your workforce?',
    options: ['Yes', 'No', 'Working on it'],
    reveal: '65% of employees across industries say their employer has given them zero AI training. The gap between adoption and preparation is where the risk lives.',
  },
];

export default function PollsPage() {
  const [index, setIndex]       = useState(0);
  const [answer, setAnswer]     = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone]         = useState(false);

  const current = questions[index];

  async function handleSubmit() {
    if (!answer) return;
    await supabase.from('poll_responses').insert({
      poll_id: current.id,
      answer,
    });
    setRevealed(true);
  }

  function handleNext() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setAnswer(null);
      setRevealed(false);
    } else {
      setDone(true);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">

      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Live Polls</h1>
        <p className="text-hmh-cream-dim text-sm">Your presenter will direct you to each question.</p>
      </div>

      {done ? (
        <div className="text-center py-10">
          <p className="text-hmh-gold text-4xl mb-4">✓</p>
          <p className="text-hmh-cream font-semibold text-lg mb-2">All done.</p>
          <p className="text-hmh-cream-dim text-sm">Thanks for participating.</p>
        </div>
      ) : (
        <div className="flex-1">
          <p className="text-hmh-gold text-xs tracking-widest uppercase mb-4">
            Question {index + 1} of {questions.length}
          </p>
          <h2 className="font-serif text-2xl text-hmh-cream leading-snug mb-8">
            {current.question}
          </h2>

          {!revealed ? (
            <>
              <div className="space-y-3 mb-8">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(opt)}
                    className={`w-full text-left px-5 py-4 rounded-lg border text-base transition-all
                      ${answer === opt
                        ? 'bg-hmh-gold border-hmh-gold text-hmh-black font-semibold'
                        : 'bg-hmh-gray border-hmh-gray-light text-hmh-cream hover:border-hmh-gold'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!answer}
                className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </>
          ) : (
            <>
              <div className="bg-hmh-gray rounded-lg p-5 mb-6">
                <p className="text-hmh-gold text-xs tracking-widest uppercase mb-3">The Numbers</p>
                <p className="text-hmh-cream text-sm leading-relaxed">{current.reveal}</p>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light"
              >
                {index + 1 < questions.length ? 'Next Question' : 'Finish'}
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
