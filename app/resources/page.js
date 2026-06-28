'use client';
import { useState } from 'react';
import Link from 'next/link';

const sections = [
  {
    id: 'az-law',
    title: 'Arizona AI Law',
    color: '#C9A23E',
    content: [
      {
        heading: 'ADOA Policy P2000 — Generative AI Policy',
        body: 'Arizona\'s Department of Administration published this policy in March 2024 (updated October 2024). It applies to all state executive branch agencies and any departments operating under them.',
        link: { label: 'Read ADOA Policy P2000 →', href: 'https://az.gov/ai' },
      },
      {
        heading: 'What it requires:',
        bullets: [
          'PRIVACY: Agencies must protect individual privacy when using generative AI.',
          'TRANSPARENCY: Full attribution required — disclose which AI tool was used and how.',
          'PROHIBITION: Confidential data cannot be entered into publicly accessible AI systems without explicit authorization.',
          'TRAINING: Required for all state employees.',
        ],
      },
      {
        heading: 'What\'s coming:',
        body: 'In May 2025, Governor Hobbs established Arizona\'s first AI Steering Committee. SB 1600 (AI Consumer Protection) has a compliance deadline of January 1, 2027. This framework is tightening.',
        link: { label: 'Arizona AI Steering Committee →', href: 'https://az.gov/ai' },
      },
    ],
  },
  {
    id: 'prr',
    title: 'Public Records & AI',
    color: '#B91C1C',
    content: [
      {
        heading: 'Arizona Public Records Law — ARS §39-121',
        body: 'Arizona has one of the broadest public records laws in the country. Anything created in the course of government business is potentially subject to a public records request.',
        link: { label: 'Read ARS §39-121 →', href: 'https://www.azleg.gov/ars/39/00121.htm' },
      },
      {
        heading: 'AI prompts are already being requested.',
        body: 'Journalists have successfully obtained ChatGPT conversation logs from city officials through public records requests. Courts treated those prompts as disclosable government records. This has already happened.',
      },
      {
        heading: 'Personal devices are not a safe harbor.',
        body: 'Government employee communications on personal devices are subject to public records requests if they pertain to government business. If your personnel used free AI on their personal phone for department work, that prompt could be discoverable — and you have zero visibility into it.',
      },
      {
        heading: 'What to do:',
        bullets: [
          'Create policy: AI used for department business is an official communication.',
          'Adopt approved enterprise tools with audit logs.',
          'Prohibit personal AI tools for department business — same rule as personal email for official work.',
        ],
      },
    ],
  },
  {
    id: 'hipaa',
    title: 'HIPAA & AI',
    color: '#1E3A8A',
    content: [
      {
        heading: 'Free AI tools are not HIPAA compliant.',
        body: 'Free ChatGPT, free Gemini, free Claude, and consumer Copilot do not sign Business Associate Agreements (BAAs). The moment any Protected Health Information enters a prompt — a patient name, date of birth, medical condition, or incident address — that is a HIPAA violation.',
        link: { label: 'HHS HIPAA for Professionals →', href: 'https://www.hhs.gov/hipaa/for-professionals/index.html' },
      },
      {
        heading: 'The numbers:',
        bullets: [
          '57% of healthcare workers have used unauthorized AI tools with patient data.',
          '$1.2M — average HIPAA settlement in 2025.',
          'The 2025 HHS update to the HIPAA Security Rule now explicitly requires AI tools that touch patient data to be included in your organization\'s formal risk analysis.',
        ],
      },
      {
        heading: 'The scenario:',
        body: 'A medic uses free ChatGPT on their personal phone to draft a patient care narrative. That single act is a HIPAA violation, a potential Arizona state AI policy violation, training data for OpenAI\'s next model, and discoverable under a public records request.',
      },
      {
        heading: 'What to do:',
        bullets: [
          'Any AI tool touching patient data must sign a BAA before deployment.',
          'Adopt enterprise or purpose-built HIPAA-compliant tools for EMS documentation.',
          'Include AI tools in your HIPAA risk analysis — now legally required.',
        ],
        link: { label: '2025 HIPAA Security Rule Update →', href: 'https://www.hhs.gov/hipaa/for-professionals/security/index.html' },
      },
    ],
  },
  {
    id: 'framework',
    title: 'Adopt · Protect · Train',
    color: '#C9A23E',
    content: [
      {
        heading: 'ADOPT — Choose approved tools and require their use.',
        bullets: [
          'Select enterprise-grade, HIPAA-compliant tools for any use case touching patient, personnel, or operational data.',
          'Enterprise versions of every major AI platform (OpenAI, Microsoft, Google, Anthropic) have explicit data protections and can sign BAAs.',
          'Build an approved tools list. Keep it short. Keep it current.',
        ],
      },
      {
        heading: 'PROTECT — Create policy that governs what is and isn\'t allowed.',
        bullets: [
          'Prohibit use of non-approved AI tools for department business.',
          'Require personnel to use only approved tools for department purposes.',
          'Build AI into your records management, public records, and HIPAA risk analysis policies.',
        ],
      },
      {
        heading: 'TRAIN — You cannot enforce what people don\'t understand.',
        bullets: [
          'Personnel need to understand WHY the policy exists, not just what it says.',
          'Arizona ADOA P2000 already requires training — model your approach on that framework.',
          'Training must be ongoing. The landscape changes faster than any static program will capture.',
        ],
      },
    ],
  },
  {
    id: 'vendor',
    title: 'Vendor Questions to Ask',
    color: '#F5EDD6',
    content: [
      {
        heading: 'Before you sign anything, ask:',
        bullets: [
          'What data does this platform collect from our department?',
          'Where is it stored and who has access to it?',
          'Is our data used to train your AI model? Can we opt out?',
          'What happens to our data if your company is acquired?',
          'Are you HIPAA and CJIS compliant? Will you sign a BAA?',
          'What does the contract say about data ownership after the relationship ends?',
        ],
      },
    ],
  },
];

