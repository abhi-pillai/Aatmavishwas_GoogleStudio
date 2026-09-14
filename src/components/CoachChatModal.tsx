import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  X, 
  User, 
  RotateCcw, 
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { CoachChatMessage } from '../types';
import { speakTextWithBrowser } from '../utils/audioUtils';

interface CoachChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COACH_PROMPTS = [
  "How can I stop saying 'um' and 'like' when thinking?",
  "How do I structure an impromptu speech in 30 seconds?",
  "What is the best way to handle an aggressive interview question?",
  "How can I make my voice sound warmer and more authoritative?"
];

export const CoachChatModal: React.FC<CoachChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<CoachChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'coach',
      text: "Namaste! I am your Aatmavishwas speech coach. Whether you are preparing for a critical keynote, battling stage anxiety, or fine-tuning your vocal presence, ask me anything. What communication goal are we tackling today?",
      timestamp: 'Now',
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    const userMsg: CoachChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      const coachMsg: CoachChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'coach',
        text: data.reply || "Focus on diaphragmatic breathing and anchoring your gaze with one audience member at a time.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, coachMsg]);
    } catch (err) {
      console.error('Coach chat error:', err);
      const fallbackMsg: CoachChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'coach',
        text: "The golden rule of public speaking: Pause instead of filling. When your brain is searching for the next concept, embrace 2 seconds of silence. The audience perceives this as profound thoughtfulness rather than hesitation.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      id="coach-chat-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <div 
        id="coach-chat-card" 
        className="w-full max-w-2xl h-[650px] max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Aatmavishwas AI Speech Coach</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">On-demand executive public speaking advisory</p>
            </div>
          </div>

          <button
            id="close-coach-chat-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Conversation Stream */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                m.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] space-y-1 ${m.sender === 'user' ? 'items-end text-right' : ''}`}>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{m.sender === 'user' ? 'You' : 'Coach Vani'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                  {m.sender === 'coach' && (
                    <button
                      onClick={() => speakTextWithBrowser(m.text)}
                      className="text-slate-400 hover:text-indigo-300 ml-1"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Coach is analyzing technique...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {COACH_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg whitespace-nowrap border border-slate-700/60 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask for advice on vocal tone, stage fright, elevator pitches..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              id="send-coach-msg-btn"
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
