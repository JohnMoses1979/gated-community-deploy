/**
 * AIChatScreen.js
 *
 * AI Assistant chat screen for Gated Community App.
 * Features:
 *   - Text messaging with Groq LLM (llama-3.3-70b-versatile)
 *   - Voice input using Groq Whisper (audio transcription)
 *   - Community-aware system prompt
 *   - Typing indicator, timestamps, scroll-to-bottom
 *
 * Place this file at:
 *   src/screens/resident/ai/AIChatScreen.js
 *
 * Dependencies already in project: none extra needed for text chat.
 * For VOICE: install expo-av   →   npx expo install expo-av
 *
 * Setup:
 *   Replace YOUR_GROQ_API_KEY below with your actual key from console.groq.com
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';

// ─── Groq Config ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';  // ← Replace with your key from console.groq.com
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const CHAT_MODEL = 'llama-3.3-70b-versatile';
const WHISPER_MODEL = 'whisper-large-v3-turbo';

// ─── Palette (matches ResidentProfileScreen / ResidentDashboard) ───────────────
const P = {
  teal:      '#1A7A7A',
  tealDark:  '#0D6E6E',
  tealSoft:  '#E8F5F5',
  tealMid:   '#D0EEEE',
  bg:        '#E8F5F5',
  surface:   '#FFFFFF',
  text:      '#1A2E2E',
  textMuted: '#7A9E9E',
  textSub:   '#3D6E6E',
  border:    '#D0EEEE',
  userBubble:'#1A7A7A',
  userText:  '#FFFFFF',
  aiBubble:  '#FFFFFF',
  aiText:    '#1A2E2E',
  inputBg:   '#FFFFFF',
  micActive: '#C62828',
  micIdle:   '#1A7A7A',
  danger:    '#C62828',
};

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful AI assistant for a gated residential community called BSGated. 
You help residents with questions about:
- Visitor and delivery pass management
- Amenity bookings (pool, gym, clubhouse, etc.)
- Maintenance requests and status
- Community notices and announcements
- Billing and payments
- EV charging slot bookings
- Marketplace and buy/sell listings
- Guest parking
- Real estate listings within the community
- SOS and security alerts
- General community rules and guidelines

Be friendly, concise, and helpful. If you don't know something specific about this community, 
say so and suggest the resident contact the admin. Keep responses short and to the point.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const uid = () => Math.random().toString(36).slice(2);

// ─── Typing dots animation ─────────────────────────────────────────────────────
function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (anim) => ({
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: P.textMuted, marginHorizontal: 3,
    transform: [{ translateY: anim }],
  });

  return (
    <View style={styles.typingBubble}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ item }) {
  const isUser = item.role === 'user';
  return (
    <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, { color: isUser ? P.userText : P.aiText }]}>
          {item.content}
        </Text>
        <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.65)' : P.textMuted }]}>
          {fmtTime(item.sentAt)}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function AIChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: uid(),
      role: 'assistant',
      content: '👋 Hi! I\'m your BSGated AI Assistant. Ask me anything about your community — visitors, amenities, maintenance, billing, and more!',
      sentAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingObj, setRecordingObj] = useState(null);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const flatRef = useRef(null);
  const conversationHistory = useRef([]);   // tracks {role, content} for Groq API

  // ── Try to load expo-av (optional) ──────────────────────────────────────────
  useEffect(() => {
    try {
      require('expo-av');
      setVoiceAvailable(true);
    } catch {
      setVoiceAvailable(false);
    }
  }, []);

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  // ── Call Groq Chat API ────────────────────────────────────────────────────────
  const callGroq = async (userText) => {
    // Add user message to conversation history
    conversationHistory.current.push({ role: 'user', content: userText });

    try {
      const res = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.current,
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I couldn\'t get a response.';

      // Add assistant reply to history
      conversationHistory.current.push({ role: 'assistant', content: reply });

      return reply;
    } catch (e) {
      // Keep history clean on error
      conversationHistory.current.pop();
      throw e;
    }
  };

  // ── Send text message ─────────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isLoading) return;

    setInputText('');

    const userMsg = { id: uid(), role: 'user', content: text, sentAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    scrollToBottom();

    try {
      const reply = await callGroq(text);
      const aiMsg = { id: uid(), role: 'assistant', content: reply, sentAt: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const errMsg = {
        id: uid(),
        role: 'assistant',
        content: `⚠️ Error: ${e.message}. Please check your Groq API key and try again.`,
        sentAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────────────
  const startRecording = async () => {
    if (!voiceAvailable) {
      Alert.alert(
        'Voice Unavailable',
        'Install expo-av to enable voice input:\n\nnpx expo install expo-av\n\nThen restart the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const { Audio } = require('expo-av');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObj(recording);
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Microphone Error', e.message);
    }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;
    setIsRecording(false);

    try {
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setRecordingObj(null);

      if (!uri) throw new Error('No audio recorded');

      // Transcribe with Groq Whisper
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'voice.m4a',
      });
      formData.append('model', WHISPER_MODEL);
      formData.append('language', 'en');

      const res = await fetch(GROQ_WHISPER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const transcript = data?.text?.trim();

      if (!transcript) {
        setIsLoading(false);
        Alert.alert('Voice Error', 'Could not transcribe audio. Please speak clearly and try again.');
        return;
      }

      // Show transcript in input briefly, then send
      setInputText(transcript);
      setIsLoading(false);
      await handleSend(transcript);
    } catch (e) {
      setIsLoading(false);
      setRecordingObj(null);
      Alert.alert('Voice Error', e.message);
    }
  };

  // ── Quick suggestions ─────────────────────────────────────────────────────────
  const SUGGESTIONS = [
    'How to add a visitor?',
    'Book amenity slot',
    'Raise maintenance request',
    'Pay my bill',
  ];

  const renderSuggestion = (label) => (
    <TouchableOpacity
      key={label}
      style={styles.chip}
      onPress={() => handleSend(label)}
      activeOpacity={0.75}
    >
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiDot} />
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSub}>BSGated · Powered by Groq</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            conversationHistory.current = [];
            setMessages([{
              id: uid(),
              role: 'assistant',
              content: '🔄 Chat cleared! How can I help you?',
              sentAt: new Date().toISOString(),
            }]);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages ── */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={isLoading ? (
            <View style={styles.msgRowAI}>
              <View style={styles.aiAvatar}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </View>
              <TypingDots />
            </View>
          ) : null}
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View style={styles.suggestionsRow}>
                <Text style={styles.suggestLabel}>Try asking:</Text>
                <View style={styles.chips}>
                  {SUGGESTIONS.map(renderSuggestion)}
                </View>
              </View>
            ) : null
          }
        />

        {/* ── Input Row ── */}
        <View style={styles.inputRow}>
          {/* Voice button */}
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <View style={styles.recDot} />
            ) : (
              <Text style={styles.micIcon}>🎙️</Text>
            )}
          </TouchableOpacity>

          {/* Text input */}
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isRecording ? '🔴 Recording… tap mic to stop' : 'Ask anything about your community…'}
            placeholderTextColor={P.textMuted}
            multiline
            maxLength={500}
            editable={!isRecording}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recording status bar */}
        {isRecording && (
          <View style={styles.recordingBar}>
            <View style={styles.recDotSmall} />
            <Text style={styles.recordingText}>Recording… tap 🎙️ to stop and send</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  // Header
  header: {
    backgroundColor: P.teal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
  },
  backBtn: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  backArrow: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiDot: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  clearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Messages
  msgList: {
    padding: 16,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: P.tealSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: P.tealMid,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  bubbleUser: {
    backgroundColor: P.userBubble,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: P.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: P.border,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },

  // Typing
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.aiBubble,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: P.border,
    elevation: 1,
  },

  // Suggestions
  suggestionsRow: {
    marginBottom: 16,
  },
  suggestLabel: {
    fontSize: 12,
    color: P.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: P.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: P.tealMid,
  },
  chipText: {
    fontSize: 12,
    color: P.teal,
    fontWeight: '600',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: P.surface,
    borderTopWidth: 1,
    borderTopColor: P.border,
    gap: 8,
  },
  micBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: P.tealSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: P.tealMid,
  },
  micBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: P.danger,
  },
  micIcon: {
    fontSize: 20,
  },
  recDot: {
    width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: P.danger,
  },
  input: {
    flex: 1,
    backgroundColor: P.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: P.text,
    borderWidth: 1,
    borderColor: P.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: P.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: P.tealMid,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 2,
  },

  // Recording bar
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    gap: 8,
  },
  recDotSmall: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: P.danger,
  },
  recordingText: {
    fontSize: 12,
    color: P.danger,
    fontWeight: '600',
  },
});
