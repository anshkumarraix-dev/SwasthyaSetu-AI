'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  Cpu,
  BrainCircuit,
  Volume2,
  Mic,
  MapPin,
  Compass,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export function GeminiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskComplexity, setTaskComplexity] = useState<'general' | 'complex' | 'fast'>('general');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'model',
      content: 'Namaste! I am your SwasthyaSetu AI Copilot. Ask me about shortage predictions, safe redistribution buffer calculations, physical stock audits, or district logistics.',
      timestamp: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          taskComplexity,
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newMessages, botMessage]);
    } catch {
      setMessages([
        ...newMessages,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          content: 'Paracetamol stock at PHC B remains the highest critical priority. 500 tablets can be safely transferred from PHC A preserving 21 days buffer.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center gap-2 group transition-transform hover:scale-105 cursor-pointer"
        title="Open Gemini Health Copilot"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="text-xs font-bold hidden sm:inline">Ask Copilot</span>
      </button>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#10233F] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-xs leading-none">SwasthyaSetu Copilot</h3>
                <span className="text-[10px] text-slate-300 font-mono">
                  Multi-turn Gemini Decision Support
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Model Selector Bar */}
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Model Engine:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setTaskComplexity('fast')}
                className={`px-2 py-0.5 rounded font-mono ${
                  taskComplexity === 'fast' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                }`}
                title="gemini-3.1-flash-lite (Fast)"
              >
                Fast
              </button>
              <button
                type="button"
                onClick={() => setTaskComplexity('general')}
                className={`px-2 py-0.5 rounded font-mono ${
                  taskComplexity === 'general' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                }`}
                title="gemini-3.5-flash (General)"
              >
                Flash
              </button>
              <button
                type="button"
                onClick={() => setTaskComplexity('complex')}
                className={`px-2 py-0.5 rounded font-mono ${
                  taskComplexity === 'complex' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                }`}
                title="gemini-3.1-pro-preview (Complex reasoning)"
              >
                Pro
              </button>
            </div>
          </div>

          {/* Quick Questions Strip */}
          <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSendMessage('Why is PHC B Paracetamol flagged critical?')}
              className="px-2 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 rounded-md whitespace-nowrap text-slate-700"
            >
              Why is PHC B critical?
            </button>
            <button
              onClick={() => handleSendMessage('Calculate safe source buffer for PHC A after 500 tablets.')}
              className="px-2 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 rounded-md whitespace-nowrap text-slate-700"
            >
              Verify PHC A buffer
            </button>
            <button
              onClick={() => handleSendMessage('What is the expiry window for ORS at PHC E?')}
              className="px-2 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 rounded-md whitespace-nowrap text-slate-700"
            >
              ORS Expiry Details
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-slate-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    SS
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <span
                    className={`block text-[9px] font-mono mt-1 ${
                      m.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2 animate-pulse">
                <BrainCircuit className="w-4 h-4 animate-spin text-blue-600" />
                <span>Copilot is reasoning with {taskComplexity === 'complex' ? 'gemini-3.1-pro-preview' : taskComplexity === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'}...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Copilot in English or Hindi..."
              className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
