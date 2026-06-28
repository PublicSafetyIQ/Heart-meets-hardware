'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const interests = [
  'AI Training for my department',
  'Product demo (FireIQ / CQI IQ / PIO IQ)',
  'Speaking / consulting',
  'Just staying connected',
];

export default function ConnectPage() {
  const [form, setForm]       = useState({ name: '', email: '', department: '', interest: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    await supabase.from('leads').insert({
      name:       form.name,
      email:      form.email,
      department: form.department,
      interest:   form.interest,
    });
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">

      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Connect</h1>
        <p className="text-hmh-cream-dim text-sm">
          Training, demos, and more — we are here for you.
        </p>
      </div>

      {/* Quick links */}
      <div className="space-y-3 mb-10">
        <ExternalLink
          href="https://www.publicsafetyiq.ai"
          label="PublicSafetyIQ.ai"
          sub="Our platform and products"
        />
        <ExternalLink
          href="https://a.co/d/0gFjfc7T"
          label="Get the Book"
          sub="Don't Let AI Make Your Department Dumber"
        />
        <ExternalLink
          href="mailto:ashley@publicsafetyiq.ai"
          label="Email Ashley"
          sub="ashley@publicsafetyiq.ai"
        />
      </div>

      <div className="w-full h-px bg-hmh-gray-light mb-8" />

      {/* Lead capture form */}
      <h2 className="font-serif text-xl text-hmh-cream mb-2">Stay in touch</h2>
      <p className="text-hmh-cream-dim text-sm mb-6">
        Leave your info and we will follow up with what you need.
      </p>

      {submitted ? (
        <div className="text-center py-10">
          <p className="text-hmh-gold text-4xl mb-4">✓</p>
          <p className="text-hmh-cream font-semibold text-lg mb-2">Got it. Thank you.</p>
          <p className="text-hmh-cream-dim text-sm">We will be in touch soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Field
            label="Name *"
            value={form.name}
            onChange={(v) => handleChange('name', v)}
            placeholder="Your name"
          />
          <Field
            label="Email *"
            value={form.email}
            onChange={(v) => handleChange('email', v)}
            placeholder="your@email.com"
            type="email"
          />
          <Field
            label="Department / Agency"
            value={form.department}
            onChange={(v) => handleChange('department', v)}
            placeholder="e.g. Scottsdale Fire Department"
          />

          <div>
            <p className="text-hmh-gold text-xs tracking-widest uppercase mb-2">
              What are you interested in?
            </p>
            <div className="space-y-2">
              {interests.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('interest', opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all
                    ${form.interest === opt
                      ? 'bg-hmh-gold border-hmh-gold text-hmh-black font-semibold'
                      : 'bg-hmh-gray border-hmh-gray-light text-hmh-cream hover:border-hmh-gold'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.email || submitting}
            className="w-full py-4 rounded-lg font-bold text-base bg-hmh-gold text-hmh-black hover:bg-hmh-gold-light disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
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
          <p className="text-hmh-cream font-semibold text-sm">{label}</p>
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-hmh-gray border border-hmh-gray-light text-hmh-cream placeholder-hmh-cream-dim rounded-lg px-4 py-3 text-sm focus:border-hmh-gold focus:outline-none"
      />
    </div>
  );
}
