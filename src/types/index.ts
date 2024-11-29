export interface AIResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
}

export interface AnalysisResult {
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface WebSocketMessage {
  type: 'prompt' | 'response' | 'error';
  payload: any;
}

export interface AIStore {
  responses: Map<string, AIResponse>;
  analysisResults: Map<string, AnalysisResult>;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  addResponse: (response: AIResponse) => void;
  addAnalysisResult: (id: string, result: AnalysisResult) => void;
}