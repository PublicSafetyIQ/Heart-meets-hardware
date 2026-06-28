'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12">

      <div className="w-full max-w-md text-center">
        <img src="/logo.png" alt="Heart Meets Hardware" style={{width:'200px',margin:'0 auto 20px',display:'block'}} />
        <h1 className="font-serif text-5xl text-hmh-cream leading-tight mb-2">
          Heart Meets Hardware
        </h1>
        <p className="text-hmh-cream-dim text-xl italic whitespace-nowrap">
          Serving People in a Digital World
        </p>
        <div className="w-full h-px bg-hmh-gold my-8" style={{opacity:0.5}} />
        <p className="text-hmh-cream text-xl leading-relaxed">
          Start by taking the communication style assessment below.
        </p>
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
          <NavLink href="/polls" label="Live Polls" sub="Participate during the session" />
          <NavLink href="/resources" label="Resources" sub="Laws, HIPAA, what to do next" border />
          <NavLink href="/connect" label="Connect" sub="Stay in touch · Get training" border />
        </div>
      </nav>

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
