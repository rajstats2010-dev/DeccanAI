"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, ArrowRight, CheckCircle2, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AssessmentChat from "@/components/AssessmentChat";
import LearningPlan from "@/components/LearningPlan";

type AppState = "IDLE" | "ANALYZING" | "CHAT" | "PLANNING" | "RESULT";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState<string>("");
  const [state, setState] = useState<AppState>("IDLE");
  
  const [initialData, setInitialData] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  const handleStartAssessment = async () => {
    if (!resume || !jd) return;
    setState("ANALYZING");

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jd", jd);

      const res = await fetch("http://localhost:8000/assess", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setInitialData(data);
      setState("CHAT");
    } catch (error) {
      console.error("Assessment failed", error);
      setState("IDLE");
    }
  };

  const handleChatComplete = async (answers: any) => {
    setState("PLANNING");
    
    try {
      const res = await fetch("http://localhost:8000/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          initialData, 
          answers,
          jd 
        }),
      });
      const data = await res.json();
      setRoadmap(data);
      setState("RESULT");
    } catch (error) {
      console.error("Roadmap generation failed", error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 md:p-24 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {state === "IDLE" && (
          <motion.main 
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="z-10 w-full max-w-5xl flex flex-col items-center gap-12"
          >
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary mb-4">
                <Sparkles size={16} />
                <span className="text-xs font-bold tracking-widest uppercase">AI-Powered Skill Validation</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                CATALYST <span className="text-primary italic">AGENT</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                Move beyond what you claim. Conversationally assess your real proficiency, 
                identify skill gaps, and get a tailored roadmap to your next role.
              </p>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="glass p-8 flex flex-col gap-6 relative group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">Your Resume</h2>
                </div>
                <label className={cn(
                  "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 cursor-pointer transition-all hover:bg-white/5",
                  resume ? "border-primary/50 bg-primary/5" : ""
                )}>
                  <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResume(e.target.files?.[0] || null)} />
                  <Upload className={cn("mb-4", resume ? "text-primary" : "text-white/20")} size={32} />
                  <p className="text-sm text-foreground/40 text-center">{resume ? resume.name : "Upload PDF Resume"}</p>
                  {resume && <div className="mt-4 flex items-center gap-2 text-primary text-xs font-bold"><CheckCircle2 size={14} /> READY</div>}
                </label>
              </div>

              <div className="glass p-8 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Sparkles size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">Job Description</h2>
                </div>
                <textarea 
                  className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground/80 placeholder:text-foreground/20 focus:outline-none focus:border-secondary/50 min-h-[160px] resize-none"
                  placeholder="Paste target Job Description..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={!resume || !jd}
              onClick={handleStartAssessment}
              className={cn("group px-12 py-5 rounded-full font-bold text-lg transition-all", (!resume || !jd) ? "opacity-50 grayscale cursor-not-allowed" : "btn-primary")}
            >
              Start Skill Assessment
            </button>
          </motion.main>
        )}

        {state === "ANALYZING" && (
          <motion.div key="analyzing" className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Bot className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Analyzing Skill Gaps...</h2>
              <p className="text-foreground/40">Gemini is cross-referencing your resume with JD requirements.</p>
            </div>
          </motion.div>
        )}

        {state === "CHAT" && initialData && (
          <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AssessmentChat initialData={initialData} onComplete={handleChatComplete} />
          </motion.div>
        )}

        {state === "PLANNING" && (
          <motion.div key="planning" className="flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            <div className="text-center">
              <h2 className="text-2xl font-bold">Synthesizing Learning Plan...</h2>
              <p className="text-foreground/40">Finding curated resources for identified gaps.</p>
            </div>
          </motion.div>
        )}

        {state === "RESULT" && roadmap && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LearningPlan plan={roadmap} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 text-foreground/20 text-[10px] uppercase tracking-widest font-bold">
        Built for Catalyst • Catalyst Agent v1.0
      </footer>
    </div>
  );
}
