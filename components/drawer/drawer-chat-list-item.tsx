// src/components/ChatListItem.tsx (o donde guardes tus componentes)
import React from 'react';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Archive, Trash2, Edit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ContextMenu from 'zeego/context-menu';
import { saveLastChatId } from '@/lib/utils/chatStorage';

interface ChatItemProps {
  chat: { id: string; name: string };
}

export function ChatListItem({ chat }: ChatItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';

  // Las funciones de manejo del menú contextual
  const handleArchive = () => console.log(`Archivando chat ${chat.name}`);
  const handleRename = () => console.log(`Renombrando chat ${chat.name}`);
  const handleDelete = () => console.log(`Eliminando chat ${chat.name}`);

  // Manejar navegación y guardar chat seleccionado
  const handlePress = async () => {
    await saveLastChatId(chat.id);
    router.push(`/chat/${chat.id}`);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <TouchableOpacity
          // Toque simple: NAVEGA y guarda el chat seleccionado
          onPress={handlePress}
          className={`flex-row items-center px-5 py-3 ${
            isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
          }`}
          activeOpacity={0.7}>
          <Text className={`flex-1 text-base ${textColor}`} numberOfLines={1}>
            {chat.name}
          </Text>
        </TouchableOpacity>
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        {/* Archivar */}
        <ContextMenu.Item key="archive" onSelect={handleArchive}>
          <ContextMenu.ItemTitle>Archivar</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon>
            <Archive size={18} color={'#000'} />
          </ContextMenu.ItemIcon>
        </ContextMenu.Item>

        {/* Renombrar */}
        <ContextMenu.Item key="rename" onSelect={handleRename}>
          <ContextMenu.ItemTitle>Renombrar</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon>
            <Edit size={18} color={'#000'} />
          </ContextMenu.ItemIcon>
        </ContextMenu.Item>

        <ContextMenu.Separator />

        {/* Eliminar (Destructivo) */}
        <ContextMenu.Item key="delete" onSelect={handleDelete} destructive>
          <ContextMenu.ItemTitle>Eliminar</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon>
            <Trash2 size={18} color={'red'} />
          </ContextMenu.ItemIcon>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
