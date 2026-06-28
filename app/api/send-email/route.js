import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, primary, secondary, blend, scores } = await request.json();

    const { error } = await resend.emails.send({
      from:    'Ashley Losch <ashley@publicsafetyiq.ai>',
      to:      [email],
      subject: `Your DiSC Results — ${blend.headline} (${primary}/${secondary})`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { background: #0D0D0D; color: #F5EDD6; font-family: Georgia, serif; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .label { color: #C9A23E; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: system-ui, sans-serif; }
    .headline { font-size: 28px; color: #F5EDD6; margin: 8px 0 4px; }
    .tagline { color: #C9A23E; font-size: 14px; font-style: italic; }
    .divider { border: none; border-top: 1px solid #C9A23E; margin: 24px 0; opacity: 0.4; }
    .body-text { font-size: 15px; line-height: 1.7; color: #F5EDD6; }
    .card { background: #1A1A1A; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .card-label { color: #C9A23E; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-family: system-ui, sans-serif; margin-bottom: 8px; }
    .card-text { font-size: 14px; line-height: 1.6; color: #F5EDD6; font-family: system-ui, sans-serif; }
    .scores { display: flex; gap: 16px; justify-content: center; margin: 20px 0; }
    .score-item { text-align: center; }
    .score-num { font-size: 28px; font-weight: bold; }
    .score-ltr { font-size: 12px; color: #B8A98A; font-family: system-ui, sans-serif; margin-top: 4px; }
    .link { color: #C9A23E; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #2A2A2A; text-align: center; font-family: system-ui, sans-serif; font-size: 12px; color: #8B7355; }
  </style>
</head>
<body>
<div class="container">
  <p class="label">Heart Meets Hardware</p>

  <hr class="divider"/>

  <p class="label">Your Communication Style</p>
  <h1 class="headline">${blend.headline}</h1>
  <p class="tagline">${primary} primary · ${secondary} secondary</p>
  <p class="tagline">${blend.primaryTagline}</p>

  <hr class="divider"/>

  <p class="body-text">${blend.description}</p>

  <div class="card">
    <p class="card-label">Your Strengths</p>
    <p class="card-text">${blend.strengths}</p>
  </div>

  <div class="card">
    <p class="card-label" style="color:#B91C1C;">Watch Out For</p>
    <p class="card-text">${blend.watchout}</p>
  </div>

  <div class="card">
    <p class="card-label">Your Score Breakdown</p>
    <div class="scores">
      <div class="score-item">
        <div class="score-num" style="color:#B91C1C;">${scores.D}</div>
        <div class="score-ltr">D</div>
      </div>
      <div class="score-item">
        <div class="score-num" style="color:#C9A23E;">${scores.I}</div>
        <div class="score-ltr">I</div>
      </div>
      <div class="score-item">
        <div class="score-num" style="color:#4A7FD4;">${scores.S}</div>
        <div class="score-ltr">S</div>
      </div>
      <div class="score-item">
        <div class="score-num" style="color:#D4C5A9;">${scores.C}</div>
        <div class="score-ltr">C</div>
      </div>
    </div>
  </div>

  <hr class="divider"/>

  <div class="card">
    <p class="card-label">What is DiSC?</p>
    <p class="card-text">
      DiSC is a research-backed personality model used by millions of professionals worldwide to understand communication styles, improve teamwork, and reduce conflict. It is not about putting people in a box — it is about understanding how you naturally show up and how to flex your style for others.
    </p>
    <p style="margin-top:12px;">
      <a href="https://www.discprofile.com/what-is-disc/disc-styles" class="link" style="font-family:system-ui,sans-serif;font-size:13px;">Learn more about the four DiSC styles →</a>
    </p>
  </div>

  <div class="card" style="margin-top:4px;">
    <p class="card-label">Take the Full Assessment</p>
    <p class="card-text">
      Today you took an abbreviated version. The official DiSC assessment goes deeper — a full personalized report with detailed strategies for working with every other style. You can purchase an individual profile directly through the publisher.
    </p>
    <p style="margin-top:12px;">
      <a href="https://www.discprofile.com" class="link" style="font-family:system-ui,sans-serif;font-size:13px;">Take the full DiSC assessment at discprofile.com →</a>
    </p>
  </div>

  <div class="card" style="margin-top:4px;">
    <p class="card-label">Bring DiSC Training to Your Department</p>
    <p class="card-text">
      Ashley offers DiSC-based communication training designed specifically for fire and EMS agencies. If you want your team to understand each other the way you started to today, reach out.
    </p>
    <p style="margin-top:12px;">
      <a href="mailto:ashley@publicsafetyiq.ai" class="link" style="font-family:system-ui,sans-serif;font-size:13px;">Contact Ashley → ashley@publicsafetyiq.ai</a>
    </p>
  </div>

  <div class="footer">
    <p>Presented by <strong style="color:#C9A23E;">Ashley Losch</strong></p>
    <p><a href="https://www.publicsafetyiq.ai" class="link">PublicSafetyIQ.ai</a></p>
    <p style="margin-top:8px;">
      <a href="https://a.co/d/0gFjfc7T" class="link">Get the Book: Don't Let AI Make Your Department Dumber</a>
    </p>
    <p style="margin-top:8px;">
      Questions? <a href="mailto:ashley@publicsafetyiq.ai" class="link">ashley@publicsafetyiq.ai</a>
    </p>
  </div>
</div>
</body>
</html>
      `,
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
