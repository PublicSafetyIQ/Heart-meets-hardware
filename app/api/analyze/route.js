import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { discData, sessionId } = await req.json();

    const counts = { D: 0, I: 0, S: 0, C: 0 };
    discData.forEach(r => {
      if (r.primary_type && counts[r.primary_type] !== undefined) counts[r.primary_type]++;
    });
    const total = discData.length;
    const pct = t => (total ? Math.round(counts[t] / total * 100) : 0);

    const distributionText = `D (Dominant): ${counts.D} respondents (${pct('D')}%)
I (Influential): ${counts.I} respondents (${pct('I')}%)
S (Steady): ${counts.S} respondents (${pct('S')}%)
C (Conscientious): ${counts.C} respondents (${pct('C')}%)
Total respondents: ${total}`;

    const prompt = `You have the personality distribution data from a room of fire service leaders attending a conference. The distribution across DiSC styles is as follows:

${distributionText}

Scenario: A Fire Chief needs to announce a difficult organizational change: Mandatory annual mental health check-ins will be required for all personnel.

Using the personality distribution shown in this room, complete the following.

1. Hold Up the Mirror
Analyze this leadership group. Be candid, objective, and respectful. Avoid generic praise. Base your observations on the personality distribution as a whole, not stereotypes about individual DiSC styles. Explain:
- How this group naturally communicates difficult messages.
- What they instinctively lead with.
- What they unintentionally leave out.
- Which personalities will naturally connect with their communication style.
- Which personalities may feel overlooked or resistant.
The goal is leadership self-awareness.

2. Translate the Message
Create a section for each primary DiSC style (D, I, S, and C). For each style include:
- Communication Superpower: What they naturally do well.
- Natural Blind Spot: What they unintentionally overlook because it doesn't naturally occur to them.
- How Others Experience Them: How each of the other three DiSC styles is likely to interpret their communication. Focus on perception rather than intention.
- Translation Guide: Without changing the message or their personality, how should they adjust their delivery so each of the other three DiSC styles is more likely to hear, understand, and trust what they're saying? Provide one practical example for communicating with each style.
- Leadership Stretch: What is the single communication habit this personality should intentionally practice because it doesn't come naturally, but would significantly improve trust across the organization?
Keep each section concise, practical, and immediately usable. Focus on improving understanding, not changing personalities.

3. Build the Message
Write one announcement that effectively communicates this change to all DiSC styles simultaneously. The announcement should intentionally provide:
- Confidence and direction for the D
- Humanity and connection for the I
- Reassurance and stability for the S
- Facts, reasoning, and transparency for the C
without feeling like multiple messages stitched together.

Write the announcement so that each DiSC style would feel the message was written with them in mind.

After the announcement, briefly explain how the message was intentionally layered so leaders can apply the same approach to future difficult conversations. Highlight the specific sentence or phrase that primarily serves each DiSC style and explain why.

The goal is not to change the message. The goal is to remove the barriers that prevent different people from hearing, understanding, and trusting the same message.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0].text;

    await supabase.from('disc_analysis').insert({ session_id: sessionId, content });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
