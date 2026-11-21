import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MessageSquare, 
  HelpCircle, 
  Gamepad2, 
  Compass, 
  Settings, 
  ArrowLeft, 
  Send, 
  CheckCheck, 
  Clock, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Heart
} from 'lucide-react';
import { db } from '../../lib/db';
import { sounds } from '../../lib/sound';
import { ChatMessage, InteractionResponse, GameResult } from '../../types';

interface AdminDashboardProps {
  onBackToStory: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStory,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'answers' | 'games' | 'progress' | 'settings'>('overview');
  
  // Data states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newReply, setNewReply] = useState('');
  const [answers, setAnswers] = useState<InteractionResponse[]>([]);
  const [games, setGames] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Settings states
  const [chatUnlockChapter, setChatUnlockChapter] = useState(4);
  const [interactionsEnabled, setInteractionsEnabled] = useState(true);

  const conversationId = 'pratiksha-main-convo';

  const loadData = async () => {
    setIsLoading(true);
    const msgs = await db.getMessages(conversationId);
    const ans = await db.getAllResponsesForOwner();
    const gms = await db.getAllGameResultsForOwner();
    setMessages(msgs);
    setAnswers(ans);
    setGames(gms);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000); // Poll for real-time updates
    return () => clearInterval(interval);
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    sounds.playTap();
    const sent = await db.sendMessage(conversationId, 'owner-id', 'owner', newReply.trim());
    if (sent) {
      sounds.playMessageSent();
      setNewReply('');
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-ivory-100 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-midnight-900/90 backdrop-blur-xl border-b border-champagne-400/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToStory}
            className="p-1.5 rounded-xl glass-card hover:border-champagne-400/40 text-ivory-300 hover:text-white transition text-xs flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Story</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs">
              👑
            </div>
            <h1 className="font-serif font-bold text-sm text-ivory-50 tracking-tight">
              Owner Management
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-1.5 rounded-xl glass-card text-ivory-400 hover:text-champagne-300 transition text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-xl bg-roseaccent-600/20 border border-roseaccent-600/30 text-roseaccent-300 hover:bg-roseaccent-600/30 transition text-xs flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock Admin</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-midnight-900/50 border-b border-midnight-800 px-4 py-2 flex space-x-1.5 overflow-x-auto scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'bg-champagne-500 text-midnight-950 font-bold shadow-sm'
              : 'text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition relative ${
            activeTab === 'chat'
              ? 'bg-champagne-500 text-midnight-950 font-bold shadow-sm'
              : 'text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Chat</span>
          {messages.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-roseaccent-500 text-white text-[10px]">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('answers')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'answers'
              ? 'bg-champagne-500 text-midnight-950 font-bold shadow-sm'
              : 'text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Submitted Answers</span>
          {answers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-midnight-800 text-champagne-300 text-[10px]">
              {answers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'games'
              ? 'bg-champagne-500 text-midnight-950 font-bold shadow-sm'
              : 'text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Game Results</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'progress'
              ? 'bg-champagne-500 text-midnight-950 font-bold shadow-sm'
              : 'text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Story Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'settings'
              ? 'bg-champagne-500 text-midnight-950 font-bold shadow-sm'
              : 'text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-ivory-50">Story & Interaction Overview</h2>
              <p className="text-xs text-ivory-400">Live telemetry and metrics from Pratiksha's experience.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card p-4 rounded-2xl border border-roseaccent-500/20 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-roseaccent-300 block mb-1">
                  Chat Messages
                </span>
                <span className="text-2xl font-bold font-serif text-ivory-50">{messages.length}</span>
                <span className="text-[10px] text-ivory-400 block mt-1">Two-way history</span>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-champagne-400/20 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-400 block mb-1">
                  Answers Received
                </span>
                <span className="text-2xl font-bold font-serif text-ivory-50">{answers.length}</span>
                <span className="text-[10px] text-ivory-400 block mt-1">Questions answered</span>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-amber-500/20 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Games Played
                </span>
                <span className="text-2xl font-bold font-serif text-ivory-50">{games.length}</span>
                <span className="text-[10px] text-ivory-400 block mt-1">Perks & scores</span>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Story Status
                </span>
                <span className="text-base font-bold text-emerald-400 flex items-center justify-center mt-2">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Active
                </span>
                <span className="text-[10px] text-ivory-400 block mt-1">Passcode: 1903</span>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="glass-panel p-5 rounded-3xl border border-champagne-400/20">
              <h3 className="font-serif font-bold text-sm text-ivory-100 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 text-champagne-400 mr-1.5" />
                Recent Interactions
              </h3>

              {answers.length === 0 && messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-ivory-400/70">
                  <p>No answers or messages submitted yet.</p>
                  <p className="text-[11px] text-champagne-300 mt-1">
                    When Pratiksha explores the chapters and answers questions, they will appear here in real time!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {answers.slice(0, 5).map((ans) => (
                    <div key={ans.id} className="p-3 rounded-xl bg-midnight-900/80 border border-midnight-700 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-champagne-300 block">{ans.interaction_id}</span>
                        <span className="text-ivory-200">Answer: "{String(ans.response_value)}"</span>
                      </div>
                      <span className="text-[10px] text-ivory-400/60">
                        {new Date(ans.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: LIVE CHAT */}
        {/* ==================================================== */}
        {activeTab === 'chat' && (
          <div className="h-[75vh] flex flex-col glass-panel rounded-3xl border border-champagne-400/20 overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 bg-midnight-900/80 border-b border-midnight-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-roseaccent-500 to-champagne-400 flex items-center justify-center text-white font-serif font-bold text-sm">
                  P
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ivory-50">Pratiksha</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    Private Real-Time Channel
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ivory-400 text-xs">
                  <div className="w-12 h-12 rounded-full bg-midnight-900 flex items-center justify-center text-xl mb-3">
                    💬
                  </div>
                  <p className="font-semibold text-ivory-200">No messages yet</p>
                  <p className="text-[11px] text-ivory-400 mt-1 max-w-xs">
                    You can send a surprise opening message right now, or wait for Pratiksha to reach Chapter 04!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwner = msg.sender_role === 'owner';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                          isOwner
                            ? 'bg-gradient-to-r from-roseaccent-600 to-champagne-600 text-white rounded-br-none shadow-md'
                            : 'bg-midnight-900 text-ivory-100 rounded-bl-none border border-midnight-700'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-ivory-400/60 mt-1 px-1 flex items-center">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isOwner && <CheckCheck className="w-3 h-3 text-champagne-400 ml-1" />}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Reply Form */}
            <form onSubmit={handleSendReply} className="p-3 bg-midnight-900/90 border-t border-midnight-800 flex items-center space-x-2">
              <input
                type="text"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type a message for Pratiksha..."
                className="flex-1 bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-champagne-400"
              />
              <button
                type="submit"
                disabled={!newReply.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-roseaccent-500 to-champagne-500 text-white disabled:opacity-40 shadow-md active:scale-95 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SUBMITTED ANSWERS */}
        {/* ==================================================== */}
        {activeTab === 'answers' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-ivory-50">Submitted Question Answers</h2>
              <p className="text-xs text-ivory-400">All responses submitted by Pratiksha across chapters.</p>
            </div>

            {answers.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl border border-champagne-400/20 text-center text-xs text-ivory-400">
                <HelpCircle className="w-8 h-8 text-champagne-400/40 mx-auto mb-2" />
                <p>No question responses recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {answers.map((ans) => (
                  <div key={ans.id} className="glass-card p-4 rounded-2xl border border-champagne-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-roseaccent-300">
                        {ans.interaction_id}
                      </span>
                      <span className="text-[10px] text-ivory-400/60 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(ans.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-ivory-100">
                      "{JSON.stringify(ans.response_value).replace(/"/g, '')}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: GAMES */}
        {/* ==================================================== */}
        {activeTab === 'games' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-ivory-50">Game Results & Perks Claimed</h2>
              <p className="text-xs text-ivory-400">Scores from memory games and coupons scratched off.</p>
            </div>

            {games.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl border border-champagne-400/20 text-center text-xs text-ivory-400">
                <Gamepad2 className="w-8 h-8 text-champagne-400/40 mx-auto mb-2" />
                <p>No game results or claimed perks recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {games.map((gm) => (
                  <div key={gm.id} className="glass-card p-4 rounded-2xl border border-amber-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-amber-300">{gm.game_id}</span>
                      <span className="text-[10px] text-ivory-400">{new Date(gm.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-ivory-100 font-medium">Score: {gm.score}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: STORY PROGRESS */}
        {/* ==================================================== */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-ivory-50">Story Journey Progress</h2>
              <p className="text-xs text-ivory-400">Current chapter reading status.</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-champagne-400/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ivory-200">Chapters Completed:</span>
                <span className="text-xs font-bold text-champagne-400">7 Chapters Available</span>
              </div>
              <div className="w-full h-2 bg-midnight-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-roseaccent-500 to-champagne-400 w-full" />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-ivory-50">Experience Settings</h2>
              <p className="text-xs text-ivory-400">Configure chapter thresholds and interactions.</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-champagne-400/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ivory-100">Chat Unlock Milestone</h4>
                  <p className="text-[11px] text-ivory-400">Which chapter unlocks the two-way live chat?</p>
                </div>
                <select
                  value={chatUnlockChapter}
                  onChange={(e) => setChatUnlockChapter(Number(e.target.value))}
                  className="bg-midnight-900 border border-midnight-700 rounded-xl px-3 py-1.5 text-xs text-champagne-300"
                >
                  <option value={1}>Chapter 01</option>
                  <option value={2}>Chapter 02</option>
                  <option value={3}>Chapter 03</option>
                  <option value={4}>Chapter 04 (Recommended)</option>
                  <option value={5}>Chapter 05</option>
                  <option value={6}>Chapter 06</option>
                </select>
              </div>

              <div className="pt-3 border-t border-midnight-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ivory-100">Interactive Questions & Games</h4>
                  <p className="text-[11px] text-ivory-400">Enable quizzes and scratch card games in chapters</p>
                </div>
                <input
                  type="checkbox"
                  checked={interactionsEnabled}
                  onChange={(e) => setInteractionsEnabled(e.target.checked)}
                  className="w-4 h-4 text-champagne-500 rounded bg-midnight-900 border-midnight-700 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
