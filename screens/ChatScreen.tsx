import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { RouteProp } from '@react-navigation/native';

type ChatScreenRouteProp = RouteProp<{ params: { user: { id: string; nombre: string; apellido: string; email: string } } }, 'params'>;

const ChatScreen = ({ route }: { route: ChatScreenRouteProp }) => {
  const { user } = route.params || {}; // Obtiene el usuario de las props de navegación
  const navigation = useNavigation<any>();
  interface Message {
    text: string;
    sender: 'user' | 'bot';
  }
  
  const [messages, setMessages] = useState<Message[]>([]); // Almacena los mensajes
  const [inputText, setInputText] = useState(''); // Texto del input
  //console.log(user);
  const sendMessage = () => {
    if (inputText.trim() !== '') {
      // Añade el mensaje del usuario
      const userMessage: Message = {text: inputText, sender: 'user'};
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Limpia el input
      setInputText('');

      // Respuesta del bot
      setTimeout(() => {
        let botMessage: Message = {text: '', sender: 'bot'};

        axios
          .post('https://serverchatbot-paa8.onrender.com/detect-intent', {
            text: inputText,
            token: user.id,
          })
          .then(response => {
            const botMessage: Message = {
              text: response.data.respuesta,
              sender: 'bot',
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);
          })
          .catch(error => {
            console.error('Error:', error);
          });
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }, 1000); // Retraso de 1 segundo para simular procesamiento
    }
  };

  const handleLogout = () => {
    // Implement your logout logic here
    // Navigate to the LoginScreen
    navigation.navigate('Login');
    console.log('User logged out');
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/get-chat-by-token', {
        token: user.id,
      });

      if (response.status === 200) {
        const chatHistory = response.data;
        const formattedMessages = chatHistory.flatMap((chat: { pregunta: string; respuesta: string }) => [
          { text: chat.pregunta, sender: 'user' },
          { text: chat.respuesta, sender: 'bot' },
        ]);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };


  React.useEffect(() => {
    console.log("cargando mensajes ....");
    fetchChatHistory();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        {messages.map((message, index) => (
          <Text
            key={index}
            style={
              message.sender === 'user' ? styles.userMessage : styles.botMessage
            }>
            {message.text}
          </Text>
        ))}
      </ScrollView>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TextInput
          style={[styles.input, {flex: 1}]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
