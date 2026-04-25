import os
import json
from typing import List, Dict, Any, TypedDict
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PyPDF2 import PdfReader
from io import BytesIO
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

load_dotenv()

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "alive", "model": "llama-3.3-70b-versatile"}

# --- LangGraph Setup ---

class AgentState(TypedDict):
    resume_text: str
    jd_text: str
    analysis: Dict[str, Any]
    questions: List[Dict[str, str]]
    answers: Dict[str, str]
    roadmap: Dict[str, Any]
    summary: str

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("CRITICAL: GROQ_API_KEY is not set in backend/.env")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=api_key or "placeholder"
)

def assess_skills_node(state: AgentState):
    prompt = f"""
    You are an AI Recruitment Specialist. Analyze this Resume and JD.
    
    Resume: {state['resume_text']}
    JD: {state['jd_text']}
    
    Extract matched skills, gaps, and skills to verify. Suggest 3-5 technical questions.
    Return JSON format:
    {{
      "analysis": {{ "matched": [], "gaps": [], "verify": [] }},
      "questions": [{{ "skill": "", "question": "" }}],
      "summary": ""
    }}
    """
    response = llm.invoke([SystemMessage(content="Return ONLY valid JSON. No markdown blocks."), HumanMessage(content=prompt)])
    
    try:
        # Clean response text from markdown code blocks if present
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        return {
            "analysis": data.get("analysis", {"matched": [], "gaps": [], "verify": []}),
            "questions": data.get("questions", []),
            "summary": data.get("summary", "Analysis complete.")
        }
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        return {
            "analysis": {"matched": [], "gaps": [], "verify": []}, 
            "questions": [{"skill": "General", "question": "Could you provide more details on your core technical skills?"}], 
            "summary": "Partial analysis completed due to formatting."
        }

def roadmap_node(state: AgentState):
    prompt = f"""
    Based on the assessment and interview answers, generate a learning plan.
    Answers: {json.dumps(state['answers'])}
    
    Return JSON format with overallScore, careerAdvice, and a list of skills with resources and timeEstimate.
    """
    response = llm.invoke([SystemMessage(content="Return ONLY JSON"), HumanMessage(content=prompt)])
    try:
        data = json.loads(response.content)
        return {"roadmap": data}
    except:
        return {"roadmap": {}}

# Build Graph
workflow = StateGraph(AgentState)
workflow.add_node("assess_skills", assess_skills_node)
workflow.add_node("generate_roadmap", roadmap_node)

workflow.set_entry_point("assess_skills")
workflow.add_edge("assess_skills", END) # For the first phase

# We'll manually invoke specific nodes or paths based on the API call
# Since LangGraph is stateful, we can also use it for the whole flow
agent = workflow.compile()

# --- FastAPI Routes ---

@app.post("/assess")
async def assess(resume: UploadFile = File(...), jd: str = Form(...)):
    print(f"--- New Assessment Request ---")
    try:
        # Parse PDF
        print(f"Parsing PDF: {resume.filename}")
        pdf_content = await resume.read()
        reader = PdfReader(BytesIO(pdf_content))
        resume_text = ""
        for page in reader.pages:
            resume_text += page.extract_text()
        
        if not resume_text.strip():
            print("Warning: Parsed resume text is empty.")
            
        # Run LangGraph
        print("Invoking LangGraph workflow...")
        result = agent.invoke({
            "resume_text": resume_text,
            "jd_text": jd,
            "analysis": {},
            "questions": [],
            "answers": {},
            "roadmap": {},
            "summary": ""
        })
        print("Workflow complete.")
        
        return {
            "analysis": result.get("analysis", {}),
            "questions": result.get("questions", []),
            "summary": result.get("summary", "")
        }
    except Exception as e:
        import traceback
        print("!!! ASSESSMENT ERROR !!!")
        print(traceback.format_exc())
        return {
            "error": str(e),
            "analysis": {"matched": [], "gaps": [], "verify": []},
            "questions": [{"skill": "Experience", "question": "Could you describe your overall technical background?"}],
            "summary": "The system encountered an error but let's proceed with a general assessment."
        }

@app.post("/roadmap")
async def roadmap(data: Dict[str, Any]):
    prompt = f"""
    You are an expert Career Coach.
    Initial Analysis: {json.dumps(data['initialData']['analysis'])}
    Interview Answers: {json.dumps(data['answers'])}
    JD: {data['jd']}
    
    Generate a JSON learning plan:
    {{
        "overallScore": 85,
        "careerAdvice": "...",
        "skills": [
            {{
                "skill": "React", 
                "proficiency": 70, 
                "gapType": "soft", 
                "timeEstimate": "1 week",
                "resources": [{{ "title": "...", "url": "...", "type": "video" }}]
            }}
        ]
    }}
    """
    response = llm.invoke([SystemMessage(content="Return ONLY valid JSON. No markdown blocks."), HumanMessage(content=prompt)])
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        print(f"Roadmap JSON Error: {e}")
        return {
            "overallScore": 50,
            "careerAdvice": "Could not generate detailed advice due to formatting.",
            "skills": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
