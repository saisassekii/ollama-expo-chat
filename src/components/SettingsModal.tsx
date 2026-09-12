import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OllamaSettings, OllamaModel } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: OllamaSettings;
  onSaveSettings: (newSettings: Partial<OllamaSettings>) => Promise<void>;
  availableModels: OllamaModel[];
  onRefreshModels: (urlOverride?: string, apiKeyOverride?: string) => Promise<OllamaModel[]>;
  onCheckHealth: (urlOverride?: string, apiKeyOverride?: string) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSaveSettings,
  availableModels,
  onRefreshModels,
  onCheckHealth,
}) => {
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setServerUrl(settings.serverUrl);
      setSelectedModel(settings.selectedModel);
      setApiKey(settings.apiKey || '');
      setSystemPrompt(settings.systemPrompt);
      setTestResult(null);
    }
  }, [visible, settings]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const isOk = await onCheckHealth(serverUrl, apiKey);
      if (isOk) {
        const models = await onRefreshModels(serverUrl, apiKey);
        setTestResult({
          ok: true,
          message: `接続成功！ 利用可能なモデル: ${models.length}個`,
        });
        if (models.length > 0 && !models.some((m) => m.name === selectedModel)) {
          setSelectedModel(models[0].name);
        }
      } else {
        setTestResult({
          ok: false,
          message: '接続できませんでした。URLやOLLAMA_HOST設定をご確認ください。',
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || '接続エラーが発生しました。',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    await onSaveSettings({
      serverUrl: serverUrl.trim(),
      selectedModel: selectedModel.trim(),
      apiKey: apiKey.trim(),
      systemPrompt: systemPrompt.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>サーバー・モデル設定</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* サーバーURL設定 */}
          <View style={styles.section}>
            <Text style={styles.label}>Ollama サーバー URL</Text>
            <Text style={styles.subLabel}>
              ローカル稼働時: http://localhost:11434 / iPhone実機時: http://PCのIP:11434
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.urlInput]}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://localhost:11434"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.testButton, isTesting && styles.buttonDisabled]}
                onPress={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.testButtonText}>接続テスト</Text>
                )}
              </TouchableOpacity>
            </View>

            {testResult && (
              <View
                style={[
                  styles.resultBox,
                  testResult.ok ? styles.resultSuccess : styles.resultError,
                ]}
              >
                <Ionicons
                  name={testResult.ok ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={testResult.ok ? '#34C759' : '#FF3B30'}
                />
                <Text
                  style={[
                    styles.resultText,
                    testResult.ok ? styles.resultTextSuccess : styles.resultTextError,
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}
          </View>

          {/* APIキー設定 (任意) */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>API キー / 認証トークン (任意)</Text>
              <Text style={styles.optionalBadge}>Optional</Text>
            </View>
            <Text style={styles.subLabel}>
              通常のローカル Ollama は空欄でOKです。認証付きプロキシやOpenAI互換サーバー利用時に入力します。
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="ローカルOllamaは空欄のままで動作します"
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowApiKey((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showApiKey ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* モデル選択 */}
          <View style={styles.section}>
            <Text style={styles.label}>使用するモデル名</Text>
            <TextInput
              style={styles.input}
              value={selectedModel}
              onChangeText={setSelectedModel}
              placeholder="qwen2.5vl:latest, llama3.2 など"
              autoCapitalize="none"
            />
            {availableModels.length > 0 && (
              <View style={styles.modelList}>
                <Text style={styles.modelListTitle}>検出されたモデル（タップして選択）:</Text>
                <View style={styles.chipsContainer}>
                  {availableModels.map((m) => (
                    <TouchableOpacity
                      key={m.name}
                      style={[
                        styles.chip,
                        selectedModel === m.name && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedModel(m.name)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedModel === m.name && styles.chipTextSelected,
                        ]}
                      >
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* システムプロンプト */}
          <View style={styles.section}>
            <Text style={styles.label}>システムプロンプト (指示・役割)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              placeholder="あなたは親切なAIアシスタントです..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* 補足ガイド */}
          <View style={styles.guideBox}>
            <Text style={styles.guideTitle}>💡 セキュリティとキー管理について</Text>
            <Text style={styles.guideText}>
              - APIキーはソースコードにハードコードされず、お使いの端末（AsyncStorage）または <Text style={styles.codeText}>.env</Text> にのみ保持されます。
            </Text>
            <Text style={styles.guideText}>
              - 標準のローカル Ollama は認証不要のため、キーの入力・設定は不要です。
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>設定を保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  optionalBadge: {
    fontSize: 11,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 10,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: 6,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  resultSuccess: {
    backgroundColor: '#E8F8EE',
  },
  resultError: {
    backgroundColor: '#FDECEC',
  },
  resultText: {
    fontSize: 13,
    flex: 1,
  },
  resultTextSuccess: {
    color: '#248A3D',
  },
  resultTextError: {
    color: '#D70015',
  },
  modelList: {
    marginTop: 12,
  },
  modelListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  chipSelected: {
    backgroundColor: '#E5F0FF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 13,
    color: '#333333',
  },
  chipTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  guideBox: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 12,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  guideText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
