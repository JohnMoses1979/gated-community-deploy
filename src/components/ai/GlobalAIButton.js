/**
 * GlobalAIButton.js
 *
 * Floating AI assistant button + bottom-sheet chat modal.
 * Works on EVERY screen for EVERY role (resident, admin, guard, vendor…)
 *
 * Architecture:
 *   Frontend  →  POST /api/ai/chat (JWT auth)
 *   Backend   →  fetches live DB context + calls Groq API
 *   Backend   →  returns AI reply to frontend
 *
 * The Groq API key lives ONLY on the server — never exposed to the client.
 *
 * Voice input: uses Groq Whisper via /api/ai/transcribe (optional).
 * Requires expo-av:  npx expo install expo-av
 */

import React, {
  useState, useRef, useEffect, useCallback, useContext, createContext,
} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  Modal, Animated, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, SafeAreaView, Dimensions, Pressable, Keyboard,
} from 'react-native';
import { useAuthStore } from '../../store/AuthStore';
import { API_URL } from '../../services/apiClient';

const { height: SCREEN_H } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  teal:      '#1A7A7A',
  tealDark:  '#0D6E6E',
  tealSoft:  '#E8F5F5',
  tealMid:   '#D0EEEE',
  bg:        '#F0F9F9',
  surface:   '#FFFFFF',
  text:      '#1A2E2E',
  textMuted: '#7A9E9E',
  border:    '#D0EEEE',
  danger:    '#C62828',
  userBubble:'#1A7A7A',
  userText:  '#FFFFFF',
  aiBubble:  '#FFFFFF',
  aiText:    '#1A2E2E',
};

// ─── Role-based quick suggestions ─────────────────────────────────────────────
const SUGGESTIONS_BY_ROLE = {
  resident:   ['My maintenance status?', 'Book amenity slot', 'Add a visitor', 'Latest notices'],
  admin:      ['Pending approvals?', 'Open maintenance count', 'Active SOS alerts', 'Recent notices'],
  security:   ['Pending visitors?', 'Active SOS alerts', 'Check deliveries', 'Patrol log'],
  vendor:     ['My open jobs?', 'Pending payments', 'Submit a quote', 'Check schedule'],
  superadmin: ['Pending approvals?', 'Total residents', 'Active issues', 'Recent notices'],
  builder:    ['My projects status', 'Pending bookings', 'Construction updates', 'Payments due'],
  customer:   ['Browse projects', 'My bookings', 'Site visit status', 'Payment schedule'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid     = () => Math.random().toString(36).slice(2);
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(d, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0,  duration: 300, useNativeDriver: true }),
        Animated.delay(600 - i * 200),
      ]))
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={c.typingBubble}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[c.typingDot, { transform: [{ translateY: d }] }]} />
      ))}
    </View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ item }) {
  const isUser = item.role === 'user';
  return (
    <View style={[c.msgRow, isUser ? c.msgRowUser : c.msgRowAI]}>
      {!isUser && (
        <View style={c.aiAvatar}><Text style={{ fontSize: 15 }}>🤖</Text></View>
      )}
      <View style={[c.bubble, isUser ? c.bubbleUser : c.bubbleAI]}>
        <Text style={[c.bubbleText, { color: isUser ? P.userText : P.aiText }]}>
          {item.content}
        </Text>
        <Text style={[c.timeText, { color: isUser ? 'rgba(255,255,255,0.6)' : P.textMuted }]}>
          {fmtTime(item.sentAt)}
        </Text>
      </View>
    </View>
  );
}

