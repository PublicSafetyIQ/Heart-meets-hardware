// ─── DiSC QUESTIONS ──────────────────────────────────────────────────────────
// 16 standard DiSC-aligned questions. Each option maps to D, I, S, or C.
// Options are shuffled per question so no one letter always appears first.

export const discQuestions = [
  {
    id: 1,
    prompt: 'Which word best describes you?',
    options: [
      { text: 'Assertive',    type: 'D' },
      { text: 'Enthusiastic', type: 'I' },
      { text: 'Patient',      type: 'S' },
      { text: 'Precise',      type: 'C' },
    ],
  },
  {
    id: 2,
    prompt: 'When working with others, you tend to be:',
    options: [
      { text: 'Inspiring',    type: 'I' },
      { text: 'Analytical',   type: 'C' },
      { text: 'Decisive',     type: 'D' },
      { text: 'Supportive',   type: 'S' },
    ],
  },
  {
    id: 3,
    prompt: 'Under pressure, you become more:',
    options: [
      { text: 'Steady',    type: 'S' },
      { text: 'Cautious',  type: 'C' },
      { text: 'Direct',    type: 'D' },
      { text: 'Expressive',type: 'I' },
    ],
  },
  {
    id: 4,
    prompt: 'Others would describe you as:',
    options: [
      { text: 'Thorough',         type: 'C' },
      { text: 'Results-oriented', type: 'D' },
      { text: 'Optimistic',       type: 'I' },
      { text: 'Reliable',         type: 'S' },
    ],
  },
  {
    id: 5,
    prompt: 'In meetings, you tend to:',
    options: [
      { text: 'Listen carefully',        type: 'S' },
      { text: 'Drive the agenda',        type: 'D' },
      { text: 'Ask detailed questions',  type: 'C' },
      { text: 'Generate energy',         type: 'I' },
    ],
  },
  {
    id: 6,
    prompt: 'Your greatest strength is your ability to:',
    options: [
      { text: 'Motivate others',           type: 'I' },
      { text: 'Maintain high standards',   type: 'C' },
      { text: 'Make quick decisions',      type: 'D' },
      { text: 'Follow through consistently', type: 'S' },
    ],
  },
  {
    id: 7,
    prompt: 'When facing conflict, you:',
    options: [
      { text: 'Analyze both sides carefully', type: 'C' },
      { text: 'Address it head-on',           type: 'D' },
      { text: 'Seek a calm resolution',       type: 'S' },
      { text: 'Try to smooth things over',    type: 'I' },
    ],
  },
  {
    id: 8,
    prompt: 'You are most energized by:',
    options: [
      { text: 'Helping others succeed',   type: 'S' },
      { text: 'Achieving results',        type: 'D' },
      { text: 'Solving complex problems', type: 'C' },
      { text: 'Connecting with people',   type: 'I' },
    ],
  },
  {
    id: 9,
    prompt: 'Your natural communication style is:',
    options: [
      { text: 'Warm and enthusiastic', type: 'I' },
      { text: 'Bold and direct',       type: 'D' },
      { text: 'Precise and detailed',  type: 'C' },
      { text: 'Calm and sincere',      type: 'S' },
    ],
  },
  {
    id: 10,
    prompt: 'When starting a new project, you:',
    options: [
      { text: 'Research thoroughly before starting', type: 'C' },
      { text: 'Rally others to join you',            type: 'I' },
      { text: 'Jump in immediately',                 type: 'D' },
      { text: 'Make a careful plan first',           type: 'S' },
    ],
  },
  {
    id: 11,
    prompt: 'You are most frustrated when:',
    options: [
      { text: 'Standards are not met',        type: 'C' },
      { text: 'Things change too quickly',    type: 'S' },
      { text: 'Progress is too slow',         type: 'D' },
      { text: "There's no energy or buy-in",  type: 'I' },
    ],
  },
  {
    id: 12,
    prompt: 'Your team values you most for:',
    options: [
      { text: 'Keeping spirits high',  type: 'I' },
      { text: 'Getting things done',   type: 'D' },
      { text: 'Being dependable',      type: 'S' },
      { text: 'Catching mistakes',     type: 'C' },
    ],
  },
  {
    id: 13,
    prompt: 'In a leadership role, you focus on:',
    options: [
      { text: 'Systems, quality, and accuracy',      type: 'C' },
      { text: 'Building culture and enthusiasm',     type: 'I' },
      { text: 'Setting clear goals and expectations',type: 'D' },
      { text: 'Developing people and relationships', type: 'S' },
    ],
  },
  {
    id: 14,
    prompt: 'When you receive feedback, you:',
    options: [
      { text: 'Analyze it for accuracy',            type: 'C' },
      { text: 'Weigh it against your goals',        type: 'D' },
      { text: 'Take time to process it quietly',    type: 'S' },
      { text: 'Consider how it affects relationships', type: 'I' },
    ],
  },
  {
    id: 15,
    prompt: 'Your biggest work-related fear is:',
    options: [
      { text: 'Making mistakes or being wrong',   type: 'C' },
      { text: 'Being excluded or overlooked',     type: 'I' },
      { text: 'Losing control or authority',      type: 'D' },
      { text: 'Instability or sudden change',     type: 'S' },
    ],
  },
  {
    id: 16,
    prompt: 'When things go wrong, you:',
    options: [
      { text: 'Talk it through with the team',    type: 'I' },
      { text: 'Stay calm and work through it',    type: 'S' },
      { text: 'Take charge to fix it immediately',type: 'D' },
      { text: 'Review what went wrong and why',   type: 'C' },
    ],
  },
];

