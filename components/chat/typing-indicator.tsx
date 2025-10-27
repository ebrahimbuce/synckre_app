import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

export function TypingIndicator() {
  const dots = [0, 1, 2];

  return (
    <View className="flex-row space-x-1 px-4 py-2">
      {dots.map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.3, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            loop: true,
            repeatReverse: true,
            delay: i * 150,
            duration: 600,
          }}
          className="h-2 w-2 rounded-full bg-foreground/60"
        />
      ))}
    </View>
  );
}
