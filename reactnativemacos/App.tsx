import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import './global.css';

import type { Message } from './types';

import { runAI } from './ai';

function App(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      {
        role: 'user',
        content: input.trim(),
        id: Math.random().toString(),
      } as Message,
    ];

    setInput('');
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const updatedMessages = await runAI({ messages: newMessages });
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error running AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesToDisplay = useMemo(() => {
    const filteredMessages: {
      role: 'assistant' | 'user';
      content: string;
    }[] = [];
    for (const msg of messages) {
      if (msg.role === 'assistant' || msg.role === 'user') {
        if (Array.isArray(msg.content)) {
          for (const content of msg.content) {
            if (content.type === 'text') {
              filteredMessages.push({
                role: msg.role,
                content: content.text!,
              });
            }
          }
        } else {
          filteredMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }
    return filteredMessages;
  }, [messages]);

  return (
    <SafeAreaView className="flex-1 bg-[#1e1e1e]">
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />

      <View className="h-[60px] bg-[#2c2c2c] justify-center items-center border-b border-b-[#3a3a3a]">
        <Text className="text-lg font-semibold text-white">AI Assistant</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 mx-4"
          contentContainerClassName="pb-4 pt-2"
          showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center h-[300px]">
              <Text className="text-[#888] text-base">
                Send a message to start a conversation
              </Text>
            </View>
          ) : (
            messagesToDisplay.map((message, index) => (
              <View
                key={index}
                className={`max-w-[85%] p-3.5 rounded-2xl mb-4 mx-1 ${message.role === 'user'
                  ? 'bg-[#0b93f6] self-end rounded-br-[4px] ml-[50px]'
                  : 'bg-[#2c2c2c] self-start rounded-bl-[4px] mr-[50px]'
                  }`}>
                <Text
                  className={`text-base leading-[22px] ${message.role === 'user' ? 'text-white' : 'text-[#f0f0f0]'
                    }`}>
                  {message.content.trim()}
                </Text>
              </View>
            ))
          )}

          {isLoading && (
            <View className="max-w-[85%] p-3.5 rounded-2xl mb-4 mx-1 bg-[#2c2c2c] self-start rounded-bl-[4px] mr-[50px]">
              <Text className="text-[#aaa] italic">Thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View className="flex-row p-2.5 bg-[#2c2c2c] border-t border-t-[#3a3a3a] items-center">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            onSubmitEditing={handleSend}
            className="flex-1 bg-[#3a3a3a] rounded-[20px] px-4 py-2.5 max-h-[100px] text-white text-base"
          />
          <TouchableOpacity
            className={`ml-2.5 ${!input.trim() ? 'bg-[#444]' : 'bg-[#0b93f6]'
              } rounded-[20px] p-2.5 px-4 justify-center items-center`}
            onPress={handleSend}
            disabled={!input.trim()}>
            <Text className="text-white font-semibold">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App;
