'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function BrainstormPage() {
  const [text, setText]         = useState('');
  const [sent, setSent]         = useState(false);
  const [sending, setSending]   = useState(false);

  async function handleSubmit() {
    if (!text.trim() || sending) return;
    setSending(true);
    await supabase.from('poll_responses').insert({ poll_id: 'brainstorm', answer: text.trim() });
    setSent(true);
    setSending(false);
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Brainstorm</h1>
        <p className="text-hmh-cream-dim text-sm">Your response appears live on screen.</p>
      </div>
      <h2 className="font-serif text-2xl text-hmh-cream leading-snug mb-4">
        What are the biggest challenges you are facing right now in your role? What keeps you up at night?
      </h2>
      <p className="text-hmh-cream-dim text-sm mb-8">Be honest. Be specific. This is your room.</p>
      {sent ? (
        <div className="text-center py-10">
          <p className="text-hmh-gold text-4xl mb-4">✓</p>
          <p className="text-hmh-cream font-semibold text-lg mb-2">Response received.</p>
          <p className="text-hmh-cream-dim text-sm">Watch the screen.</p>
        </div>
      ) : (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your response here..." rows={6}
            className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-base focus:border-hmh-gold focus:outline-none resize-none mb-6" />
          <button onClick={handleSubmit} disabled={!text.trim() || sending}
            className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed">
            {sending ? 'Submitting...' : 'Submit'}
          </button>
        </>
      )}
    </main>
  );
}
