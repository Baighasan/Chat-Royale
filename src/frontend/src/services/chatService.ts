import { ChatRequest, ChatResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const processChat = (payload: ChatRequest): Promise<ChatResponse> => {
  return fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
};

export const healthCheck = (): Promise<{ status: string; timestamp: string }> => {
  return fetch(`${API_BASE_URL}/api/health`, {
    credentials: 'include'
  })
    .then((response) => response.json());
}; 