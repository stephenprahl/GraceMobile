import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChatSession, Message } from '../types';
import { chatService } from '../services/chatService';

type ChatContextType = {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  createNewSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await chatService.getChatSessions();
      
      if (error) throw new Error(error);
      if (data) {
        setSessions(data);
        // Set the first session as current if none is selected
        if (data.length > 0 && !currentSession) {
          setCurrentSession(data[0]);
          await loadMessages(data[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await chatService.getMessages(sessionId);
      
      if (error) throw new Error(error);
      
      // Ensure we're setting an array of messages or an empty array if data is undefined
      const messages = Array.isArray(data) ? data : [];
      setMessages(messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      // Reset messages to empty array on error to prevent undefined state
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      // The actual session will be created with the first message
      const newSession = {
        id: '',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCurrentSession(newSession);
      setMessages([]);
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
    } finally {
      setIsLoading(false);
    }
  }, [loadSessions]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setIsLoading(true);
      const sessionId = currentSession?.id || '';
      const { data, error } = await chatService.sendMessage(sessionId, content);
      
      if (error) throw new Error(error);
      if (!data) throw new Error('No response from server');
      
      // Update the current session if this is a new session
      if (data.sessionId && !currentSession?.id) {
        const newSession = {
          id: data.sessionId,
          messages: [data.userMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCurrentSession(newSession);
        setSessions(prev => {
          const currentSessions = Array.isArray(prev) ? prev : [];
          return [newSession, ...currentSessions];
        });
      }
      
      // Update the messages with both user and bot messages
      setMessages(prev => {
        const currentMessages = Array.isArray(prev) ? prev : [];
        const newMessages = [
          ...currentMessages,
          data.userMessage,
          data.botMessage
        ];
        
        // Sort messages by timestamp
        return newMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      
      // Refresh sessions to get the latest data
      await loadSessions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Ensure we have a valid messages array even after an error
      setMessages(prev => Array.isArray(prev) ? prev : []);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, loadSessions]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        sessions,
        messages,
        isLoading,
        error,
        createNewSession,
        sendMessage,
        loadMessages,
        loadSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
