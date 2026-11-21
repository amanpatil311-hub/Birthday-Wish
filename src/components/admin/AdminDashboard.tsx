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
  Heart,
  Eye,
  Smartphone,
  KeyRound,
  BookOpen
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

  // Telemetry & Presence computations
  const openedEvent = answers.find(a => a.interaction_id === 'link-opened');
  const unlockedEvent = answers.find(a => a.interaction_id === 'vault-unlocked');
  const chapterEvents = answers.filter(a => a.interaction_id === 'chapter-viewed');
  const latestChapterEvent = chapterEvents.length > 0 ? chapterEvents[0] : null;
  const actualAnswers = answers.filter(
    a => !['link-opened', 'vault-unlocked', 'chapter-viewed'].includes(a.interaction_id)
  );
  const telemetryEvents = answers.filter(
    a => ['link-opened', 'vault-unlocked', 'chapter-viewed'].includes(a.interaction_id)
  );

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

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all responses, chat messages, and game scores? This will create a completely fresh start for Pratiksha.')) {
      sounds.playTap();
      setIsLoading(true);
      await db.clearAllData();
      await loadData();
      setIsLoading(false);
      alert('All responses and telemetry data have been cleared successfully.');
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
          {actualAnswers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-midnight-800 text-champagne-300 text-[10px]">
              {actualAnswers.length}
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
              <h2 className="text-xl font-serif font-bold text-ivory-50">Story & Visitor Overview</h2>
              <p className="text-xs text-ivory-400">Live telemetry and real-time presence from Pratiksha's experience.</p>
            </div>

            {/* Live Presence Banner */}
            {openedEvent ? (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-midnight-900/90 to-emerald-950/80 border border-emerald-500/40 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start space-x-3.5 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Eye className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                        LIVE VISITOR DETECTED
                      </span>
                      <span className="text-[10px] text-ivory-400/70">
                        {new Date(openedEvent.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-ivory-50 mt-1">
                      Pratiksha opened your birthday link! 🎉
                    </h3>
                    <p className="text-xs text-ivory-300 mt-0.5">
                      {openedEvent.response_value}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex flex-wrap items-center gap-2 text-[11px]">
                      {unlockedEvent ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <KeyRound className="w-3 h-3 mr-1 text-emerald-400" />
                          Vault Unlocked with passcode 1903 ({new Date(unlockedEvent.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <KeyRound className="w-3 h-3 mr-1 text-amber-400" />
                          Currently on Lock Screen (Waiting for passcode 1903)
                        </span>
                      )}

                      {latestChapterEvent && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-champagne-400/10 text-champagne-300 border border-champagne-400/20">
                          <BookOpen className="w-3 h-3 mr-1 text-champagne-400" />
                          {latestChapterEvent.response_value}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-midnight-900/60 border border-champagne-400/20 relative overflow-hidden">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-midnight-800 border border-midnight-700 flex items-center justify-center text-ivory-400 shrink-0">
                    <Smartphone className="w-5 h-5 text-champagne-400/60" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-midnight-800 text-ivory-400 border border-midnight-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mr-1.5 animate-pulse" />
                        STANDBY FOR VISITOR
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-ivory-100 mt-1">
                      Waiting for Pratiksha to open the link 💌
                    </h3>
                    <p className="text-xs text-ivory-400 mt-0.5">
                      The moment she taps the link on her phone, this dashboard will update live with her device and exact timestamp!
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                <span className="text-2xl font-bold font-serif text-ivory-50">{actualAnswers.length}</span>
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
                  Recipient Status
                </span>
                <span className="text-sm font-bold text-emerald-400 flex items-center justify-center mt-2">
                  {unlockedEvent ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> In Story
                    </>
                  ) : openedEvent ? (
                    <>
                      <Smartphone className="w-4 h-4 mr-1 text-amber-400" /> At Lock Screen
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-1 text-ivory-400" /> Waiting...
                    </>
                  )}
                </span>
                <span className="text-[10px] text-ivory-400 block mt-1 truncate">
                  {latestChapterEvent
                    ? String(latestChapterEvent.response_value).replace(' 📖', '')
                    : openedEvent
                    ? 'Passcode pending'
                    : 'Unopened'}
                </span>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="glass-panel p-5 rounded-3xl border border-champagne-400/20">
              <h3 className="font-serif font-bold text-sm text-ivory-100 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 text-champagne-400 mr-1.5" />
                Recent Activity & Interactions
              </h3>

              {answers.length === 0 && messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-ivory-400/70">
                  <p>No answers or activity recorded yet.</p>
                  <p className="text-[11px] text-champagne-300 mt-1">
                    When Pratiksha explores the chapters and answers questions, they will appear here in real time!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {answers.slice(0, 7).map((ans) => {
                    const isOpened = ans.interaction_id === 'link-opened';
                    const isUnlocked = ans.interaction_id === 'vault-unlocked';
                    const isChapter = ans.interaction_id === 'chapter-viewed';

                    return (
                      <div key={ans.id} className="p-3 rounded-xl bg-midnight-900/80 border border-midnight-700 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                            isOpened
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : isUnlocked
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isChapter
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-roseaccent-500/20 text-roseaccent-300 border border-roseaccent-500/30'
                          }`}>
                            {isOpened ? <Smartphone className="w-3.5 h-3.5" /> :
                             isUnlocked ? <KeyRound className="w-3.5 h-3.5" /> :
                             isChapter ? <BookOpen className="w-3.5 h-3.5" /> :
                             <Heart className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className={`font-semibold block ${
                              isOpened
                                ? 'text-blue-300'
                                : isUnlocked
                                ? 'text-emerald-300'
                                : isChapter
                                ? 'text-purple-300'
                                : 'text-champagne-300'
                            }`}>
                              {isOpened ? 'Link Opened' : isUnlocked ? 'Vault Unlocked' : isChapter ? 'Chapter Viewed' : ans.interaction_id}
                            </span>
                            <span className="text-ivory-200">
                              {isOpened || isUnlocked || isChapter ? String(ans.response_value) : `"${String(ans.response_value)}"`}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-ivory-400/60 ml-2 whitespace-nowrap">
                          {new Date(ans.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-ivory-50">Submitted Question Answers</h2>
              <p className="text-xs text-ivory-400">All responses submitted by Pratiksha to story prompts.</p>
            </div>

            {actualAnswers.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl border border-champagne-400/20 text-center text-xs text-ivory-400">
                <HelpCircle className="w-8 h-8 text-champagne-400/40 mx-auto mb-2" />
                <p>No question responses recorded yet.</p>
                <p className="text-[11px] text-champagne-300 mt-1">
                  When Pratiksha answers any story question or writes a memory, it will appear here!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {actualAnswers.map((ans) => (
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

            {/* Visitor Journey & Activity Timeline */}
            {telemetryEvents.length > 0 && (
              <div className="pt-6 border-t border-midnight-800">
                <h3 className="font-serif font-bold text-sm text-ivory-100 mb-3 flex items-center">
                  <Eye className="w-4 h-4 text-emerald-400 mr-1.5" />
                  Visitor Journey & Activity Timeline
                </h3>
                <div className="space-y-2">
                  {telemetryEvents.map((evt) => {
                    const isOpened = evt.interaction_id === 'link-opened';
                    const isUnlocked = evt.interaction_id === 'vault-unlocked';

                    return (
                      <div key={evt.id} className="p-3 rounded-xl bg-midnight-900/60 border border-midnight-800 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isOpened ? 'bg-blue-400' : isUnlocked ? 'bg-emerald-400' : 'bg-purple-400'
                          }`} />
                          <span className="text-ivory-200 font-medium">{String(evt.response_value)}</span>
                        </div>
                        <span className="text-[10px] text-ivory-400/60 ml-2 whitespace-nowrap">
                          {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
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

              <div className="pt-3 border-t border-midnight-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-roseaccent-300">Reset Experience Data</h4>
                  <p className="text-[11px] text-ivory-400">Wipe all responses, answers, and chat history for a fresh start</p>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="px-3 py-1.5 rounded-xl bg-roseaccent-600/20 border border-roseaccent-600/40 text-roseaccent-300 hover:bg-roseaccent-600/30 text-xs font-semibold transition"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