// ─── SCORING ─────────────────────────────────────────────────────────────────

export function calculateResult(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary   = sorted[0][0];
  const secondary = sorted[1][0];
  return { primary, secondary };
}

// ─── TYPE DESCRIPTIONS ───────────────────────────────────────────────────────
// All 12 meaningful primary/secondary blend combinations.

export const typeDescriptions = {
  'D': {
    name: 'Dominant',
    color: '#B91C1C',
    tagline: 'You lead with decisive action.',
    blends: {
      'I': {
        headline: 'The Commanding Visionary',
        description:
          "You combine decisive action with natural influence. You don't just know where you're going — you bring people with you. You move fast, you set the pace, and you have a gift for rallying a room. People follow you because of your energy and your confidence. The challenge for you is slowing down long enough to hear other perspectives before driving forward.",
        strengths: 'Decision-making under pressure, rallying people around a goal, driving results fast.',
        watchout: 'Can steamroll others — make space for the quiet voices in the room.',
      },
      'C': {
        headline: 'The High-Standards Driver',
        description:
          "You don't just want results — you want the right results. You combine relentless drive with an insistence on quality and accuracy. You hold yourself and everyone around you to a high standard. You're the chief who asks the hard question nobody else will ask and then goes and solves the problem. The challenge is that your standards can feel unreachable to others.",
        strengths: 'Holding the line on quality, strategic problem-solving, delivering under pressure.',
        watchout: 'Perfectionism can slow momentum — know when good enough is good enough.',
      },
      'S': {
        headline: 'The Tenacious Protector',
        description:
          "You are rare — a powerful combination of intensity and loyalty. You push hard for results, but you never leave your people behind in the process. Your team knows you will fight for them. You are the chief who runs toward the hard problem and stays until it's solved. The challenge is that you can carry too much yourself.",
        strengths: 'Relentless follow-through, fierce loyalty, calm in a sustained crisis.',
        watchout: "You absorb pressure that you should be distributing — you can't carry it all.",
      },
    },
  },
  'I': {
    name: 'Influential',
    color: '#C9A23E',
    tagline: 'You lead by inspiring others.',
    blends: {
      'D': {
        headline: 'The Energizing Force',
        description:
          "You are a natural leader who makes people want to follow. You bring the energy, the vision, and the drive. You can read a room instantly and shift your approach on the fly. People trust you because you're genuine, and they move because you're compelling. The challenge is staying focused — your enthusiasm can spread you too thin.",
        strengths: 'Rallying people quickly, selling an idea, creating momentum in a room.',
        watchout: "Your energy is contagious — make sure you're pointing it at the right thing.",
      },
      'S': {
        headline: "Everyone's Champion",
        description:
          "You are the leader who builds people up. You create cultures where people feel seen and valued, and your team will run through walls for you because they know you mean it. You bring the warmth and the follow-through — the combination that builds lasting trust. The challenge is that you can absorb too much conflict to protect others.",
        strengths: 'Building trust, developing people, creating a team culture people want to be part of.',
        watchout: "You take on other people's stress to keep the peace — some conflict is worth having.",
      },
      'C': {
        headline: 'The Credible Communicator',
        description:
          "You are rare and powerful — you can sell the vision AND back it up with data. You bring people in with your enthusiasm and then keep them with your credibility. You translate complex information into compelling communication. Chiefs and city councils alike trust you. The challenge is that you can overthink before acting.",
        strengths: 'Presenting complex ideas clearly, building credibility, persuading skeptics.',
        watchout: "Your instinct to verify everything before speaking can cost you in fast-moving situations.",
      },
    },
  },
  'S': {
    name: 'Steady',
    color: '#1E3A8A',
    tagline: 'You lead through trust and consistency.',
    blends: {
      'I': {
        headline: 'The Warm Anchor',
        description:
          "You create environments where people feel genuinely safe. You are the steady presence in every storm — calm, consistent, and deeply connected to the people around you. Your team doesn't just respect you, they trust you with the things that matter to them. The challenge is that your natural desire to keep the peace can lead you to avoid necessary conversations.",
        strengths: 'Building deep loyalty, creating psychological safety, sustaining team culture over time.',
        watchout: 'Difficult conversations don\'t go away when you avoid them — they get worse.',
      },
      'C': {
        headline: 'The Backbone',
        description:
          "You are the person an organization can build on. Reliable, accurate, consistent under pressure — you set the standard and then maintain it, quietly, every single time. Departments with leaders like you don't have drama. They have results. The challenge is that your preference for stability can make you resistant to changes that are actually necessary.",
        strengths: 'Operational reliability, quality control, sustained performance under pressure.',
        watchout: "Not all change is a threat — sometimes the steady path is the one that's been updated.",
      },
      'D': {
        headline: 'The Quiet Force',
        description:
          "You make things happen without making noise about it. You are consistent, determined, and deeply committed to delivering. Where others burn bright and burn out, you sustain. Your team knows that if you said it will get done, it will get done. The challenge is that your quiet strength can be overlooked — and you need to advocate for yourself more than feels natural.",
        strengths: 'Long-term execution, reliability under sustained pressure, delivering without drama.',
        watchout: "Your contributions are real — make sure the people above you can see them.",
      },
    },
  },
  'C': {
    name: 'Conscientious',
    color: '#F5EDD6',
    tagline: 'You lead through precision and standards.',
    blends: {
      'S': {
        headline: 'The Trusted Standard-Bearer',
        description:
          "You are the person organizations trust with the things that matter most. Precise, reliable, and deeply committed to doing it right — you set the standard and you hold it. You are the chief who catches what everyone else misses, and who does it without making people feel small. The challenge is that your caution can slow momentum when speed is needed.",
        strengths: 'Quality assurance, risk management, building systems that last.',
        watchout: "Sometimes the cost of waiting for perfect is worse than the cost of moving with good.",
      },
      'D': {
        headline: 'The Decisive Expert',
        description:
          "You don't just find the right answer — you act on it. You combine high standards with the confidence to move. You're the chief who does the analysis, makes the call, and holds the line. People come to you when the stakes are highest because they know you'll be right and you'll be ready. The challenge is impatience with people who move more slowly.",
        strengths: 'High-stakes decision-making, maintaining standards under pressure, strategic clarity.',
        watchout: "Your pace is not everyone's pace — and the people who move slower often catch things you miss.",
      },
      'I': {
        headline: 'The Compelling Expert',
        description:
          "You are a rare combination — the person who knows the details and can make them matter to an audience. You translate complexity into clarity and skeptics into supporters. You're the chief who can present to city council, brief the media, and debrief the crew — and hit the right note every time. The challenge is that your desire to be accurate can make you over-prepare.",
        strengths: 'Technical communication, building credibility with diverse audiences, translating data into decisions.',
        watchout: 'You can prepare yourself past the point of confidence — at some point you know enough to go.',
      },
    },
  },
};

