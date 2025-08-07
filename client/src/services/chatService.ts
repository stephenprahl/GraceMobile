import { ENDPOINTS } from '../api/config';
import { apiService } from '../api/apiService';
import type { ChatSession, Message } from '../types';

export const chatService = {
  async createChatSession() {
    // The server will create a session when the first message is sent
    return { data: null, error: null };
  },

  async getChatSessions() {
    return apiService.get<ChatSession[]>(ENDPOINTS.CHAT_SESSIONS);
  },

  async getChatSession(sessionId: string) {
    return apiService.get<ChatSession>(`${ENDPOINTS.CHAT_SESSIONS}/${sessionId}`);
  },

  async sendMessage(sessionId: string, content: string, sender: 'USER' | 'BOT' = 'USER') {
    return apiService.post<{
      sessionId: string;
      userMessage: Message;
      botMessage: Message;
      response: {
        type: string;
        content: string;
      };
    }>(ENDPOINTS.MESSAGES, {
      content,
      sessionId: sessionId || undefined,
    });
  },

  async getMessages(sessionId: string) {
    const result = await this.getChatSession(sessionId);
    return { 
      data: result.data?.messages || [], 
      error: result.error 
    };
  },
};
