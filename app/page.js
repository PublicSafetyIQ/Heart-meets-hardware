'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12">

      {/* Header */}
      <div className="w-full max-w-md text-center">
        <div className="relative flex items-center justify-center py-6">
          <Image
            src="/logo.png"
            alt="PublicSafetyIQ"
            width={220}
            height={220}
            className="absolute opacity-10"
          />
          <div className="relative z-10">
            <h1 className="font-serif text-5xl text-hmh-cream leading-tight mb-3">
              Heart Meets Hardware
            </h1>
            <p className="text-hmh-cream-dim text-xl italic">
              Serving People in a Digital World
            </p>
          </div>
        </div>
        <div className="w-16 h-px bg-hmh-gold mx-auto mt-4 mb-8" />
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
