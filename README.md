# Ollama Expo Chat

Expo (React Native + TypeScript) で構築した、ローカル PC 上で動作する Ollama (ローカル LLM) とリアルタイムに対話できるモバイルおよび Web 対応のチャットアプリケーションです。

---

## 主な特徴

- **リアルタイムストリーミング通信**: Ollama API (`/api/chat`, `stream: true`) と接続し、生成中のテキストを逐次受信してリアルタイムに描画します。
- **安全な設定・キー管理**: ソースコードに一切ハードコードせず、端末ローカルストレージ (`AsyncStorage`) または `.env` による安全な設定管理に対応しています。
- **モデル自動検出・切り替え**: 接続先 Ollama サーバーから利用可能なモデル一覧を自動取得し、UI から選択・切り替えが可能です。
- **カスタムシステムプロンプト**: AI の役割や指示（ペルソナ）を設定画面から自由に設定できます。
- **マルチプラットフォーム対応**: iOS (Expo Go / 実機)、Android、Web ブラウザ（PC）に対応しています。
- **会話履歴の永続化**: 端末ローカルに会話履歴を保存し、アプリ再起動後も直前のやり取りを保持します。

---

## 技術スタック

| カテゴリ | 採用技術 | バージョン / 備考 |
|---|---|---|
| **フレームワーク** | React Native (Expo SDK 57) | TypeScript |
| **プラットフォーム** | iOS / Android / Web | React 19 / RN 0.86 |
| **ストレージ** | `@react-native-async-storage/async-storage` | 設定・会話履歴の端末内保存 |
| **UI / アイコン** | `@expo/vector-icons`, `react-native-safe-area-context` | iOS ネイティブ風デザイン |
| **AI / バックエンド** | [Ollama](https://ollama.com/) | ローカル PC で稼働するオープンソース LLM |
| **通信プロトコル** | HTTP REST API / NDJSON Streaming | `/api/chat`, `/api/tags`, `/api/version` |

---

## クイックスタート

### 1. 前提条件の確認
- **Node.js**: v20 以上
- **Ollama**: PC 上にインストール済みで、対象モデルがダウンロードされていること
  ```bash
  # モデルのダウンロード例
  ollama pull qwen2.5vl:latest
  # または
  ollama pull llama3.2
  ```

### 2. インストール
```bash
git clone https://github.com/saisassekii/ollama-expo-chat.git
cd ollama-expo-chat
npm install
```

### 3. Ollama サーバーの起動
iPhone 実機などローカルネットワークから接続する場合は、外部アクセスを許可して起動します：

```bash
# macOS / Linux
OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS="*" ollama serve

# Windows (PowerShell)
$env:OLLAMA_HOST="0.0.0.0"; $env:OLLAMA_ORIGINS="*"; ollama serve
```

### 4. アプリの起動

#### Web ブラウザで実行（最も手軽に動作確認）
```bash
npx expo start --web
```

#### iPhone 実機 (Expo Go) で実行
```bash
# 同一 Wi-Fi ネットワーク接続時
npx expo start -c

# WSL2環境やWi-Fi制限を回避するトンネルモード（推奨）
npx expo start --tunnel -c
```
ターミナルに表示された QR コードを iPhone のカメラまたは「Expo Go」アプリで読み取ってください。

---

## 設定と環境変数

### アプリ内設定画面
アプリ右上の設定アイコンから、以下の項目をいつでも変更・保存できます：
- **Ollama サーバー URL**: 
  - Web ブラウザ時: `http://localhost:11434`
  - iPhone 実機時: `http://<PCのローカルIPアドレス>:11434` (例: `http://192.168.1.50:11434`)
- **API キー / 認証トークン (任意)**: 認証プロキシや外部 OpenAI 互換サーバー利用時に入力
- **使用モデル**: サーバーから自動検出されたモデル一覧から選択
- **システムプロンプト**: AI の振る舞い・役割の指定

### 環境変数 (`.env`) ※任意
初期起動時のデフォルト値を変更したい場合は、ルートに `.env` を作成します（`.gitignore` 済み）：

```env
# .env
EXPO_PUBLIC_OLLAMA_URL=http://localhost:11434
EXPO_PUBLIC_DEFAULT_MODEL=qwen2.5vl:latest
EXPO_PUBLIC_API_KEY=
```

---

## ディレクトリ構造

```text
ollama-expo-chat/
├── src/
│   ├── components/            # UI コンポーネント
│   │   ├── Header.tsx         # ヘッダー (モデル名・状態表示・設定/クリアボタン)
│   │   ├── MessageBubble.tsx  # メッセージ吹き出し (ユーザー/AIアバター・タイムスタンプ)
│   │   ├── ChatInput.tsx      # メッセージ入力バー & 送信/停止ボタン
│   │   └── SettingsModal.tsx  # サーバー接続・モデル選択・APIキー設定モーダル
│   ├── services/
│   │   └── ollama.ts          # Ollama API 通信 (ストリーミング・モデル取得・疎通確認)
│   ├── hooks/
│   │   ├── useChat.ts         # チャット送受信・ストリーミング・履歴保存フック
│   │   └── useSettings.ts     # 設定の永続化・モデル一覧管理フック
│   ├── types/
│   │   └── index.ts           # 型定義 (ChatMessage, OllamaModel, OllamaSettings)
│   └── constants/
│       ├── config.ts          # デフォルト設定値・ストレージキー
│       └── mockData.ts        # 静的プレビュー用モックデータ
├── App.tsx                    # メインチャット画面
├── app.json                   # Expo アプリ構成
├── package.json
└── README.md
```

---

## 開発ツール

本プロジェクトの設計・実装およびリファクタリングは、**Google Gemini CLI** を活用した AI ペアプログラミングによって行われました。

---

## ライセンス

[MIT License](LICENSE)
