export type MessageSender = 'USER' | 'BOT';
export type MessageType = 'TEXT' | 'VERSE' | 'PRAYER' | 'DEVOTIONAL' | 'ADVICE';

export interface User {
  id: string;
  name?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  messageType: MessageType;
  chatSessionId: string;
  createdAt: string;
}

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  verseRef?: string;
  date: string;
  createdAt: string;
}
