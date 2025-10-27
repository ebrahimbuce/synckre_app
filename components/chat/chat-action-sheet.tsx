// src/components/ChatActionSheet.tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Camera, Image as ImageIcon, Lightbulb, Zap, Globe, Brush } from 'lucide-react-native';

// Definimos un ID único para gestionar esta hoja
export const CHAT_ACTIONS_SHEET_ID = 'chatActionsSheet';

// Definimos la estructura de una acción (para evitar repetición)
const ActionItem = ({ IconComponent, title, description, isDark, onPress }: any) => {
  const textColor = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-neutral-400' : 'text-neutral-600';
  const iconColor = isDark ? '#FFF' : '#000';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center py-3 active:opacity-70 ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
      {/* Icono Principal Grande */}
      <View className="mr-4 w-10 items-center justify-center">
        <IconComponent size={24} color={iconColor} />
      </View>

      {/* Contenido de Texto */}
      <View className="flex-1">
        <Text className={`text-lg font-medium ${textColor}`}>{title}</Text>
        <Text className={`text-sm ${textMuted}`}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export function ChatActionSheet() {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? 'bg-neutral-950' : 'bg-white';
  const sheetRef = useRef(null);

  // Funciones de ejemplo
  const handleAction = (action: string) => {
    console.log(`Acción seleccionada: ${action}`);
    SheetManager.hide(CHAT_ACTIONS_SHEET_ID); // Ocultar después de seleccionar
    // Aquí iría la lógica específica de cada acción
  };

  return (
    <ActionSheet
      id={CHAT_ACTIONS_SHEET_ID}
      ref={sheetRef}
      gestureEnabled={true}
      containerStyle={{ backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' }} // Fondo del modal
    >
      <ScrollView className={`p-4 ${bgColor}`} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* -------------------- 1. SECCIÓN DE FOTOS (Simulación de Carrusel) -------------------- */}
        <View className="mb-4">
          <Text className={`text-right text-base font-medium text-blue-500`}>All Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {/* Ítem 1: Botón de Cámara */}
            <TouchableOpacity className="mr-2 h-24 w-24 items-center justify-center rounded-xl bg-neutral-700/50">
              <Camera size={32} color="white" />
            </TouchableOpacity>

            {/* Ítem 2, 3, 4: Simulación de Imágenes/Placeholder */}
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  className="mr-2 h-24 w-24 rounded-xl border border-neutral-700 bg-neutral-800/50"
                />
              ))}
          </ScrollView>
        </View>

        {/* Línea Separadora */}
        <View className="my-4 h-[1px] bg-neutral-200/20" />

        {/* -------------------- 2. LISTA DE ACCIONES -------------------- */}
        <View>
          <ActionItem
            IconComponent={Brush}
            title="Create image"
            description="Visualize anything"
            isDark={isDark}
            onPress={() => handleAction('Create image')}
          />
          <ActionItem
            IconComponent={Lightbulb}
            title="Thinking"
            description="Think longer for better answers"
            isDark={isDark}
            onPress={() => handleAction('Thinking')}
          />
          <ActionItem
            IconComponent={Zap}
            title="Deep research"
            description="Get a detailed report"
            isDark={isDark}
            onPress={() => handleAction('Deep research')}
          />
          <ActionItem
            IconComponent={Globe}
            title="Web search"
            description="Find real-time news and info"
            isDark={isDark}
            onPress={() => handleAction('Web search')}
          />
        </View>
      </ScrollView>
    </ActionSheet>
  );
}
