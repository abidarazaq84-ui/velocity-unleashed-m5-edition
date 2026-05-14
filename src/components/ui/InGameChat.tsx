import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export const InGameChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial fake message
    setMessages([
      { id: '1', sender: 'System', text: 'Welcome to the match!', timestamp: Date.now() },
    ]);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate friend reply
    if (newMessage.text.toLowerCase().includes('hello') || newMessage.text.toLowerCase().includes('hi')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'xX_Sniper_Xx',
            text: 'Hey! Ready for the match?',
            timestamp: Date.now(),
          },
        ]);
      }, 1500);
    }
  };

  return (
    <div 
      className={`pointer-events-auto w-80 flex flex-col rounded-xl overflow-hidden transition-all duration-300 ${isFocused ? 'bg-black/80 border border-white/20 h-64' : 'bg-transparent h-48'}`}
    >
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        {messages.map((msg) => (
          <div key={msg.id} className="text-xs break-words">
            <span className={msg.sender === 'System' ? 'text-yellow-400 font-bold' : msg.sender === 'You' ? 'text-cyan-400 font-bold' : 'text-green-400 font-bold'}>
              {msg.sender}: 
            </span>
            <span className="text-white ml-2 drop-shadow-md">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`p-2 bg-black/50 border-t border-white/10 transition-opacity ${isFocused ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Press Enter to chat..."
            className="flex-1 bg-black/50 border border-white/20 rounded p-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-cyan-500"
          />
          <button 
            type="submit"
            className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black p-1.5 rounded border border-cyan-500/50 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
