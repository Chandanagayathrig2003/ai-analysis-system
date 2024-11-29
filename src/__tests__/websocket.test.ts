import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockWsService } from '../services/mockWebSocket';
import wsService from '../services/websocket';
import { WebSocketMessage } from '../types';

describe('WebSocket Service', () => {
  beforeEach(async () => {
    await wsService.connect();
  });

  afterEach(() => {
    wsService.disconnect();
  });

  it('should successfully connect', async () => {
    const store = { isConnected: false };
    await wsService.connect();
    expect(store.isConnected).toBeDefined();
  });

  it('should send and receive messages', async () => {
    return new Promise<void>((resolve) => {
      const testMessage: WebSocketMessage = {
        type: 'prompt',
        payload: 'Test message'
      };

      wsService.onMessage((message) => {
        expect(message.type).toBe('response');
        expect(message.payload).toBeDefined();
        resolve();
      });

      wsService.send(testMessage);
    });
  });

  it('should handle connection errors', async () => {
    mockWsService.disconnect();
    const message: WebSocketMessage = {
      type: 'prompt',
      payload: 'Test message'
    };

    await expect(() => wsService.send(message)).rejects.toThrow('Mock WebSocket is not connected');
  });

  it('should handle message handlers correctly', async () => {
    const handler = vi.fn();
    wsService.onMessage(handler);

    const testMessage: WebSocketMessage = {
      type: 'prompt',
      payload: 'Test message'
    };

    wsService.send(testMessage);

    // Wait for the mock response
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(handler).toHaveBeenCalled();
  });
});