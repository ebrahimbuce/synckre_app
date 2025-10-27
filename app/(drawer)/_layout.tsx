import React, { useEffect, useState, useCallback, use } from 'react';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { CustomDrawerContent } from '@/components/drawer/custom-drawer-content';
import { useColorScheme } from 'react-native';

interface Chat {
  id: string;
  name: string;
}

const fetchChats = async () => {
  await new Promise((res) => setTimeout(res, 800));
  return [
    { id: '1', name: 'Sofía Gómez' },
    { id: '2', name: 'Carlos Ruiz' },
    { id: '3', name: 'Grupo Devs' },
    { id: '4', name: 'Proyecto X' },
  ] as Chat[];
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isDark = colorScheme === 'dark';

  const loadChats = async () => {
    setLoading(true);
    const data = await fetchChats();
    setChats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await fetchChats();
    setChats(data);
    setRefreshing(false);
  }, []);

  return (
    <Drawer
      drawerContent={() => (
        <CustomDrawerContent
          chats={chats}
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          shadowColor: 'transparent',
          borderBottomWidth: 0,
        },
        drawerStyle: {
          width: 280,
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
        },
        overlayColor: isDark ? 'rgba(180,180,180,0.05)' : 'rgba(0,0,0,0.25)',
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
      }}>
      <Drawer.Screen name="index" options={{ title: 'Nuevo Chat' }} />
      <Drawer.Screen name="chat/[id]" options={{ title: 'Synckre' }} />
    </Drawer>
  );
}
