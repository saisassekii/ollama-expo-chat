import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (text: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length === 0 || isLoading || disabled) return;
    onSend(text);
    setText('');
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* 拡張アクションボタン */}
      <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
        <Ionicons name="add" size={22} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="メッセージを入力..."
          placeholderTextColor="#8E8E93"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          editable={!disabled}
        />
      </View>

      {isLoading ? (
        <TouchableOpacity
          style={[styles.sendButton, styles.cancelButton]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Ionicons name="stop" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.sendButton, hasText ? styles.sendButtonActive : styles.sendButtonInactive]}
          onPress={handleSend}
          disabled={!hasText || disabled}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={hasText ? '#FFFFFF' : '#8E8E93'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 7 : 6,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000000',
    padding: 0,
    margin: 0,
    outlineStyle: 'none' as any,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#E5E5EA',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
});
