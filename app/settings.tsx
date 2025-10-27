import React from 'react';
import { ScrollView, View, Pressable, Platform, SectionList, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@clerk/clerk-expo';

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { signOut } = useAuth();

  const toggleTheme = () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      className={'flex-1 bg-background'}>
      {/* Sección: Apariencia */}
      <View
        className={`${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'} mx-4 mb-6 mt-4 overflow-hidden rounded-2xl`}>
        <Pressable
          onPress={toggleTheme}
          className="flex-row items-center justify-between px-4 py-4">
          <Text className="text-base">Modo oscuro</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </Pressable>
      </View>

      {/* Botón rojo solo */}
      <View
        className={`${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'} mx-4 overflow-hidden rounded-2xl`}>
        <Pressable onPress={() => signOut()} className="items-center justify-center px-4 py-4">
          <Text className="text-base font-medium text-red-500">Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
