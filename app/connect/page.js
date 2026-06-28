'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const PUMBLE_WEBHOOK = 'https://api.pumble.com/workspaces/68b2e72c676885957dbbc2bf/incomingWebhooks/postMessage/yN2TJClcGglRjNV5Yr2r5IRZ';

export default function ConnectPage() {
  const [form, setForm]             = useState({ name: '', phone: '', email: '', department: '', note: '' });
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit() {
    if (!form.name || !form.email) return;
    setSubmitting(true);

    // Save to Supabase
    await supabase.from('leads').insert({
      name: form.name, phone: form.phone, email: form.email,
      department: form.department, note: form.note,
    });

    // Send to Pumble
    const lines = [
      `*New lead from Heart Meets Hardware*`,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      form.phone      ? `*Phone:* ${form.phone}`           : null,
      form.department ? `*Department:* ${form.department}` : null,
      form.note       ? `*Note:* ${form.note}`             : null,
    ].filter(Boolean).join('\n');

    await fetch(PUMBLE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: lines }),
    }).catch(() => {});

    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Connect</h1>
      </div>

      {/* Ashley contact */}
      <div className="bg-hmh-gray rounded-lg p-5 mb-6">
        <p className="text-hmh-gold text-xs tracking-widest uppercase mb-3">Your Presenter</p>
        <p className="text-hmh-cream font-semibold text-lg">Ashley Losch</p>
        <a href="tel:6023163998" className="block text-hmh-cream-dim text-sm mt-1 hover:text-hmh-gold">602-316-3998</a>
        <a href="mailto:ashley@publicsafetyiq.ai" className="block text-hmh-cream-dim text-sm mt-0.5 hover:text-hmh-gold">ashley@publicsafetyiq.ai</a>
      </div>

      {/* Quick links */}
      <div className="space-y-3 mb-10">
        <ExternalLink href="https://www.publicsafetyiq.ai" label="Visit our Website" sub="PublicSafetyIQ.ai" />
        <ExternalLink href="https://a.co/d/0gFjfc7T" label="Get the Book" sub="Don't Let AI Make Your Department Dumber" />
      </div>

      <div className="w-full h-px bg-hmh-gray-light mb-8" />

      <h2 className="font-serif text-xl text-hmh-cream mb-2">Stay in touch</h2>
      <p className="text-hmh-cream-dim text-sm mb-6">Leave your info and we will follow up with what you need.</p>

      {submitted ? (
        <div className="text-center py-10">
          <p className="text-hmh-gold text-4xl mb-4">✓</p>
          <p className="text-hmh-cream font-semibold text-lg mb-2">Got it. Thank you.</p>
          <p className="text-hmh-cream-dim text-sm">We will be in touch soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Name *" value={form.name} onChange={(v) => handleChange('name', v)} placeholder="Your name" />
          <Field label="Email *" value={form.email} onChange={(v) => handleChange('email', v)} placeholder="your@email.com" type="email" />
          <Field label="Phone (optional)" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="602-555-0100" type="tel" />
          <Field label="Department (optional)" value={form.department} onChange={(v) => handleChange('department', v)} placeholder="e.g. Scottsdale Fire Department" />
          <div>
            <p className="text-hmh-gold text-xs tracking-widest uppercase mb-2">Drop a Note (optional)</p>
            <textarea value={form.note} onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Anything you want us to know..." rows={4}
              className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-sm focus:border-hmh-gold focus:outline-none resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={!form.name || !form.email || submitting}
            className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed mt-2">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}
    </main>
  );
}

function ExternalLink({ href, label, sub }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <div className="flex items-center justify-between px-5 py-4 bg-hmh-gray rounded-lg hover:bg-hmh-gray-light transition-colors">
        <div>
          <p className="text-hmh-cream font-semibold text-base">{label}</p>
          <p className="text-hmh-cream-dim text-xs mt-0.5">{sub}</p>
        </div>
        <span className="text-hmh-gold text-lg">↗</span>
      </div>
    </a>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <p className="text-hmh-gold text-xs tracking-widest uppercase mb-2">{label}</p>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-sm focus:border-hmh-gold focus:outline-none" />
    </div>
  );
}
