import * as SecureStore from 'expo-secure-store';

const LAST_CHAT_KEY = 'last_chat_id';

/**
 * Guarda el ID del último chat seleccionado
 */
export async function saveLastChatId(chatId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(LAST_CHAT_KEY, chatId);
  } catch (error) {
    console.error('Error saving last chat ID:', error);
  }
}

/**
 * Obtiene el ID del último chat seleccionado
 */
export async function getLastChatId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(LAST_CHAT_KEY);
  } catch (error) {
    console.error('Error getting last chat ID:', error);
    return null;
  }
}


