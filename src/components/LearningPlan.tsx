"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, ExternalLink, GraduationCap, Star, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface SkillPlan {
  skill: string;
  proficiency: number;
  gapType: "hard" | "soft" | "adjacent";
  timeEstimate: string;
  resources: Resource[];
}

interface LearningPlanProps {
  plan: {
    skills: SkillPlan[];
    overallScore: number;
    careerAdvice: string;
  };
}

export default function LearningPlan({ plan }: LearningPlanProps) {
  return (
    <div className="w-full max-w-5xl space-y-12 pb-24">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 col-span-1 md:col-span-2 flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 text-secondary mb-2">
            <Target size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Target Achievement</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Your Personalized Roadmap</h2>
          <p className="text-foreground/60 leading-relaxed">
            {plan.careerAdvice}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 flex flex-col items-center justify-center text-center border-primary/20"
        >
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4}
                strokeDashoffset={364.4 * (1 - plan.overallScore / 100)}
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{plan.overallScore}%</span>
              <span className="text-[10px] text-foreground/40 font-bold uppercase">Fit Score</span>
            </div>
          </div>
          <p className="text-xs text-foreground/40 font-medium">Matching JD Requirements</p>
        </motion.div>
      </div>

      {/* Skills Roadmap */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="text-secondary" />
          Priority Skill Gaps
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.skills.map((skill, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 group hover:border-secondary/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block",
                    skill.gapType === "hard" ? "bg-accent/20 text-accent" : 
                    skill.gapType === "soft" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                  )}>
                    {skill.gapType} Gap
                  </div>
                  <h4 className="text-xl font-bold">{skill.skill}</h4>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs text-foreground/40 mb-1">
                    <Clock size={12} /> {skill.timeEstimate}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className={s <= (skill.proficiency / 20) ? "text-yellow-500 fill-yellow-500" : "text-white/10"} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-foreground/40 flex items-center gap-2 mb-2">
                  <BookOpen size={14} /> CURATED RESOURCES
                </div>
                {skill.resources.map((res, rIdx) => (
                  <a 
                    key={rIdx} 
                    href={res.url} 
                    target="_blank" 
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group/link"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background text-foreground/60">
                        {res.type === "video" ? <BookOpen size={14} /> : <GraduationCap size={14} />}
                      </div>
                      <span className="text-sm font-medium">{res.title}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass p-12 text-center bg-gradient-to-r from-primary/10 to-secondary/10"
      >
        <h3 className="text-2xl font-bold mb-4">Ready to close these gaps?</h3>
        <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
          This roadmap is dynamically generated based on your interview. Complete these tracks to increase your hiring probability by 40%.
        </p>
        <button className="btn-primary px-8 py-3 rounded-full font-bold">
          Export as PDF Roadmap
        </button>
      </motion.div>
    </div>
  );
}
