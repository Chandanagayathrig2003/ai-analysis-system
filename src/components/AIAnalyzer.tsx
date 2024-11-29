import React, { useEffect, useState } from 'react';
import { Brain, Send, Sparkles, MessageSquare } from 'lucide-react';
import { useAIStore } from '../store/aiStore';
import { AnalysisService } from '../services/analysis';
import { AIResponse, WebSocketMessage } from '../types';
import wsService from '../services/websocket';

export default function AIAnalyzer() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { 
    isConnected, 
    responses, 
    analysisResults,
    connect,
    addResponse,
    addAnalysisResult 
  } = useAIStore();

  useEffect(() => {
    connect();
    wsService.onMessage((message: WebSocketMessage) => {
      if (message.type === 'response') {
        console.log('Received response:', message.payload);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      wsService.send({
        type: 'prompt',
        payload: prompt
      });

      const response: AIResponse = {
        id: crypto.randomUUID(),
        prompt,
        response: "Mock AI response for: " + prompt,
        timestamp: Date.now()
      };

      addResponse(response);
      const analysis = await AnalysisService.analyzeResponse(response);
      addAnalysisResult(response.id, analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="min-h-screen animated-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-effect rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="animate-float bg-white/10 p-4 rounded-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                AI Analysis System
              </h1>
              <p className="text-white/80">Intelligent Analysis & Real-time Feedback</p>
            </div>
          </div>

          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              isConnected ? 'bg-emerald-400/20 text-emerald-100' : 'bg-red-400/20 text-red-100'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                isConnected ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
              {isConnected ? 'Connected to AI' : 'Disconnected'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me anything about AI..."
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                disabled={loading || !isConnected}
              />
              <button
                type="submit"
                disabled={loading || !isConnected}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white/10 flex items-center gap-3 font-medium"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {Array.from(responses.entries()).reverse().map(([id, response], index) => {
              const analysis = analysisResults.get(id);
              return (
                <div 
                  key={id} 
                  className="animate-slide-in card-hover bg-white/5 border border-white/10 rounded-2xl p-6"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-white/80 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-white mb-3">{response.prompt}</p>
                      <p className="text-white/70 mb-4">{response.response}</p>
                      {analysis && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <div className="font-medium text-white">Analysis Results</div>
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="font-medium text-white/80">Score:</div>
                            <div className="px-4 py-1 bg-white/10 text-white rounded-full text-sm">
                              {analysis.score.toFixed(1)}%
                            </div>
                          </div>
                          <p className="text-white/70 mb-4">{analysis.feedback}</p>
                          <div className="space-y-2">
                            {analysis.suggestions.map((suggestion, i) => (
                              <div 
                                key={i} 
                                className="flex items-center gap-3 text-sm text-white/60"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-300/50" />
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}