// ─── Chat Modal ───────────────────────────────────────────────────────────────
function AIChatModal({ visible, onClose, role, userName, token }) {
  const suggestions = SUGGESTIONS_BY_ROLE[role] || SUGGESTIONS_BY_ROLE.resident;

  const [messages, setMessages]         = useState([]);
  const [inputText, setInputText]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [isRecording, setIsRecording]   = useState(false);
  const [recordingObj, setRecordingObj] = useState(null);
  const [voiceAvail, setVoiceAvail]     = useState(false);
  const [kbHeight, setKbHeight]         = useState(0);

  const flatRef    = useRef(null);
  const historyRef = useRef([]);   // conversation history sent to backend
  const slideAnim  = useRef(new Animated.Value(SCREEN_H)).current;

  // Track keyboard height for Android (KAV inside Modal is unreliable on Android)
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Greet on open
  useEffect(() => {
    if (visible) {
      historyRef.current = [];
      setMessages([{
        id: uid(), role: 'assistant', sentAt: new Date().toISOString(),
        content: `👋 Hi${userName ? ` ${userName.split(' ')[0]}` : ''}! I'm your BSGated AI Assistant with live access to your community data. How can I help?`,
      }]);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    } else {
      slideAnim.setValue(SCREEN_H);
    }
  }, [visible]);

  // Check expo-av availability
  useEffect(() => {
    try { require('expo-av'); setVoiceAvail(true); } catch { setVoiceAvail(false); }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // ── Call backend /api/ai/chat ─────────────────────────────────────────────
  const callBackendAI = async (userText) => {
    // Add user message to history
    historyRef.current = [...historyRef.current, { role: 'user', content: userText }];

    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages: historyRef.current }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || err?.message || `Server error ${res.status}`);
    }

    const data  = await res.json();
    const reply = data.reply || 'Sorry, no response received.';

    // Add assistant reply to history
    historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];
    return reply;
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (override) => {
    const text = (override ?? inputText).trim();
    if (!text || isLoading) return;
    setInputText('');
    const userMsg = { id: uid(), role: 'user', content: text, sentAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    scrollToBottom();
    try {
      const reply = await callBackendAI(text);
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant', content: reply, sentAt: new Date().toISOString(),
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
        content: `⚠️ ${e.message}`,
        sentAt: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    if (!voiceAvail) {
      Alert.alert('Voice Unavailable', 'Run: npx expo install expo-av\nthen restart the app.');
      return;
    }
    try {
      const { Audio } = require('expo-av');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObj(recording);
      setIsRecording(true);
    } catch (e) { Alert.alert('Mic Error', e.message); }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;
    setIsRecording(false);
    try {
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setRecordingObj(null);
      if (!uri) throw new Error('No audio recorded');
      setIsLoading(true);

      // Send to Groq Whisper via backend proxy
      const fd = new FormData();
      fd.append('file', { uri, type: 'audio/m4a', name: 'voice.m4a' });

      const res = await fetch(`${API_URL}/ai/transcribe`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });

      if (!res.ok) {
        // Fallback: if transcribe endpoint not available, just show error
        setIsLoading(false);
        Alert.alert('Voice Error', 'Transcription not available. Please type your message.');
        return;
      }

      const data = await res.json();
      const transcript = data?.text?.trim();
      setIsLoading(false);

      if (!transcript) {
        Alert.alert('Voice Error', 'Could not transcribe. Please speak clearly and try again.');
        return;
      }
      setInputText(transcript);
      await handleSend(transcript);
    } catch (e) {
      setIsLoading(false);
      setRecordingObj(null);
      Alert.alert('Voice Error', e.message);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 250, useNativeDriver: true })
      .start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Pressable style={c.backdrop} onPress={handleClose} />

      <Animated.View style={[c.sheet, { transform: [{ translateY: slideAnim }], paddingBottom: kbHeight }]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={c.header}>
            <View style={c.headerLeft}>
              <View style={c.aiAvatarHeader}><Text style={{ fontSize: 20 }}>🤖</Text></View>
              <View>
                <Text style={c.headerTitle}>AI Assistant</Text>
                <Text style={c.headerSub}>BSGated · Live community data</Text>
              </View>
            </View>
            <View style={c.headerRight}>
              <TouchableOpacity
                style={c.clearBtn}
                onPress={() => {
                  historyRef.current = [];
                  setMessages([{
                    id: uid(), role: 'assistant', sentAt: new Date().toISOString(),
                    content: '🔄 Chat cleared! Ask me anything.',
                  }]);
                }}
                activeOpacity={0.7}
              >
                <Text style={c.clearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={c.closeBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={c.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* Messages */}
            <FlatList
              ref={flatRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <MessageBubble item={item} />}
              contentContainerStyle={c.msgList}
              onContentSizeChange={scrollToBottom}
              ListHeaderComponent={messages.length <= 1 ? (
                <View style={c.suggestWrap}>
                  <Text style={c.suggestLabel}>Quick questions:</Text>
                  <View style={c.chips}>
                    {suggestions.map(s => (
                      <TouchableOpacity
                        key={s} style={c.chip}
                        onPress={() => handleSend(s)} activeOpacity={0.75}
                      >
                        <Text style={c.chipText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}
              ListFooterComponent={isLoading ? (
                <View style={c.msgRowAI}>
                  <View style={c.aiAvatar}><Text style={{ fontSize: 15 }}>🤖</Text></View>
                  <TypingDots />
                </View>
              ) : null}
            />

            {/* Recording bar */}
            {isRecording && (
              <View style={c.recBar}>
                <View style={c.recDot} />
                <Text style={c.recText}>Recording… tap 🎙️ to stop</Text>
              </View>
            )}

            {/* Input row */}
            <View style={c.inputRow}>
              <TouchableOpacity
                style={[c.micBtn, isRecording && c.micBtnActive]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                {isRecording
                  ? <View style={c.recDotBtn} />
                  : <Text style={{ fontSize: 18 }}>🎙️</Text>
                }
              </TouchableOpacity>
              <TextInput
                style={c.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isRecording ? '🔴 Recording…' : 'Ask anything about your community…'}
                placeholderTextColor={P.textMuted}
                multiline
                maxLength={500}
                editable={!isRecording}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                style={[c.sendBtn, (!inputText.trim() || isLoading) && c.sendBtnOff]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={c.sendIcon}>➤</Text>
                }
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

// ─── Floating Button ──────────────────────────────────────────────────────────
function FloatingAIButton({ onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
          Animated.timing(glow,  { toValue: 1,    duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
          Animated.timing(glow,  { toValue: 0,    duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const glowScale   = pulse.interpolate({ inputRange: [1, 1.12], outputRange: [1, 1.5] });

  return (
    <View style={f.wrap} pointerEvents="box-none">
      <Animated.View style={[f.glowRing, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <TouchableOpacity style={f.btn} onPress={onPress} activeOpacity={0.85}>
          <Text style={f.icon}>🤖</Text>
          <View style={f.badge}><Text style={f.badgeText}>AI</Text></View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Context + Provider ───────────────────────────────────────────────────────
const AIContext = createContext(null);
export const useAI = () => useContext(AIContext);

export function GlobalAIProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const user       = useAuthStore(s => s.user);
  const role       = useAuthStore(s => s.role);
  const token      = useAuthStore(s => s.token);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);

  return (
    <AIContext.Provider value={{ openAI: () => setVisible(true) }}>
      <View style={{ flex: 1 }}>
        {children}

        {/* Only show floating button after login */}
        {isLoggedIn && (
          <FloatingAIButton onPress={() => setVisible(true)} />
        )}

        {/* Chat modal — always mounted so animation works */}
        {isLoggedIn && (
          <AIChatModal
            visible={visible}
            onClose={() => setVisible(false)}
            role={role || 'resident'}
            userName={user?.name || user?.ownerName || user?.fullName || ''}
            token={token}
          />
        )}
      </View>
    </AIContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const f = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 82,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  glowRing: {
    position: 'absolute',
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: P.teal,
  },
  btn: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: P.teal,
    alignItems: 'center', justifyContent: 'center',
    elevation: 10,
    shadowColor: P.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  icon:      { fontSize: 26 },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1,
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#fff' },
});

const c = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: SCREEN_H * 0.88,
    backgroundColor: P.bg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: P.teal, paddingHorizontal: 16, paddingVertical: 14,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiAvatarHeader: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 1 },
  clearBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  clearText:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Messages
  msgList:    { padding: 14, paddingBottom: 8 },
  msgRow:     { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI:   { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: P.tealSoft, alignItems: 'center', justifyContent: 'center',
    marginRight: 6, borderWidth: 1, borderColor: P.tealMid,
  },
  bubble: {
    maxWidth: '76%', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  bubbleUser: { backgroundColor: P.userBubble, borderBottomRightRadius: 4 },
  bubbleAI:   { backgroundColor: P.aiBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: P.border },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timeText:   { fontSize: 10, marginTop: 4, textAlign: 'right' },

  // Typing
  typingBubble: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: P.aiBubble, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: P.border,
  },
  typingDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: P.textMuted, marginHorizontal: 3,
  },

  // Suggestions
  suggestWrap:  { marginBottom: 14 },
  suggestLabel: { fontSize: 11, color: P.textMuted, marginBottom: 6, marginLeft: 2 },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    backgroundColor: P.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: P.tealMid,
  },
  chipText: { fontSize: 11, color: P.teal, fontWeight: '700' },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 10, paddingVertical: 10,
    backgroundColor: P.surface, borderTopWidth: 1, borderTopColor: P.border, gap: 8,
  },
  micBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: P.tealSoft, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: P.tealMid,
  },
  micBtnActive: { backgroundColor: '#FEE2E2', borderColor: P.danger },
  recDotBtn:    { width: 13, height: 13, borderRadius: 6.5, backgroundColor: P.danger },
  input: {
    flex: 1, backgroundColor: P.bg, borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    fontSize: 14, color: P.text, borderWidth: 1, borderColor: P.border, maxHeight: 90,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: P.tealMid },
  sendIcon:   { color: '#fff', fontSize: 17, marginLeft: 2 },

  // Recording bar
  recBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEE2E2', paddingVertical: 7, gap: 7,
  },
  recDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: P.danger },
  recText: { fontSize: 12, color: P.danger, fontWeight: '700' },
});