// Get the description for a primary/secondary blend
export function getBlendDescription(primary, secondary) {
  const primaryData = typeDescriptions[primary];
  if (!primaryData) return null;
  const blend = primaryData.blends[secondary];
  return {
    primaryName:   primaryData.name,
    primaryColor:  primaryData.color,
    primaryTagline: primaryData.tagline,
    ...blend,
  };
}

// ─── DISC WHEEL POSITIONING ──────────────────────────────────────────────────
// Places a dot on the DiSC wheel based on scores.
// Axes: horizontal = task (left) vs people (right)
//       vertical   = assertive/fast (top) vs moderate/reflective (bottom)
// D = top-left, I = top-right, S = bottom-right, C = bottom-left

export function getDotPosition(scores, cx, cy, radius) {
  const total = scores.d + scores.i + scores.s + scores.c;
  if (total === 0) return { x: cx, y: cy };

  // People-focused (I, S) vs task-focused (D, C) → horizontal
  const xRaw = ((scores.i + scores.s) - (scores.d + scores.c)) / total;
  // Assertive (D, I) vs reflective (S, C) → vertical (negated for SVG coords)
  const yRaw = -((scores.d + scores.i) - (scores.s + scores.c)) / total;

  return {
    x: cx + xRaw * radius * 0.85,
    y: cy + yRaw * radius * 0.85,
  };
}

