import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const ChatScreen = () => {
  interface Message {
    text: string;
    sender: 'user' | 'bot';
  }

  const [messages, setMessages] = useState<Message[]>([]); // Almacena los mensajes
  const [inputText, setInputText] = useState(''); // Texto del input

  const sendMessage = () => {
    if (inputText.trim() !== '') {
      // Añade el mensaje del usuario
      const userMessage: Message = { text: inputText, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Limpia el input
      setInputText('');

      // Respuesta del bot
      setTimeout(() => {
        const botMessage = generateBotResponse(inputText); // Genera la respuesta del bot
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }, 1000); // Retraso de 1 segundo para simular procesamiento
    }
  };

  const generateBotResponse = (userText: string) => {
    let response;

    // Respuestas básicas dependiendo del mensaje del usuario
    if (userText.toLowerCase().includes('hola')) {
      response = '¡Hola! ¿Cómo puedo ayudarte? 😊';
    } else if (userText.toLowerCase().includes('gracias')) {
      response = '¡De nada! Siempre estoy aquí para ayudarte. 🙌';
    } else if (userText.toLowerCase().includes('adiós') || userText.toLowerCase().includes('bye') || userText.toLowerCase().includes('adios')) {
      response = '¡Adiós! Que tengas un gran día. 🌟';
    } else {
      response = 'Lo siento, no entiendo tu mensaje. 🤔';
    }

    return { text: response, sender: 'bot' } as Message;
  };

  return (
    <View style={styles.container}>
      {/* Área de mensajes */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input para escribir el mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4caf50',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4caf50',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatScreen;
