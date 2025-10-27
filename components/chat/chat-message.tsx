import React from 'react';
import { View, useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import Markdown from 'react-native-markdown-display';
import { Text } from '../ui/text';

type ChatMessageProps = {
  text: string;
  sender: 'me' | 'ai';
};

export function ChatMessage({ text, sender }: ChatMessageProps) {
  const isAI = sender === 'ai';
  const colorScheme = useColorScheme();
  const aiTextColor = colorScheme === 'dark' ? '#e5e7eb' : '#111827';

  // Dividimos por líneas para animación fade línea por línea
  const lines = text.split(/\n+/).filter(Boolean);

  return (
    <View
      style={{
        marginVertical: 6,
        alignSelf: isAI ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
      }}>
      {isAI ? (
        <View
          style={{
            borderRadius: 12,
            padding: 10,
          }}>
          {lines.map((line, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, translateY: 4 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 150, type: 'timing', duration: 400 }}
              style={{ marginBottom: 4 }}>
              <Markdown
                style={{
                  body: {
                    color: aiTextColor,
                    fontSize: 18.5,
                    lineHeight: 24,
                  },
                  heading1: { fontSize: 24, fontWeight: '700', color: aiTextColor },
                  heading2: { fontSize: 20, fontWeight: '700', color: aiTextColor },
                  code_block: {
                    backgroundColor: colorScheme === 'dark' ? '#111827' : '#e5e7eb',
                    padding: 8,
                    borderRadius: 6,
                    fontFamily: 'Courier',
                  },
                }}>
                {line}
              </Markdown>
            </MotiView>
          ))}
        </View>
      ) : (
        <View className="my-2 rounded-2xl bg-secondary px-4 py-3">
          <Text className="text-lg leading-6">{text}</Text>
        </View>
      )}
    </View>
  );
}
