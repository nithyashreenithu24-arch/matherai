import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  HelpCircle,
  MessageSquareQuote,
  Send,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { ChatMessage, User } from '../types';

interface AIChatbotViewProps {
  user: User;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const AIChatbotView: React.FC<AIChatbotViewProps> = ({
  user,
  chatHistory,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'What foods help lower my Gestational Diabetes risk during week 26?',
    'Explain what my Cervical Cancer risk prediction score means in simple terms.',
    'How do I pair my iron supplements with Vitamin C to fix mild anemia?',
    'What red-flag symptoms should prompt an immediate call to my doctor?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AURA AI Healthcare Assistant</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Powered by Gemini</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Grounded in WHO & ACOG clinical practice bulletins for evidence-based maternal health guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Guardrail Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-200">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Educational & Informational Purpose Only:</strong>
          <span className="ml-1">
            This AI assistant provides educational guidance on prenatal nutrition, cervical screening guidelines, and risk factors. It does not issue pharmaceutical prescriptions or definitive medical diagnoses. Always consult your obstetrician for clinical decisions.
          </span>
        </div>
      </div>

      {/* Chat Workspace Window */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gradient-to-tr from-teal-500 to-cyan-600 text-white shadow-md'
                }`}
              >
                {msg.sender === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    <p className="font-bold uppercase tracking-wider">Clinical Reference Guidelines:</p>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                      {msg.sources.map((src, i) => (
                        <li key={i}>{src}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs text-slate-500 animate-pulse">
                Analyzing maternal health guidelines and computing response...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <HelpCircle className="h-4 w-4 text-teal-600 shrink-0" />
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-700 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AURA about prenatal care, blood sugar, cervical health..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
