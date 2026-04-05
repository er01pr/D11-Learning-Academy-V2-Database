import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

export const initializeChat = (lessonTitle: string, lessonSummary: string) => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found. AI features will be disabled.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are the "Aquila11 Financial Academy AI Tutor".
    Your goal is to help financial advisors understand the training material.
    
    Current Lesson Context:
    Title: "${lessonTitle}"
    Summary: "${lessonSummary}"
    
    Guidelines:
    1. Answer questions specifically about the current lesson topic.
    2. If the user asks about general financial concepts, explain them simply.
    3. Keep answers professional, encouraging, and concise (under 150 words).
    4. Do not provide specific financial advice for real-life clients; this is a training simulation.
    5. If asked about things unrelated to finance or the lesson, politely steer back to the topic.
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<string>> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  // Use streaming for a responsive UI
  const result = await chatSession.sendMessageStream({ message });
  
  // Return an async iterable that yields text chunks
  return (async function* () {
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  })();
};