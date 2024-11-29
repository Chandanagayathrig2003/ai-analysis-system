import { describe, it, expect } from 'vitest';
import { AnalysisService } from '../services/analysis';
import { AIResponse } from '../types';

describe('AnalysisService', () => {
  it('should analyze valid responses', async () => {
    const mockResponse: AIResponse = {
      id: '1',
      prompt: 'What is machine learning?',
      response: 'Machine learning is a subset of artificial intelligence...',
      timestamp: Date.now()
    };

    const result = await AnalysisService.analyzeResponse(mockResponse);
    
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('feedback');
    expect(result).toHaveProperty('suggestions');
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('should throw error for empty responses', async () => {
    const mockResponse: AIResponse = {
      id: '2',
      prompt: 'Invalid',
      response: '',
      timestamp: Date.now()
    };

    await expect(AnalysisService.analyzeResponse(mockResponse)).rejects.toThrow();
  });

  it('should cache analysis results', async () => {
    const mockResponse: AIResponse = {
      id: '3',
      prompt: 'What is deep learning?',
      response: 'Deep learning is a subset of machine learning...',
      timestamp: Date.now()
    };

    const firstResult = await AnalysisService.analyzeResponse(mockResponse);
    const secondResult = await AnalysisService.analyzeResponse(mockResponse);

    expect(firstResult).toEqual(secondResult);
  });
});