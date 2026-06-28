'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12">

      {/* Header */}
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="PublicSafetyIQ" width={80} height={80} />
        </div>
        <h1 className="font-serif text-5xl text-hmh-cream leading-tight mb-3">
          Heart Meets Hardware
        </h1>
        <p className="text-hmh-cream-dim text-xl italic mb-1">
          Serving People in a Digital World
        </p>
        <div className="w-16 h-px bg-hmh-gold mx-auto mt-6 mb-8" />
        <p className="text-hmh-cream text-2xl font-semibold leading-relaxed mb-3">
          Welcome. You are in the right place.
        </p>
        <p className="text-hmh-cream-dim text-lg mt-2 leading-relaxed">
          Start by taking the communication style assessment below.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="w-full max-w-md my-10">
        <Link href="/assessment">
          <button className="w-full bg-hmh-gold text-hmh-black font-bold text-2xl py-6 rounded-lg tracking-wide hover:bg-hmh-gold-light active:scale-95">
            Begin Assessment
          </button>
        </Link>
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
      <p className="text-hmh-cream-dim text-sm mt-8 text-center">
        Presented by Ashley Losch · PublicSafetyIQ
      </p>
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
