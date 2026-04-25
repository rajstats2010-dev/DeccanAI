"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  skill: string;
  question: string;
}

interface AssessmentChatProps {
  initialData: {
    analysis: {
      matched: string[];
      gaps: string[];
      verify: string[];
    };
    questions: Question[];
    summary: string;
  };
  onComplete: (answers: any) => void;
}

export default function AssessmentChat({ initialData, onComplete }: AssessmentChatProps) {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; content: string }[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    // Initial bot message
    setMessages([
      { 
        role: "bot", 
        content: `Hi there! I've analyzed your profile against the JD. You're a strong match in ${initialData?.analysis?.matched?.length || 0} areas. To finalize your assessment, I have a few specific questions. Let's start!` 
      },
      { 
        role: "bot", 
        content: initialData?.questions?.[0]?.question || "Could you tell me more about your technical experience relevant to this role?"
      }
    ]);
  }, [initialData]);

  const handleSend = () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: userInput }];
    setMessages(newMessages);
    
    const currentQuestion = initialData?.questions?.[currentQuestionIdx];
    if (!currentQuestion) return;

    const currentSkill = currentQuestion.skill;
    setAnswers(prev => ({ ...prev, [currentSkill]: userInput }));
    
    setUserInput("");

    // Next question or finish
    if (currentQuestionIdx < initialData.questions.length - 1) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { role: "bot", content: initialData.questions[currentQuestionIdx + 1].question }
        ]);
        setCurrentQuestionIdx(prev => prev + 1);
      }, 1000);
    } else {
      setIsFinishing(true);
      setTimeout(() => {
        onComplete(answers);
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-3xl glass flex flex-col h-[600px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Skill Assessor</h3>
            <p className="text-xs text-foreground/40">Verifying Proficiency • Live</p>
          </div>
        </div>
        <div className="flex gap-1">
          {initialData?.questions?.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-8 h-1 rounded-full transition-colors",
                i <= currentQuestionIdx ? "bg-primary" : "bg-white/10"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3 max-w-[80%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "user" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
              )}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-secondary text-white rounded-tr-none" 
                  : "glass text-foreground/80 rounded-tl-none border-white/5"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isFinishing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-4 text-primary text-sm font-bold"
          >
            <Sparkles className="animate-pulse" size={18} />
            GENERTATING LEARNING PLAN...
          </motion.div>
        )}
      </div>

      {/* Input */}
      {!isFinishing && (
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="relative flex items-center">
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-primary/50 transition-all"
              placeholder="Type your response..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 p-3 bg-primary rounded-xl text-white hover:scale-105 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-foreground/20 mt-3 text-center uppercase tracking-widest font-bold">
            Powered by Catalyst Logic Engine
          </p>
        </div>
      )}
    </div>
  );
}
