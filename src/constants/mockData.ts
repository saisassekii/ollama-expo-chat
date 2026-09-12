import { ChatMessage } from '../types';

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'mock-1',
    role: 'user',
    content: 'こんにちは！Ollamaを使ってiPhoneからローカルLLMとチャットできるアプリを作りたいです。',
    createdAt: Date.now() - 1000 * 60 * 5, // 5分前
  },
  {
    id: 'mock-2',
    role: 'assistant',
    content: `こんにちは！それは素晴らしいプロジェクトですね！🚀

Expo (React Native) と Ollama を組み合わせることで、手軽にiPhoneからローカルLLMと対話するアプリを構築できます。

### 実現のポイント
1. **Ollamaの外部公開設定**:
   ホストPC側で \`OLLAMA_HOST=0.0.0.0\` を指定して起動します。
2. **同一Wi-Fi接続**:
   iPhoneとPCを同一のLAN内に接続し、PCのローカルIP（例: \`http://192.168.1.50:11434\`）を指定します。
3. **快適なチャットUI**:
   メッセージの自動スクロール、Markdown表示、リアルタイムなストリーミング応答を組み合わせます。

まずはどのようなUIや機能を優先して試してみたいですか？`,
    createdAt: Date.now() - 1000 * 60 * 4, // 4分前
  },
  {
    id: 'mock-3',
    role: 'user',
    content: 'まずはチャット画面のレイアウトやフォント、吹き出しのデザインを確認したいです！',
    createdAt: Date.now() - 1000 * 60 * 2, // 2分前
  },
  {
    id: 'mock-4',
    role: 'assistant',
    content: `了解しました！現在表示されているのがチャットUIの静的プレビューです✨

- **ユーザーメッセージ**: 右寄せ・アクセントカラー（ブルー）
- **AIアシスタント**: 左寄せ・アバターアイコン付き・上品なライトグレー
- **下部入力欄**: 複数行入力対応・モダンな丸みのあるボタン

デザインのサイズ感や色合い、マージンなどのご要望があればいつでも調整可能です！`,
    createdAt: Date.now() - 1000 * 60 * 1, // 1分前
  },
];
