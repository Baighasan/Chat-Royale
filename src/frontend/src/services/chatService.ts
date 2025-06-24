import { ChatRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const streamChat = (payload: ChatRequest): Promise<ReadableStream> => {
  return fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
      throw new Error('Response body is null');
    }
    return response.body;
  });
};

export const healthCheck = (): Promise<{ status: string; timestamp: string }> => {
  return fetch(`${API_BASE_URL}/api/health`, {
    credentials: 'include'
  })
    .then((response) => response.json());
}; 