import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClubHeader } from '@/components/ClubHeader';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { CLUB_NAME } from '@/lib/brand';
import { hapticConfirm } from '@/lib/haptics';
import { useClubMessages } from '@/api/hooks';

export function MessagesScreen() {
  const { messages, sendMessage, markRead } = useClubMessages();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    markRead();
  }, [markRead]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    hapticConfirm();
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  return (
    <View style={styles.root}>
      <ClubHeader subtitle={`Chat con ${CLUB_NAME}`} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.clubBanner}>
            <Ionicons name="business" size={18} color={colors.teal} />
            <Text style={styles.clubBannerText}>Recepción · Respuesta habitual en 15 min</Text>
          </View>
          {messages.map((m) => {
            const isUser = m.senderId === 'user';
            return (
              <View key={m.id} style={[styles.bubbleWrap, isUser && styles.bubbleWrapUser]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleClub]}>
                  <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{m.text}</Text>
                  <Text style={[styles.time, isUser && styles.timeUser]}>
                    {new Date(m.sentAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe al club..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable onPress={handleSend} style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} disabled={!input.trim()}>
            <Ionicons name="send" size={20} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  messages: { flex: 1 },
  messagesContent: { padding: spacing.base, paddingBottom: spacing.lg },
  clubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.tealSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  clubBannerText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.teal },
  bubbleWrap: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleWrapUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '82%', padding: spacing.md, borderRadius: radius.lg },
  bubbleClub: { backgroundColor: colors.bgLight, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.separator },
  bubbleUser: { backgroundColor: colors.teal, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, lineHeight: 22 },
  bubbleTextUser: { color: colors.textOnDark },
  time: { fontFamily: fonts.body, fontSize: fontSize.micro, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  timeUser: { color: 'rgba(255,255,255,0.7)' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.bgLight,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
