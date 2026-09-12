import { OllamaSettings } from '../types';

export const DEFAULT_SETTINGS: OllamaSettings = {
  serverUrl: process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
  selectedModel: process.env.EXPO_PUBLIC_DEFAULT_MODEL || 'qwen2.5vl:latest',
  systemPrompt: 'あなたは親切で役立つAIアシスタントです。自然な日本語で回答してください。',
  temperature: 0.7,
  apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
};

export const STORAGE_KEYS = {
  SETTINGS: '@ollama_chat_settings',
  CHAT_MESSAGES: '@ollama_chat_messages',
};
