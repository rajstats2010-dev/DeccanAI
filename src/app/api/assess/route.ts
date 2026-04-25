import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/resume-parser";
import { groq, MODEL } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;
    const jd = formData.get("jd") as string;

    if (!resumeFile || !jd) {
      return NextResponse.json({ error: "Missing resume or JD" }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeText = await parseResume(buffer);

    const prompt = `
      You are an AI Recruitment Specialist and Skill Assessor.
      Analyze the following Resume and Job Description (JD).
      
      Resume:
      """${resumeText}"""
      
      Job Description:
      """${jd}"""
      
      Task:
      1. Extract a list of required skills from the JD.
      2. Compare them against the Resume.
      3. Categorize them into:
         - "matched": Skills explicitly mentioned in the resume with evidence.
         - "gaps": Skills required by the JD but missing from the resume.
         - "verify": Skills mentioned in the resume but lacking depth or proficiency details.
      4. Suggest 3-5 technical questions to ask the candidate to "verify" the 'verify' or 'gap' skills.
      
      Return ONLY a JSON object in this format:
      {
        "analysis": {
          "matched": ["skill1", "skill2"],
          "gaps": ["skill3", "skill4"],
          "verify": ["skill5"]
        },
        "questions": [
          { "skill": "skill3", "question": "..." },
          { "skill": "skill5", "question": "..." }
        ],
        "summary": "Brief overall fit assessment (max 2 sentences)."
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(chatCompletion.choices[0].message.content || "{}");

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Assessment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
