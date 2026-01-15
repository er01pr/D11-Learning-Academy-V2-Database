import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { initializeChat, sendMessageToGemini } from '../services/geminiService';
import { Lesson, ChatMessage } from '../types';

interface AITutorProps {
  lesson: Lesson;
}

const AITutor: React.FC<AITutorProps> = ({ lesson }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when lesson changes
    const session = initializeChat(lesson.title, lesson.summary);
    if (!session) {
      setIsApiKeyMissing(true);
    } else {
      setIsApiKeyMissing(false);
      setMessages([{ 
        role: 'model', 
        text: `Hello! I'm your AI Tutor for "${lesson.title}". Do you have any questions about this video or the concepts covered?` 
      }]);
    }
  }, [lesson]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isApiKeyMissing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let fullResponse = "";
      
      // Optimistically add an empty model message we will update
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      const stream = await sendMessageToGemini(userMessage);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'model') {
                lastMsg.text = fullResponse;
            }
            return newHistory;
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error while processing your request. Please try again.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-corporate-900 to-corporate-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold">AI Learning Assistant</h3>
        </div>
        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">Gemini 2.5 Flash</span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isApiKeyMissing && (
             <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg text-red-700 text-sm border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>API Key missing. Please configure <code>process.env.API_KEY</code> to enable the AI Tutor.</p>
            </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-corporate-100 text-corporate-800' : 'bg-white border border-gray-200 text-purple-600'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-corporate-500 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm'
            } ${msg.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}`}>
              {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin opacity-50" /> : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isApiKeyMissing ? "AI chat disabled..." : "Ask about this lesson..."}
            disabled={isLoading || isApiKeyMissing}
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-corporate-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isApiKeyMissing}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-corporate-500 hover:bg-corporate-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI can make mistakes. Please verify important financial details.
        </p>
      </div>
    </div>
  );
};

export default AITutor;
