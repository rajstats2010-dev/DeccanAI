import { NextRequest, NextResponse } from "next/server";
import { groq, MODEL } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { initialData, answers, jd } = await req.json();

    const prompt = `
      You are an expert Career Coach and Technical Mentor.
      Based on the following data, generate a Personalized Learning Plan.
      
      Initial Analysis: ${JSON.stringify(initialData.analysis)}
      Interview Answers: ${JSON.stringify(answers)}
      Target Job Description: ${jd}
      
      Task:
      1. Calculate an "Overall Fit Score" (0-100).
      2. For each major skill gap or unverified skill, provide:
         - proficiency level (0-100) based on their answers.
         - gapType ("hard" if missing, "soft" if unverified, "adjacent" if related to JD).
         - timeEstimate (e.g. "2 weeks", "3 days").
         - 2-3 specific resources (YouTube or Course titles with placeholder URLs like https://youtube.com/search?q=...).
      3. Provide a brief "Career Advice" summary (max 3 sentences).
      
      Return ONLY a JSON object in this format:
      {
        "overallScore": 75,
        "careerAdvice": "...",
        "skills": [
          {
            "skill": "React Query",
            "proficiency": 40,
            "gapType": "hard",
            "timeEstimate": "1 week",
            "resources": [
              { "title": "React Query Crash Course", "url": "https://youtube.com/results?search_query=react+query+crash+course", "type": "video" }
            ]
          }
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      response_format: { type: "json_object" },
    });

    const roadmap = JSON.parse(chatCompletion.choices[0].message.content || "{}");

    return NextResponse.json(roadmap);
  } catch (error: any) {
    console.error("Roadmap Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
