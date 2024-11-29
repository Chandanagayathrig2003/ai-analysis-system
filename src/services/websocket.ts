import { WebSocketMessage } from '../types';
import { mockWsService } from './mockWebSocket';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private useMockService = true; // Always use mock service in development

  connect(): Promise<void> {
    if (this.useMockService) {
      return mockWsService.connect();
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('ws://localhost:8080');

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onclose = () => {
          if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.useMockService) {
      mockWsService.disconnect();
      return;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.useMockService) {
      mockWsService.send(message);
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void): void {
    if (this.useMockService) {
      mockWsService.onMessage(handler);
      return;
    }
    this.messageHandlers.push(handler);
  }
}

export const wsService = new WebSocketService();
export default wsService;