import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from 'react-native';
import { CustomDrawerContent } from '@/components/drawer/custom-drawer-content';


export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  return (
    <Drawer
      drawerContent={() => (
        <CustomDrawerContent
          chats={[]}
          loading={false}
          refreshing={false}
          onRefresh={() => { }}
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
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Nuevo Chat' }} />
      <Drawer.Screen name="chat/[chatid]" options={{ title: 'Synckre' }} />
    </Drawer>
  );
}
