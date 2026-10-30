import { NextResponse } from "next/server";

const roles = [
  { title: "Product Manager", focus: "Turn the objective into clear requirements, user stories, and acceptance criteria." },
  { title: "Business Analyst", focus: "Identify business assumptions, risks, and success measures." },
  { title: "Software Engineer", focus: "Propose a practical implementation plan and key technical decisions. Do not claim code was written." },
  { title: "QA Engineer", focus: "Create a focused test strategy and call out edge cases." },
];

export async function POST(request: Request) {
  let body: { objective?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const objective = typeof body.objective === "string" ? body.objective.trim() : "";
  if (objective.length < 8 || objective.length > 1200) {
    return NextResponse.json({ error: "Objective must be between 8 and 1,200 characters." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI execution is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });
  }

  const reports: { role: string; content: string }[] = [];
  for (const role of roles) {
    let response: Response;
    try {
      const handoff = reports.length
        ? `\n\nPrior specialists' drafts for you to review and build on:\n${reports.map(report => `### ${report.role}\n${report.content}`).join("\n\n")}`
        : "";
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: `You are the ${role.title} in a small business AI workforce. ${role.focus} Keep the response concise, concrete, and honest about uncertainty. This output is a proposal for human review.` },
            { role: "user", content: `Business objective:\n${objective}${handoff}` },
          ],
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch {
      return NextResponse.json({ error: `The AI provider request for ${role.title} timed out or could not connect.` }, { status: 502 });
    }
    if (!response.ok) {
      const message = response.status === 429 ? "The AI provider rate limit was reached. Try again shortly." : `The AI provider returned HTTP ${response.status}.`;
      return NextResponse.json({ error: message }, { status: 502 });
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return NextResponse.json({ error: `${role.title} returned no deliverable.` }, { status: 502 });
    reports.push({ role: role.title, content });
  }
  return NextResponse.json({ objective, reports, requiresHumanReview: true });
}
