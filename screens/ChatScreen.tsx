import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';

import {RouteProp} from '@react-navigation/native';

type ChatScreenRouteProp = RouteProp<
  {
    params: {
      user: {id: string; nombre: string; apellido: string; email: string};
    };
  },
  'params'
>;

const ChatScreen = ({route}: {route: ChatScreenRouteProp}) => {
  const {user} = route.params || {}; // Obtiene el usuario de las props de navegación
  const navigation = useNavigation();

  interface Message {
    text: string;
    sender: 'user' | 'bot';
  }

  const [messages, setMessages] = useState<Message[]>([]); // Almacena los mensajes
  const [inputText, setInputText] = useState(''); // Texto del input
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para el pop-up
  const [sentimentData, setSentimentData] = useState<string | null>(null); // Datos del endpoint

  const sendMessage = () => {
    if (inputText.trim() !== '') {
      const userMessage: Message = {text: inputText, sender: 'user'};
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputText('');
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
    }
  };

  const handleLogout = () => {
    navigation.navigate('Login');
    console.log('User logged out');
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.post(
        'https://serverchatbot-paa8.onrender.com/get-chat-by-token',
        {
          token: user.id,
        },
      );

      if (response.status === 200) {
        const chatHistory = response.data;
        const formattedMessages = chatHistory.flatMap(
          (chat: {pregunta: string; respuesta: string}) => [
            {text: chat.pregunta, sender: 'user'},
            {text: chat.respuesta, sender: 'bot'},
          ],
        );
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleChangeProfilePicture = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setProfilePicture(selectedImage.uri || null);
        }
      },
    );
  };

  const fetchSentimentAverage = async () => {
    try {
      const response = await axios.post(
        'https://serverchatbot-paa8.onrender.com/get-sentiment-average',
        {
          token: user.id,
        },
      );

      if (response.status === 200) {
        if (response.data.sentiment_average >= 0.7) {
          setSentimentData(
            `The average sentiment of your messages really good.\n 😊 \n ${response.data.sentiment_average}`,
          ); // Mensaje positivo
        } else if (response.data.sentiment_average >= 0.4) {
          setSentimentData(
            `The average sentiment of your messages is neutral.\n 🙂 \n ${response.data.sentiment_average}`,
          ); // Mensaje neutra
        } else {
          setSentimentData(
            `The average sentiment of your messages is not good.\n 😞 \n ${response.data.sentiment_average}`,
          );
         } // Mensaje negativo
        // setSentimentData(JSON.stringify(response.data.sentiment_average, null, 2)); // Almacena los datos formateados
      }
    } catch (error) {
      console.error('Error fetching sentiment average:', error);
      setSentimentData('Failed to fetch sentiment data.');
    }
  };

  const openModal = () => {
    fetchSentimentAverage();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  React.useEffect(() => {
    fetchChatHistory();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.sender === 'user'
                ? styles.userMessageContainer
                : styles.botMessageContainer,
            ]}>
            {message.sender === 'user' && (
              <Image
                source={
                  profilePicture
                    ? {uri: profilePicture}
                    : require('./assets/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg') // Imagen por defecto
                }
                style={styles.profileImage}
              />
            )}
            <Text
              style={
                message.sender === 'user'
                  ? styles.userMessage
                  : styles.botMessage
              }>
              {message.text}
            </Text>
          </View>
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
      <TouchableOpacity onPress={openModal} style={styles.modalButton}>
        <Text style={styles.modalButtonText}>View Sentiment Data</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleChangeProfilePicture}
        style={styles.changePhotoButton}>
        <Text style={styles.changePhotoButtonText}>Change Profile Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Modal para mostrar los datos */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalText}>
                {sentimentData || 'Loading...'}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (otros estilos que ya tienes)
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    maxWidth: '80%', // Limita el ancho máximo del contenedor del mensaje de usuario
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    maxWidth: '80%', // Limita el ancho máximo del contenedor del mensaje del bot
  },
  userMessage: {
    backgroundColor: '#DCF8C6',
    padding: 20,
    borderRadius: 10,
  },
  botMessage: {
    backgroundColor: '#ECECEC',
    padding: 10,
    borderRadius: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
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
  changePhotoButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  changePhotoButtonText: {
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
  // modalContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
  // },
  // modalContent: {
  //   backgroundColor: '#FFF',
  //   padding: 20,
  //   borderRadius: 10,
  //   alignItems: 'center',
  // },
  // modalText: {
  //   fontSize: 16,
  //   marginBottom: 20,
  // },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sentimentButton: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  sentimentButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center', // Centra horizontalmente
    justifyContent: 'center', // Centra verticalmente el contenido del modal
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center', // Centra el texto dentro del modal
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
