import OpenAI from "openai";

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

// Using Llama 3.3 70B for the best balance of reasoning and speed
export const MODEL = "llama-3.3-70b";
