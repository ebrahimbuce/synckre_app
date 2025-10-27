// src/components/DrawerFooter.tsx
import React from 'react';
import { View, Text, Image, useColorScheme } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export function DrawerFooter() {
  const { user } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';

  return (
    <View className="mb-4 px-5 py-4">
      <View className="flex-row items-center">
        <Image source={{ uri: user?.imageUrl }} className="mr-3 h-10 w-10 rounded-full" />
        <Text
          className={`text-lg font-medium ${textColor}`}
          onPress={() => router.push('/settings')}>
          {user?.fullName}
        </Text>
      </View>
    </View>
  );
}
