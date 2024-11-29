import { create } from 'zustand';
import { AIStore, AIResponse, AnalysisResult } from '../types';
import wsService from '../services/websocket';

export const useAIStore = create<AIStore>((set, get) => ({
  responses: new Map(),
  analysisResults: new Map(),
  isConnected: false,

  connect: async () => {
    try {
      await wsService.connect();
      set({ isConnected: true });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  },

  disconnect: () => {
    wsService.disconnect();
    set({ isConnected: false });
  },

  addResponse: (response: AIResponse) => {
    set(state => {
      const newResponses = new Map(state.responses);
      newResponses.set(response.id, response);
      return { responses: newResponses };
    });
  },

  addAnalysisResult: (id: string, result: AnalysisResult) => {
    set(state => {
      const newResults = new Map(state.analysisResults);
      newResults.set(id, result);
      return { analysisResults: newResults };
    });
  },
}));