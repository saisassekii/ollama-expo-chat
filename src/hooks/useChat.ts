import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, OllamaSettings } from '../types';
import { STORAGE_KEYS } from '../constants/config';
import { streamChatMessage } from '../services/ollama';

export function useChat(settings: OllamaSettings) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 初回起動時にローカルストレージから会話履歴を復元
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
          }
        }
      } catch (err) {
        console.error('メッセージ履歴の取得に失敗しました:', err);
      }
    })();
  }, []);

  // メッセージの永続化
  const persistMessages = useCallback(async (msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(msgs));
    } catch (err) {
      console.error('メッセージ履歴の保存に失敗しました:', err);
    }
  }, []);

  // メッセージ送信（ストリーミング対応）
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      };

      const assistantMessageId = `assistant-${Date.now() + 1}`;
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };

      // ユーザーメッセージと初期アシスタントメッセージをセット
      const updatedMessagesWithUser = [...messages, userMessage];
      const allMessages = [...updatedMessagesWithUser, initialAssistantMessage];
      setMessages(allMessages);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        let currentAssistantText = '';

        await streamChatMessage({
          serverUrl: settings.serverUrl,
          model: settings.selectedModel,
          messages: updatedMessagesWithUser,
          systemPrompt: settings.systemPrompt,
          apiKey: settings.apiKey,
          signal: controller.signal,
          onChunk: (_chunk, accumulated) => {
            currentAssistantText = accumulated;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulated }
                  : msg
              )
            );
          },
        });

        // 完了後の最終メッセージリストを保存
        const finalized = updatedMessagesWithUser.concat({
          ...initialAssistantMessage,
          content: currentAssistantText,
        });
        await persistMessages(finalized);
      } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'リクエストがキャンセルされました') {
          setError(err.message || '通信エラーが発生しました');
          // 空のアシスタントメッセージが残っていれば除去またはエラー表示
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== assistantMessageId || msg.content.length > 0)
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, settings, persistMessages]
  );

  // 送信中断
  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // 会話履歴クリア
  const clearMessages = useCallback(async () => {
    setMessages([]);
    setError(null);
    await persistMessages([]);
  }, [persistMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelMessage,
    clearMessages,
  };
}
