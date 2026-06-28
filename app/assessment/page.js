'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { discQuestions } from '../../lib/disc-data';

export default function AssessmentPage() {
  const router = useRouter();
  const [current, setCurrent]   = useState(0);
  const [scores, setScores]     = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [selected, setSelected] = useState(null);
  const question = discQuestions[current];
  const total    = discQuestions.length;

  function handleNext() {
    if (!selected) return;
    const newScores = { ...scores, [selected]: scores[selected] + 1 };
    setScores(newScores);
    if (current + 1 < total) { setCurrent(current + 1); setSelected(null); }
    else { const p = new URLSearchParams({ d: newScores.D, i: newScores.I, s: newScores.S, c: newScores.C }); router.push(`/result?${p.toString()}`); }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-hmh-gold text-sm">← Home</Link>
        <span className="text-hmh-cream-dim text-xs">{Math.round(((current + 1) / total) * 100)}%</span>
      </div>
      <div className="w-full h-1 bg-hmh-gray-light rounded-full overflow-hidden mb-2">
        <div className="h-full bg-hmh-gold rounded-full transition-all duration-300" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      <p className="text-hmh-gold text-xs tracking-widest uppercase mb-8">Question {current + 1} of {total}</p>
      <div className="flex-1">
        <h2 className="font-serif text-2xl text-hmh-cream leading-snug mb-10">{question.prompt}</h2>
        <div className="space-y-3">
          {question.options.map((option) => (
            <button key={option.type} onClick={() => setSelected(option.type)}
              className={`w-full text-left px-5 py-4 rounded-lg border text-base transition-all duration-150 ${selected === option.type ? 'bg-hmh-gold border-hmh-gold text-hmh-black font-semibold' : 'bg-hmh-gray border-hmh-gray-light text-hmh-cream hover:border-hmh-gold'}`}>
              {option.text}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <button onClick={handleNext} disabled={!selected}
          className={`w-full py-4 rounded-lg font-bold text-base tracking-wide transition-all duration-150 ${selected ? 'bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light active:scale-95' : 'bg-hmh-gray text-hmh-cream-dim cursor-not-allowed'}`}>
          {current + 1 === total ? 'See My Results' : 'Next'}
        </button>
      </div>
    </main>
  );
}
