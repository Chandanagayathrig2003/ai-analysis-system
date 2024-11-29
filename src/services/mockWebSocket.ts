import { WebSocketMessage } from '../types';

export class MockWebSocketService {
  private isConnected = false;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        resolve();
      }, 500); // Simulate connection delay
    });
  }

  disconnect(): void {
    this.isConnected = false;
  }

  send(message: WebSocketMessage): void {
    if (!this.isConnected) {
      throw new Error('Mock WebSocket is not connected');
    }

    // Simulate response after a short delay
    setTimeout(() => {
      const mockResponse: WebSocketMessage = {
        type: 'response',
        payload: {
          text: `Mock response for: ${message.payload}`,
          timestamp: Date.now()
        }
      };
      
      this.messageHandlers.forEach(handler => handler(mockResponse));
    }, 300);
  }

  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.push(handler);
  }
}

export const mockWsService = new MockWebSocketService();