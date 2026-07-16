'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { getActiveSessionId } from '../lib/session';

function RosterCard() {
  const [visible, setVisible] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function init() {
      const sid = await getActiveSessionId();
      setSessionId(sid);
      const key = `hmh_roster_${sid}`;
      if (!localStorage.getItem(key)) {
        setVisible(true);
      }
    }
    init();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await supabase.from('leads').insert({
        name: name.trim(),
        email: email.trim() || null,
        source: 'roster',
        session_id: sessionId,
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.setItem(`hmh_roster_${sessionId}`, '1');
    setDone(true);
    setTimeout(() => setVisible(false), 1200);
  }

  if (!visible) return null;

  return (
    <div className="w-full max-w-md mb-6">
      <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(201,162,62,0.45)', background:'#111'}}>
        <div className="h-1 w-full bg-hmh-gold" />
        <div className="px-5 py-5">
          {done ? (
            <div className="text-center py-3">
              <p className="text-hmh-gold text-3xl mb-1">✓</p>
              <p className="text-hmh-cream font-semibold">You're on the roster.</p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl text-hmh-cream mb-1">Sign the Roster</h2>
              <p className="text-hmh-cream-dim text-sm mb-4">Let us know you're here today.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-base focus:border-hmh-gold focus:outline-none"
                  autoComplete="off"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-base focus:border-hmh-gold focus:outline-none"
                  autoComplete="off"
                />
                <p className="text-hmh-cream-dim text-xs">Your name will not be shown with your results.</p>
                <button
                  type="submit"
                  disabled={!name.trim() || submitting}
                  className="w-full bg-hmh-gold text-hmh-black font-bold py-3 rounded-lg text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {submitting ? 'Signing...' : 'Sign the Roster'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12">
      <div className="w-full max-w-md">
        <div style={{display:'flex',alignItems:'flex-start',gap:'20px',marginBottom:'24px'}}>
          <img src="/logo.png" alt="Heart Meets Hardware" style={{width:'170px',flexShrink:0}} />
          <div>
            <h1 className="font-serif text-4xl text-hmh-cream leading-tight">Heart Meets Hardware</h1>
            <p className="text-hmh-cream-dim text-base italic mt-3">Serving People in a Digital World</p>
          </div>
        </div>
        <div className="w-full h-px bg-hmh-gold mb-6" style={{opacity:0.5}} />
        <RosterCard />
        <p className="text-hmh-cream text-xl leading-relaxed text-center">Start by taking the communication style assessment below.</p>
      </div>

      <div className="w-full max-w-md my-10">
        <Link href="/assessment">
          <button className="w-full bg-hmh-gold text-hmh-black font-bold text-2xl py-6 rounded-lg tracking-wide hover:bg-hmh-gold-light active:scale-95">
            Begin Assessment
          </button>
        </Link>
      </div>

      <nav className="w-full max-w-md">
        <div className="border border-hmh-gray-light rounded-lg overflow-hidden">
          <NavLink href="/polls"      label="Live Polls"  sub="Participate during the session" />
          <NavLink href="/resources"  label="Resources"   sub="Laws, HIPAA, what to do next" border />
          <NavLink href="/connect"    label="Connect"     sub="Stay in touch · Get training" border />
          <NavLink href="/disc"       label="DiSC"        sub="Your result + room analysis" border />
        </div>
      </nav>

      <p className="text-hmh-cream-dim text-sm mt-8 text-center">Presented by Ashley Losch · PublicSafetyIQ</p>
    </main>
  );
}

function NavLink({ href, label, sub, border }) {
  return (
    <Link href={href}>
      <div className={`flex items-center justify-between px-5 py-5 hover:bg-hmh-gray active:bg-hmh-gray-light cursor-pointer ${border ? 'border-t border-hmh-gray-light' : ''}`}>
        <div>
          <p className="text-hmh-cream font-semibold text-xl">{label}</p>
          <p className="text-hmh-cream-dim text-base mt-0.5">{sub}</p>
        </div>
        <span className="text-hmh-gold text-2xl">›</span>
      </div>
    </Link>
  );
}
