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
          'HHS has proposed the first major HIPAA Security Rule update in 20 years — AI tools touching patient data must now be included in your formal risk analysis.',
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
          'Include AI tools in your HIPAA risk analysis — now required under the proposed rule.',
        ],
        link: { label: 'Proposed HIPAA Security Rule Update — Federal Register →', href: 'https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information' },
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies, Consent & Your Data',
    color: '#C9A23E',
    content: [
      {
        heading: 'What a cookie actually is.',
        body: 'A cookie is a small text file dropped on your device the moment you visit a website. It sits there and reports back. It is not software — it is a tag that says "this person was here, here\'s what they did."',
      },
      {
        heading: 'What they actually track:',
        bullets: [
          'Your IP address — reveals your location and can identify your employer if you\'re on a work network.',
          'Your device fingerprint — a unique identifier built from your browser, screen, and settings. Cannot be deleted.',
          'Your behavioral profile — every click, scroll, search, and form field entry — including what you typed and deleted before hitting send.',
          'Your cross-site history — the same ad networks track you across thousands of websites simultaneously.',
        ],
      },
      {
        heading: 'Declining cookies doesn\'t stop everything.',
        body: 'Your IP address is logged before the banner appears. Your device fingerprint is visible regardless. If you\'re logged into Google or Meta in another tab, those platforms may still see your visit through other means.',
      },
      {
        heading: 'The fire department exposure:',
        body: 'Every time personnel use a work device to visit any website — vendor sites, training platforms, news — cookies track that device and IP. If the device is on your network, the IP traces back to your organization. Research into disciplinary cases, mental health resources, or legal matters is being logged and sold.',
      },
      {
        heading: 'What you agreed to when you signed a software contract:',
        bullets: [
          'Data sharing with all listed third parties — often dozens of vendors buried in the fine print.',
          'Your data can be used to train AI models by default.',
          'Your data transfers to any company that acquires the vendor. You agreed to that.',
          'Terms can change without individual notification.',
        ],
      },
      {
        heading: 'What to ask before signing any software contract:',
        bullets: [
          'Who are your sub-processors and what do they have access to?',
          'Is our data used to train your AI model? Can we opt out?',
          'What happens to our data if you are acquired?',
          'Will you sign a Data Processing Agreement (DPA)?',
        ],
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
  {
    id: 'news',
    title: 'AI Use Case Examples',
    color: '#3DAA6E',
    content: [
      {
        heading: 'Scientists are teaching AI to read human minds.',
        body: 'Researchers used fMRI brain scans and AI to reconstruct images people were imagining — not looking at. With 80% accuracy. This paper was published in 2023. The technology is moving faster than the policy.',
        link: { label: 'Newsweek: Scientists Teaching AI to Read Human Minds →', href: 'https://www.newsweek.com/scientists-teaching-ai-how-read-human-minds-1786961' },
      },
      {
        heading: 'China installed AI guards in prison cells.',
        body: 'Yancheng Prison implemented hidden cameras and sensors in every cell. AI generates daily behavioral and emotional reports on each prisoner using facial recognition. No independent outcome data has been released.',
        link: { label: 'Futurism: China Installing AI Guards in Prison Cells →', href: 'https://futurism.com/chinese-prison-ai-guards-cells' },
      },
      {
        heading: 'China\'s AI surveillance is accelerating.',
        body: 'A December 2025 CNN investigation found China\'s censorship and surveillance systems — already among the most extensive in the world — are being turbocharged by AI. The implications for democratic governments managing public safety data are significant.',
        link: { label: 'CNN: China\'s AI Surveillance Report →', href: 'https://www.cnn.com/2025/12/04/china/china-ai-censorship-surveillance-report-intl-hnk' },
      },
      {
        heading: 'The HIPAA Security Rule is being updated for the first time in 20 years.',
        body: 'HHS published a proposed rule in January 2025 that explicitly brings AI tools touching patient data into formal risk analysis requirements. Finalization expected in 2026. Read the full proposed rule here.',
        link: { label: 'Federal Register: Proposed HIPAA Security Rule Update →', href: 'https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information' },
      },
    ],
  },
  {
    id: 'stats',
    title: 'By the Numbers',
    color: '#C9A23E',
    content: [
      {
        heading: 'Firefighter Wellbeing',
        bullets: [
          '75% of IAFF member line-of-duty deaths in 2024 were due to occupational cancer.',
          '20% of firefighters and paramedics experience PTSD symptoms — compared to 6.8% of the general population.',
          '40% of professional firefighters face clinically substantial anxiety or depression.',
        ],
      },
      {
        heading: 'Sources — Firefighter Wellbeing',
        body: 'IAFF Line of Duty Death Database (2024) · FireRescue1 / IAFF PTSD Report · National Wellness Survey for Public Safety Personnel (PubMed, 2024)',
        link: { label: 'National Wellness Survey — PubMed →', href: 'https://pubmed.ncbi.nlm.nih.gov/39207367/' },
      },
      {
        heading: 'AI in the Workforce',
        bullets: [
          '95% of NFPA 2025 Conference attendees say they see a role for AI in their daily work.',
          '65% of employees say their employer has provided zero AI training.',
          '79% of employees across all industries feel unprepared to use AI at work.',
        ],
      },
      {
        heading: 'Sources — AI in the Workforce',
        body: 'NFPA 2025 Conference & Expo Survey · Bright Horizons EdAssist 2025 Education Index',
        link: { label: 'NFPA 2025 Survey →', href: 'https://www.nfpa.org/about-nfpa/press-room/news-releases/2025/new-nfpa-survey-spotlights-ai-adoption-training-trends-in-skilled-trades' },
      },
    ],
  },
  {
    id: 'disc-books',
    title: 'Go Deeper on DiSC',
    color: '#4A90D9',
    content: [
      {
        heading: 'Recommended reading:',
        bullets: [
          'Surrounded by Idiots — Thomas Erikson. The most accessible introduction to the four personality types. Widely read, immediately applicable. Start here.',
          'The 8 Dimensions of Leadership — Jeffrey Sugerman, Mark Scullard, Emma Wilhelm. Connects DiSC directly to leadership behavior. Built for people in command roles.',
          'Taking Flight! — Merrick Rosenberg & Daniel Silvert. Uses a bird metaphor (Eagle, Parrot, Dove, Owl) for the same four types. Strong for team communication.',
          'Everything DiSC — Wiley Publishing. The foundational academic text behind the assessment. More dense, more complete.',
        ],
      },
      {
        heading: 'The one thing DiSC won\'t tell you:',
        body: 'Your type is not your ceiling. It is your default. The leaders who do the most with DiSC are the ones who learn to recognize when their default isn\'t serving the room — and adjust. That is the whole exercise.',
      },
      {
        heading: 'Learn more about your style:',
        link: { label: 'DiSC Profile — Official Style Descriptions →', href: 'https://www.discprofile.com/what-is-disc/disc-styles' },
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
                    {block.heading && (
                      <p className="text-hmh-gold text-xs font-semibold uppercase tracking-wide mb-2">
                        {block.heading}
                      </p>
                    )}
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
