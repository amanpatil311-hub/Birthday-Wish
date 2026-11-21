import { supabase, isSupabaseConfigured } from './supabase';
import { InteractionResponse, GameResult, StoryProgress, ChatMessage } from '../types';

// ==============================================================================
// DATABASE SERVICE LAYER (SUPABASE + LOCAL STORAGE PREVIEW FALLBACK)
// ==============================================================================

export const db = {
  // ----------------------------------------------------------------------------
  // 1. STORY PROGRESS
  // ----------------------------------------------------------------------------
  async getStoryProgress(userId: string): Promise<StoryProgress | null> {
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem(`story_progress_${userId}`);
      return saved ? JSON.parse(saved) : null;
    }

    const { data, error } = await supabase
      .from('story_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching story progress:', error.message);
    }
    return data;
  },

  async saveStoryProgress(progress: Partial<StoryProgress> & { user_id: string }): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const existing = await this.getStoryProgress(progress.user_id) || {
        user_id: progress.user_id,
        current_chapter_id: 'ch-01',
        completed_chapters: [],
        unlocked_chat: false,
        updated_at: new Date().toISOString()
      };
      const updated = { ...existing, ...progress, updated_at: new Date().toISOString() };
      localStorage.setItem(`story_progress_${progress.user_id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('story_progress')
      .upsert(progress, { onConflict: 'user_id' });

    if (error) console.error('Error saving story progress:', error.message);
  },

  // ----------------------------------------------------------------------------
  // 2. INTERACTION RESPONSES (Recipient submits, Owner reads)
  // ----------------------------------------------------------------------------
  async submitResponse(interactionId: string, userId: string, responseValue: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const all: InteractionResponse[] = JSON.parse(localStorage.getItem('vault_interaction_responses') || '[]');
      const newResponse: InteractionResponse = {
        id: `local-resp-${Date.now()}`,
        interaction_id: interactionId,
        user_id: userId,
        response_value: responseValue,
        created_at: new Date().toISOString()
      };
      all.unshift(newResponse);
      localStorage.setItem('vault_interaction_responses', JSON.stringify(all));
      return true;
    }

    const { error } = await supabase
      .from('interaction_responses')
      .insert({
        interaction_id: interactionId,
        user_id: userId,
        response_value: responseValue
      });

    if (error) {
      console.error('Error submitting response:', error.message);
      return false;
    }
    return true;
  },

  async getAllResponsesForOwner(): Promise<InteractionResponse[]> {
    if (!isSupabaseConfigured || !supabase) {
      return JSON.parse(localStorage.getItem('vault_interaction_responses') || '[]');
    }

    const { data, error } = await supabase
      .from('interaction_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses for owner:', error.message);
      return [];
    }
    return data || [];
  },

  // ----------------------------------------------------------------------------
  // 3. GAME RESULTS
  // ----------------------------------------------------------------------------
  async submitGameResult(gameId: string, userId: string, score: number, details: any = {}): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const all: GameResult[] = JSON.parse(localStorage.getItem('vault_game_results') || '[]');
      const newResult: GameResult = {
        id: `local-game-${Date.now()}`,
        game_id: gameId,
        user_id: userId,
        score,
        details,
        created_at: new Date().toISOString()
      };
      all.unshift(newResult);
      localStorage.setItem('vault_game_results', JSON.stringify(all));
      return true;
    }

    const { error } = await supabase
      .from('game_results')
      .insert({
        game_id: gameId,
        user_id: userId,
        score,
        details
      });

    if (error) {
      console.error('Error submitting game result:', error.message);
      return false;
    }
    return true;
  },

  async getAllGameResultsForOwner(): Promise<GameResult[]> {
    if (!isSupabaseConfigured || !supabase) {
      return JSON.parse(localStorage.getItem('vault_game_results') || '[]');
    }

    const { data, error } = await supabase
      .from('game_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching game results:', error.message);
      return [];
    }
    return data || [];
  },

  // ----------------------------------------------------------------------------
  // 4. REAL-TIME TWO-WAY MESSAGES
  // ----------------------------------------------------------------------------
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured || !supabase) {
      const all: ChatMessage[] = JSON.parse(localStorage.getItem(`chat_messages_${conversationId}`) || '[]');
      return all;
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error.message);
      return [];
    }
    return data || [];
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderRole: 'recipient' | 'owner',
    content: string
  ): Promise<ChatMessage | null> {
    if (!isSupabaseConfigured || !supabase) {
      const all: ChatMessage[] = JSON.parse(localStorage.getItem(`chat_messages_${conversationId}`) || '[]');
      const newMsg: ChatMessage = {
        id: `local-msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        sender_role: senderRole,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };
      all.push(newMsg);
      localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(all));
      return newMsg;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_role: senderRole,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error.message);
      return null;
    }
    return data;
  }
};
