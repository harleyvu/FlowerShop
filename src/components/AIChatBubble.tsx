import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import aiService from '../api/googleAI';

type Msg = { id: string; sender: 'user' | 'ai'; text: string };

export default function AIChatBubble({ flowers }: { flowers: any[] }) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const flowersText = useMemo(() => {
    return flowers
      .map((f) => `- ${f.name} (Category: ${f.category}, Price: ${f.price} VND)`)
      .join('\n');
  }, [flowers]);

  async function send() {
    if (!input?.trim()) return;
    const userMsg: Msg = { id: String(Date.now()), sender: 'user', text: input.trim() };
    setMsgs((s) => [userMsg, ...s]);
    setInput('');
    setLoading(true);
    try {
      const text = await aiService.askAI(userMsg.text, flowers, msgs);
      const aiMsg: Msg = { id: String(Date.now() + 1), sender: 'ai', text: text ?? 'No response' };
      setMsgs((s) => [aiMsg, ...s]);
    } catch (err: any) {
      const aiMsg: Msg = { id: String(Date.now() + 2), sender: 'ai', text: `AI Error: ${err?.message ?? 'unknown'}` };
      setMsgs((s) => [aiMsg, ...s]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity style={styles.fab} onPress={() => setVisible((v) => !v)}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>AI</Text>
        </TouchableOpacity>
      </View>

      {visible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.chatWrap}
        >
          <View style={styles.header}>
            <Text style={{ fontWeight: '800' }}>AI Assistant</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={{ color: '#27c16b' }}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={msgs}
            keyExtractor={(it) => it.id}
            inverted
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <View style={[styles.msgRow, item.sender === 'ai' ? styles.aiMsg : styles.userMsg]}>
                <Text style={{ color: item.sender === 'ai' ? '#000' : '#fff' }}>{item.text}</Text>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask the assistant..."
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Send</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', right: 18, bottom: 18, zIndex: 999 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#27c16b', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  chatWrap: { position: 'absolute', right: 12, bottom: 88, left: 12, top: 80, backgroundColor: '#fff', borderRadius: 12, padding: 8, elevation: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 8, height: 40 },
  sendBtn: { backgroundColor: '#27c16b', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  msgRow: { marginVertical: 6, padding: 10, borderRadius: 12, maxWidth: '80%' },
  aiMsg: { backgroundColor: '#f0f4f2', alignSelf: 'flex-start' },
  userMsg: { backgroundColor: '#27c16b', alignSelf: 'flex-end' },
});