import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage } from '@/components/chat/chat-message';
import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';

export default function ChatPage() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! ¿En qué puedo ayudarte hoy?', sender: 'ai' },
  ]);

  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), text, sender: 'me' as const };
    setMessages((prev) => [...prev, newMsg]);
    setText('');

    // simula respuesta IA
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: 'Interesante pregunta 🤔. Déjame pensar un momento...',
        sender: 'ai' as const,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1200);
  };

  // Scroll al final cuando se agregan mensajes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Scroll al abrir el teclado
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => showSub.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80} // ajusta según tu header
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} text={msg.text} sender={msg.sender as 'me' | 'ai'} />
          ))}
        </ScrollView>

        <ChatInput text={text} setText={setText} onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}
