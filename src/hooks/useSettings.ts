import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OllamaSettings, OllamaModel } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants/config';
import { fetchModels, testConnection } from '../services/ollama';

export function useSettings() {
  const [settings, setSettings] = useState<OllamaSettings>(DEFAULT_SETTINGS);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // 初回起動時にAsyncStorageから設定をロード
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (err) {
        console.error('設定の読み込みに失敗しました:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 設定保存
  const updateSettings = useCallback(async (newSettings: Partial<OllamaSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)).catch((err) => {
        console.error('設定の保存に失敗しました:', err);
      });
      return updated;
    });
  }, []);

  // モデル一覧のリフレッシュ
  const refreshModels = useCallback(async (urlOverride?: string, apiKeyOverride?: string) => {
    const url = urlOverride || settings.serverUrl;
    const key = apiKeyOverride !== undefined ? apiKeyOverride : settings.apiKey;
    try {
      const models = await fetchModels(url, key);
      setAvailableModels(models);
      setIsConnected(true);
      return models;
    } catch (err) {
      setIsConnected(false);
      throw err;
    }
  }, [settings.serverUrl, settings.apiKey]);

  // 接続確認テスト
  const checkHealth = useCallback(async (urlOverride?: string, apiKeyOverride?: string) => {
    const url = urlOverride || settings.serverUrl;
    const key = apiKeyOverride !== undefined ? apiKeyOverride : settings.apiKey;
    const ok = await testConnection(url, key);
    setIsConnected(ok);
    return ok;
  }, [settings.serverUrl, settings.apiKey]);

  return {
    settings,
    updateSettings,
    availableModels,
    refreshModels,
    checkHealth,
    isConnected,
    isLoadingSettings: isLoading,
  };
}
