import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  modelName: string;
  isConnected?: boolean | null;
  onOpenSettings: () => void;
  onNewChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modelName,
  isConnected = true,
  onOpenSettings,
  onNewChat,
}) => {
  const handleNewChat = () => {
    if (!onNewChat) return;

    if (Platform.OS === 'web') {
      const ok = window.confirm('現在の会話履歴をクリアして、新しいチャットを開始しますか？');
      if (ok) {
        onNewChat();
      }
    } else {
      Alert.alert('新しいチャット', '現在の会話履歴をクリアして、新しい会話を開始しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'クリアして開始', onPress: onNewChat, style: 'destructive' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* 左側: モデル情報 & ステータス */}
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Ollama Chat</Text>
          <View
            style={[
              styles.statusBadge,
              isConnected ? styles.badgeOnline : styles.badgeOffline,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isConnected ? styles.dotOnline : styles.dotOffline,
              ]}
            />
            <Text style={styles.badgeText}>
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <Text style={styles.modelSubtitle} numberOfLines={1}>
          Model: {modelName || 'llama3.2'}
        </Text>
      </View>

      {/* 右側: アクションボタン */}
      <View style={styles.actions}>
        {onNewChat && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNewChat}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={21} color="#1C1C1E" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={21} color="#1C1C1E" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  badgeOnline: {
    backgroundColor: '#E8F8EE',
  },
  badgeOffline: {
    backgroundColor: '#FDECEC',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: '#34C759',
  },
  dotOffline: {
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34C759',
  },
  modelSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
