import { ChatMessage, OllamaModel } from '../types';

export class OllamaApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rawError?: unknown
  ) {
    super(message);
    this.name = 'OllamaApiError';
  }
}

/**
 * 末尾のスラッシュを取り除き、URLを正規化します
 */
function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * 共通ヘッダーを生成します
 */
function getHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey && apiKey.trim().length > 0) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }
  return headers;
}

/**
 * Ollama サーバーとの接続テスト
 */
export async function testConnection(serverUrl: string, apiKey?: string): Promise<boolean> {
  const base = normalizeUrl(serverUrl);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${base}/api/version`, {
      method: 'GET',
      headers: getHeaders(apiKey),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 利用可能なモデル一覧を取得 (/api/tags)
 */
export async function fetchModels(serverUrl: string, apiKey?: string): Promise<OllamaModel[]> {
  const base = normalizeUrl(serverUrl);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${base}/api/tags`, {
      method: 'GET',
      headers: getHeaders(apiKey),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new OllamaApiError(`モデル取得に失敗しました (ステータス: ${res.status})`, res.status);
    }

    const data = await res.json();
    return data.models || [];
  } catch (err: any) {
    if (err instanceof OllamaApiError) throw err;
    throw new OllamaApiError(
      `Ollamaサーバー (${base}) に接続できませんでした。IPアドレスやサーバー稼働状況をご確認ください。`,
      undefined,
      err
    );
  }
}

/**
 * ストリーミング形式でチャット送信 (/api/chat with stream: true)
 */
export async function streamChatMessage({
  serverUrl,
  model,
  messages,
  systemPrompt,
  apiKey,
  onChunk,
  signal,
}: {
  serverUrl: string;
  model: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  apiKey?: string;
  onChunk: (chunk: string, accumulated: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const base = normalizeUrl(serverUrl);

  const formattedMessages: { role: string; content: string }[] = [];
  if (systemPrompt && systemPrompt.trim().length > 0) {
    formattedMessages.push({ role: 'system', content: systemPrompt.trim() });
  }

  messages.forEach((msg) => {
    formattedMessages.push({
      role: msg.role,
      content: msg.content,
    });
  });

  try {
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new OllamaApiError(
        `Ollama API エラー (${res.status}): ${errorText || '不明なエラー'}`,
        res.status
      );
    }

    let fullText = '';

    // ReadableStream (ブラウザ / React Native Web / モダンRN)
    if (res.body && typeof res.body.getReader === 'function') {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            const token = parsed.message?.content || '';
            if (token) {
              fullText += token;
              onChunk(token, fullText);
            }
          } catch {
            // 不完全なJSON行はスキップ
          }
        }
      }

      // 残りのバッファを処理
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          const token = parsed.message?.content || '';
          if (token) {
            fullText += token;
            onChunk(token, fullText);
          }
        } catch {}
      }

      return fullText;
    } else {
      // ストリーミング非対応環境へのフォールバック
      const data = await res.json();
      const reply = data.message?.content || '';
      onChunk(reply, reply);
      return reply;
    }
  } catch (err: any) {
    if (err.name === 'AbortError' || signal?.aborted) {
      throw new Error('リクエストがキャンセルされました');
    }
    if (err instanceof OllamaApiError) throw err;
    throw new OllamaApiError(
      `チャット送信に失敗しました: ${err.message || '接続エラー'}`,
      undefined,
      err
    );
  }
}
