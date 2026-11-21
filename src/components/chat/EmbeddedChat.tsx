import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircleHeart, CheckCheck, Sparkles } from 'lucide-react';
import { db } from '../../lib/db';
import { sounds } from '../../lib/sound';
import { ChatMessage } from '../../types';

export const EmbeddedChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const conversationId = 'pratiksha-main-convo';

  const loadMessages = async () => {
    const msgs = await db.getMessages(conversationId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    sounds.playTap();

    const sent = await db.sendMessage(conversationId, 'pratiksha-user', 'recipient', input.trim());
    setIsSending(false);

    if (sent) {
      sounds.playMessageSent();
      setInput('');
      setMessages((prev) => [...prev, sent]);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl border border-roseaccent-400/30 shadow-2xl overflow-hidden flex flex-col h-[400px]">
      
      {/* Chat Header */}
      <div className="p-3.5 bg-midnight-900/80 border-b border-midnight-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-roseaccent-500 to-champagne-400 flex items-center justify-center text-white text-xs shadow-sm font-serif font-bold">
            💬
          </div>
          <div>
            <h4 className="font-serif font-bold text-xs text-ivory-50">Private Live Chat</h4>
            <span className="text-[10px] text-emerald-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
              Connected directly to him
            </span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-ivory-400">
            <MessageCircleHeart className="w-7 h-7 text-roseaccent-400/60 mb-2" />
            <p className="font-semibold text-ivory-200">Your Private Chat Is Open</p>
            <p className="text-[11px] text-ivory-400 mt-1 max-w-[240px]">
              Type a message below — it goes straight to him in real time! ✨
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_role === 'recipient';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 ${
                    isMe
                      ? 'bg-gradient-to-r from-roseaccent-600 to-champagne-600 text-white rounded-br-none shadow-md'
                      : 'bg-midnight-900 text-ivory-100 rounded-bl-none border border-midnight-700'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[9px] text-ivory-400/60 mt-1 px-1 flex items-center">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <CheckCheck className="w-3 h-3 text-champagne-400 ml-1" />}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 bg-midnight-900/90 border-t border-midnight-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a private message to him..."
          className="flex-1 bg-midnight-950 border border-midnight-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-roseaccent-400 placeholder:text-ivory-400/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-2 rounded-xl bg-gradient-to-r from-roseaccent-500 to-champagne-500 text-white disabled:opacity-30 shadow-md active:scale-95 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
