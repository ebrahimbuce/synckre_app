import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ChatPage() {
    const { id } = useLocalSearchParams();

    // return (
    //   <KeyboardAvoidingView
    //     style={{ flex: 1 }}
    //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //     keyboardVerticalOffset={80}
    //   >
    //     <View style={{ flex: 1 }}>
    //       <ScrollView
    //         ref={scrollRef}
    //         showsVerticalScrollIndicator={false}
    //         keyboardShouldPersistTaps="handled"
    //         contentContainerStyle={{
    //           flexGrow: 1,
    //           paddingVertical: 12,
    //           paddingHorizontal: 14,
    //         }}>
    //         {messages.length === 0 && (
    //           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    //             <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
    //               Inicia una conversación escribiendo un mensaje
    //             </Text>
    //           </View>
    //         )}
    //         {messages.map((msg, index) => (
    //           <ChatMessage
    //             key={`${msg.id}-${index}`}
    //             text={msg.content}
    //             sender={msg.role === 'user' ? 'user' : 'assistant'}
    //           />
    //         ))}
    //       </ScrollView>

    //       <ChatInput text={text} setText={setText} onSend={handleSend} />
    //     </View>
    //   </KeyboardAvoidingView>
    // );

    return (
        <View>
            <Text>Chat Page {id}</Text>
        </View>
    );
}