export default function ResourcesPage() {
  const [open, setOpen] = useState(null);

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">

      <div className="mb-8">
        <Link href="/" className="text-hmh-gold text-sm">← Back</Link>
        <h1 className="font-serif text-3xl text-hmh-cream mt-4 mb-1">Resources</h1>
        <p className="text-hmh-cream-dim text-sm">
          Everything covered in today&apos;s session. Yours to keep.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="bg-hmh-gray rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === section.id ? null : section.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold text-hmh-cream text-base" style={{ borderLeft: `3px solid ${section.color}`, paddingLeft: '12px' }}>
                {section.title}
              </span>
              <span className="text-hmh-gold text-xl ml-4">
                {open === section.id ? '−' : '+'}
              </span>
            </button>

            {open === section.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-hmh-gray-light pt-4">
                {section.content.map((block, i) => (
                  <div key={i}>
                    <p className="text-hmh-gold text-xs font-semibold uppercase tracking-wide mb-2">
                      {block.heading}
                    </p>
                    {block.body && (
                      <p className="text-hmh-cream text-sm leading-relaxed">{block.body}</p>
                    )}
                    {block.bullets && (
                      <ul className="space-y-2 mt-1">
                        {block.bullets.map((b, j) => (
                          <li key={j} className="text-hmh-cream text-sm leading-relaxed flex gap-2">
                            <span className="text-hmh-gold mt-1 flex-shrink-0">›</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.link && (
                      <a
                        href={block.link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 text-hmh-gold text-xs underline"
                      >
                        {block.link.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-hmh-gray-light text-center">
        <p className="text-hmh-cream-dim text-xs mb-3">Want to go deeper?</p>
        <a href="https://www.publicsafetyiq.ai" target="_blank" rel="noreferrer" className="text-hmh-gold text-sm underline">
          PublicSafetyIQ.ai →
        </a>
      </div>
    </main>
  );
}
