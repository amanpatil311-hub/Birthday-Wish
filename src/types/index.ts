export type UserRole = 'recipient' | 'owner' | 'guest';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  order_index: number;
  title: string;
  subtitle: string;
  description: string;
  cover_image: string;
  media_type?: 'image' | 'video' | 'gif';
  video_url?: string;
  quote?: string;
  personal_note?: string;
  is_enabled: boolean;
  unlocks_chat?: boolean;
}

export interface StoryProgress {
  user_id: string;
  current_chapter_id: string;
  completed_chapters: string[];
  unlocked_chat: boolean;
  updated_at: string;
}

export type InteractionType = 
  | 'multiple_choice'
  | 'free_text'
  | 'yes_no'
  | 'poll'
  | 'scratch_card'
  | 'memory_match'
  | 'photo_reveal'
  | 'guestbook_wish';

export interface StoryInteraction {
  id: string;
  chapter_id: string;
  type: InteractionType;
  title: string;
  prompt: string;
  options?: string[];
  config?: Record<string, any>;
  order_index: number;
}

export interface InteractionResponse {
  id: string;
  interaction_id: string;
  user_id: string;
  response_value: any;
  created_at: string;
  chapter_id?: string;
  prompt?: string;
}

export interface Game {
  id: string;
  chapter_id: string;
  game_type: 'memory_match' | 'photo_reveal' | 'scratch_card';
  title: string;
  description: string;
  config: Record<string, any>;
}

export interface GameResult {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  details: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  recipient_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'recipient' | 'owner';
  content: string;
  is_read: boolean;
  created_at: string;
}
