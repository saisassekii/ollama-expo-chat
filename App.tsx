import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './src/components/Header';
import { MessageBubble } from './src/components/MessageBubble';
import { ChatInput } from './src/components/ChatInput';
import { SettingsModal } from './src/components/SettingsModal';
import { useSettings } from './src/hooks/useSettings';
import { useChat } from './src/hooks/useChat';
import { Ionicons } from '@expo/vector-icons';

function ChatAppContent() {
  const {
    settings,
    updateSettings,
    availableModels,
    refreshModels,
    checkHealth,
    isConnected,
    isLoadingSettings,
  } = useSettings();

  const {
    messages,
    isLoading: isChatLoading,
    error,
    sendMessage,
    cancelMessage,
    clearMessages,
  } = useChat(settings);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  // 起動時にサーバー疎通とモデル一覧を取得
  useEffect(() => {
    if (!isLoadingSettings) {
      checkHealth().then((ok) => {
        if (ok) {
          refreshModels().catch(() => {});
        }
      });
    }
  }, [isLoadingSettings, checkHealth, refreshModels]);

  // 新規メッセージ・ストリーミング受信時に自動スクロール
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (isLoadingSettings) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ヘッダー */}
        <Header
          modelName={settings.selectedModel}
          isConnected={isConnected}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewChat={clearMessages}
        />

        {/* 接続警告バナー (未接続時) */}
        {isConnected === false && (
          <View style={styles.warningBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#D70015" />
            <Text style={styles.warningText}>
              Ollamaサーバー ({settings.serverUrl}) に接続できません。右上の⚙️からURLをご確認ください。
            </Text>
          </View>
        )}

        {/* エラーメッセージバナー */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={16} color="#8A6D00" />
            <Text style={styles.errorText} numberOfLines={2}>
              {error}
            </Text>
          </View>
        )}

        {/* メッセージ一覧 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="sparkles" size={40} color="#007AFF" />
              </View>
              <Text style={styles.emptyTitle}>Ollama と対話を開始</Text>
              <Text style={styles.emptySubtitle}>
                モデル: <Text style={styles.boldText}>{settings.selectedModel}</Text>
              </Text>
              <Text style={styles.emptyDescription}>
                下部の入力欄にメッセージを入力して送信してください。AIがリアルタイムに回答を生成します。
              </Text>
            </View>
          }
        />

        {/* ストリーミング生成中インジケータ */}
        {isChatLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.typingText}>回答を生成中...</Text>
          </View>
        )}

        {/* 入力欄 */}
        <ChatInput
          onSend={sendMessage}
          onCancel={cancelMessage}
          isLoading={isChatLoading}
        />

        {/* 設定モーダル */}
        <SettingsModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={updateSettings}
          availableModels={availableModels}
          onRefreshModels={refreshModels}
          onCheckHealth={checkHealth}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatAppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFD1D1',
  },
  warningText: {
    fontSize: 12,
    color: '#D70015',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFE29A',
  },
  errorText: {
    fontSize: 12,
    color: '#8A6D00',
    flex: 1,
  },
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
