// src/navigation/CustomDrawerContent.tsx (o la ubicación original)
import { useUser } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { DrawerHeader } from './drawer-header';
import { ChatListItem } from './drawer-chat-list-item';
import { DrawerFooter } from './drawer-footer';

// Importa los nuevos componentes

interface Props {
  chats: Array<{
    id: string;
    name: string;
  }>;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function CustomDrawerContent({ chats, loading, refreshing, onRefresh }: Props) {
  const { user } = useUser(); // Mantén el hook aquí para la lógica de carga y colores
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textMuted = isDark ? 'text-neutral-400' : 'text-neutral-600';

  const [input, setInput] = useState('');

  if (loading && !refreshing) {
    return (
      <View className={`flex-1 items-center justify-center pt-12 ${bgColor}`}>
        <ActivityIndicator size="large" color={isDark ? '#9CA3AF' : '#6B7280'} />
      </View>
    );
  }

  // Lógica de filtrado
  const filteredChats = chats?.filter((chat) =>
    chat.name.toLowerCase().includes(input.trim().toLowerCase())
  );

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* 1. Header (Búsqueda y Nuevo Chat) */}
      <DrawerHeader input={input} setInput={setInput} />

      {/* 2. Lista de Chats */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }>
        <Text className={`mb-2 px-5 text-sm uppercase ${textMuted}`}>Chats recientes</Text>

        {filteredChats.map((chat) => (
          <ChatListItem key={chat.id} chat={chat} />
        ))}
      </ScrollView>

      {/* 3. Footer (Información de Usuario) */}
      <DrawerFooter />
    </View>
  );
}