// ─── STATS POLL QUESTIONS ────────────────────────────────────────────────────

export const statsQuestions = [
  {
    id: 'stats_1',
    question:
      'What percentage of fire service leaders say they want more AI and technology training for their department?',
    options: ['Under 25%', '25–50%', '51–75%', 'Over 75%'],
    answer: 'Over 75%',
    reveal: '95% of fire service leaders want more training — but only 65% believe their people could actually apply it today. That gap is the problem.',
  },
  {
    id: 'stats_2',
    question:
      'What percentage of employees across all industries feel unprepared to use AI at work?',
    options: ['Under 25%', '25–50%', '51–75%', 'Over 75%'],
    answer: 'Over 75%',
    reveal:
      '79% of employees feel unprepared to use AI at work. You\'ve been in this room for part of this session. That number just got a little smaller for you.',
  },
  {
    id: 'stats_3',
    question:
      'What percentage of healthcare workers — including EMS — have used unauthorized AI tools with patient data?',
    options: ['Under 20%', '20–40%', '41–60%', 'Over 60%'],
    answer: '41–60%',
    reveal:
      '57%. More than half. And the average HIPAA settlement in 2025 was $1.2M. This is not a theoretical risk.',
  },
  {
    id: 'stats_4',
    question: 'What percentage of AI recruitment tools replicate discriminatory hiring patterns?',
    options: ['Under 20%', '21–40%', '41–60%', 'Over 60%'],
    answer: 'Over 60%',
    reveal:
      '61%. Trained on historical data that reflects past patterns of exclusion, these tools repeat those patterns at scale — faster than any human could.',
  },
];
