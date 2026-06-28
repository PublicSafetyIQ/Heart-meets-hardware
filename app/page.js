'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12">

      {/* Header */}
      <div className="w-full max-w-md text-center">
        <p className="text-hmh-gold text-xs tracking-[0.3em] uppercase mb-4">
          Arizona Fire Chiefs Conference 2026
        </p>
        <h1 className="font-serif text-4xl text-hmh-cream leading-tight mb-2">
          Heart Meets Hardware
        </h1>
        <p className="text-hmh-cream-dim text-sm italic mb-1">
          Serving People in a Digital World
        </p>
        <div className="w-16 h-px bg-hmh-gold mx-auto mt-6 mb-8" />
        <p className="text-hmh-cream text-base leading-relaxed">
          Welcome. You are in the right place.
        </p>
        <p className="text-hmh-cream-dim text-sm mt-2 leading-relaxed">
          Scan this QR code or use the link your presenter shared.
          Start by taking the communication style assessment below.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="w-full max-w-md my-10">
        <Link href="/assessment">
          <button className="w-full bg-hmh-gold text-hmh-black font-bold text-lg py-5 rounded-lg tracking-wide hover:bg-hmh-gold-light active:scale-95">
            Begin Assessment
          </button>
        </Link>
        <p className="text-center text-hmh-cream-dim text-xs mt-3">
          16 questions · About 3 minutes
        </p>
      </div>

      {/* Navigation */}
      <nav className="w-full max-w-md">
        <div className="border border-hmh-gray-light rounded-lg overflow-hidden">
          <NavLink href="/polls"     label="Live Polls"  sub="Participate during the session" />
          <NavLink href="/resources" label="Resources"   sub="Laws, HIPAA, what to do next" border />
          <NavLink href="/connect"   label="Connect"     sub="Stay in touch · Get training" border />
        </div>
      </nav>

      {/* Footer */}
      <p className="text-hmh-cream-dim text-xs mt-8 text-center">
        Presented by Ashley Losch · PublicSafetyIQ
      </p>
    </main>
  );
}

function NavLink({ href, label, sub, border }) {
  return (
    <Link href={href}>
      <div className={`flex items-center justify-between px-5 py-4 hover:bg-hmh-gray active:bg-hmh-gray-light cursor-pointer ${border ? 'border-t border-hmh-gray-light' : ''}`}>
        <div>
          <p className="text-hmh-cream font-semibold text-sm">{label}</p>
          <p className="text-hmh-cream-dim text-xs mt-0.5">{sub}</p>
        </div>
        <span className="text-hmh-gold text-lg">›</span>
      </div>
    </Link>
  );
}
