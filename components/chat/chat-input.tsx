import React from 'react';
import { View, Pressable, useColorScheme } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowUpIcon, PlusIcon } from 'lucide-react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { CHAT_ACTIONS_SHEET_ID } from './chat-action-sheet';
import { AutoGrowingInput } from '@/components/ui/auto-growing-input';

type ChatInputProps = {
  text: string;
  setText: (t: string) => void;
  onSend: () => void;
};

const showChatActions = () => {
  SheetManager.show(CHAT_ACTIONS_SHEET_ID);
};

export function ChatInput({ text, setText, onSend }: ChatInputProps) {
  const isDark = useColorScheme() === 'dark';
  return (
    <View className=" px-4 pb-8">
      <View className="flex flex-row items-end justify-between pt-4 gap-3">
        {/* Botón Plus */}
        <Button
          variant="default"
          size="icon"
          onPress={showChatActions}
          className="h-11 w-11 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 active:opacity-70">
          <Icon as={PlusIcon} size={26} />
        </Button>

        {/* Contenedor redondeado estilo ChatGPT */}
        <View className="flex-1 flex-row items-end rounded-3xl  dark:bg-zinc-500/10 bg-secondary  shadow-sm overflow-hidden">
          {/* Input que crece en altura usando el componente reutilizable */}
          <AutoGrowingInput
            className="flex-1 px-4 py-3 "
            placeholder="Escribe un mensaje..."
            minHeight={48}
            maxHeight={200}
            onChangeText={setText}
            value={text}
          />

          {/* Botón de enviar dentro del contenedor */}
          <View className="pr-2 pb-2 items-center justify-center">
            <Pressable
              onPress={onSend}
              disabled={text.length === 0}
              className="h-8 w-8 rounded-full bg-black dark:bg-white disabled:opacity-50 items-center justify-center">
              <ArrowUpIcon size={18} color={isDark ? '#18181b' : '#ffffff'} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
