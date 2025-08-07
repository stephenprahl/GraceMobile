import { API_BASE_URL, ENDPOINTS } from './config';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const apiService = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
  },

  // Add more methods (PUT, DELETE, etc.) as needed
};
