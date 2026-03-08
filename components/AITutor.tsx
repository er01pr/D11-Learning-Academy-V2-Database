import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User as UserIcon, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { initializeChat, sendMessageToGemini } from '../services/geminiService';
import { Lesson, ChatMessage, User } from '../types';

interface AITutorProps {
  lesson: Lesson;
  user: User;
}

const AITutor: React.FC<AITutorProps> = ({ lesson, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = initializeChat(lesson.title, lesson.summary);
    if (!session) {
      setIsApiKeyMissing(true);
    } else {
      setIsApiKeyMissing(false);
      setMessages([{ 
        role: 'model', 
        text: `Hello ${user.name.split(' ')[0]}! I'm your AI Tutor for "${lesson.title}". Do you have any questions about this video or the concepts covered?` 
      }]);
    }
  }, [lesson, user.name]);

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
      setMessages(prev => [...prev, { role: 'model', text: "" }]);
      const stream = await sendMessageToGemini(userMessage);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'model') lastMsg.text = fullResponse;
            return newHistory;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error processing request.", isError: true }]);
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
    <div className="bg-white rounded-3xl shadow-soft border border-fwd-grey overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 bg-fwd-green text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-fwd-orange" />
          <div>
            <h3 className="font-semibold text-sm">AI Learning assistant</h3>
            <p className="text-[10px] text-white/60">Powered by Gemini 3</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-fwd-grey/20">
        {isApiKeyMissing && (
             <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg text-red-700 text-sm border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>API Key missing.</p>
            </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-fwd-grey bg-white">
              {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-fwd-orange" /> : <Bot className="w-5 h-5 text-fwd-green" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-fwd-orange text-white' : 'bg-white border border-fwd-grey text-fwd-green'}`}>
              {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 className="w-3 h-3 animate-spin text-fwd-green" /> : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-fwd-grey">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this lesson..."
            disabled={isLoading || isApiKeyMissing}
            className="w-full pr-12 pl-4 py-3 bg-fwd-grey/30 border border-fwd-grey rounded-xl focus:outline-none focus:ring-2 focus:ring-fwd-orange text-sm text-fwd-green placeholder-fwd-green/40"
          />
          <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-fwd-orange hover:bg-fwd-orange-20 rounded-lg transition-colors"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;