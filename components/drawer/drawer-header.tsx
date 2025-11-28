// src/components/DrawerHeader.tsx
import React from 'react';
import uuid from 'react-native-uuid';
import { View, TextInput, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { Search, PackagePlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  input: string;
  setInput: (text: string) => void;
}

export function DrawerHeader({ input, setInput }: HeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';


  function handleNewChat() {
    const newChatId = uuid.v4();
    router.push({
      pathname: "/chat/[id]",
      params: { id: newChatId }
    });
  }


  return (
    <View className="mt-5 flex-row items-center space-x-3 px-4 pb-3 pt-12">
      {/* Input de búsqueda */}
      <View
        className={`flex-1 flex-row items-center rounded-2xl px-3 ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'
          }`}
        style={{ height: 40 }}>
        <Search size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Buscar chat..."
          placeholderTextColor={'#999'}
          className={`flex-1 pl-2 text-base ${textColor}`}
          style={{
            paddingVertical: 4,
            includeFontPadding: false,
            textAlignVertical: 'center',
            paddingTop: 1,
            top: Platform.OS === 'ios' ? 0.1 : 0,
          }}
        />
      </View>

      {/* Botón nuevo chat */}
      <TouchableOpacity
        onPress={handleNewChat}
        className={`ml-2 h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'
          } active:opacity-70`}>
        <PackagePlus size={19} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
    </View>
  );
}
