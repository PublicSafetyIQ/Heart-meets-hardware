'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { discQuestions } from '../../lib/disc-data';

export default function AssessmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [selected, setSelected] = useState(null);

  const question = discQuestions[current];
  const total = discQuestions.length;
  const progress = ((current) / total) * 100;

  function handleSelect(type) {
    setSelected(type);
  }

  function handleNext() {
    if (!selected) return;
    const newScores = { ...scores, [selected]: scores[selected] + 1 };
    setScores(newScores);

    if (current + 1 < total) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      // Done — go to result page with scores in URL
      const params = new URLSearchParams({
        d: newScores.D,
        i: newScores.I,
        s: newScores.S,
        c: newScores.C,
      });
      router.push(`/result?${params.toString()}`);
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-hmh-gold text-xs tracking-widest uppercase">
            Question {current + 1} of {total}
          </span>
          <span className="text-hmh-cream-dim text-xs">
            {Math.round(((current + 1) / total) * 100)}%
          </span>
        </div>
        <div className="w-full h-1 bg-hmh-gray-light rounded-full overflow-hidden">
          <div
            className="h-full bg-hmh-gold rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1">
        <h2 className="font-serif text-2xl text-hmh-cream leading-snug mb-10">
          {question.prompt}
        </h2>

        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selected === option.type;
            return (
              <button
                key={option.type}
                onClick={() => handleSelect(option.type)}
                className={`w-full text-left px-5 py-4 rounded-lg border text-base transition-all duration-150
                  ${isSelected
                    ? 'bg-hmh-gold border-hmh-gold text-hmh-black font-semibold'
                    : 'bg-hmh-gray border-hmh-gray-light text-hmh-cream hover:border-hmh-gold'
                  }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <div className="mt-10">
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`w-full py-4 rounded-lg font-bold text-base tracking-wide transition-all duration-150
            ${selected
              ? 'bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light active:scale-95'
              : 'bg-hmh-gray text-hmh-cream-dim cursor-not-allowed'
            }`}
        >
          {current + 1 === total ? 'See My Results' : 'Next'}
        </button>
      </div>
    </main>
  );
}
