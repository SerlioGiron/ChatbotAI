import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


GoogleSignin.configure({
  scopes: ['email'],
  webClientId: "325175137681-96dvf07e821und6p3v0fdrmpqa10qjnt.apps.googleusercontent.com", // Obtén este ID de cliente de la consola de Firebase
  offlineAccess: true,
});
const RegisterScreen = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !nombre || !apellido || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }
    if(password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/register-with-email', {
        nombre,
        apellido,
        email,
        password,
      });

      // Verifica si la respuesta es correcta
      const data = response.data;

      // Guardar el usuario en AsyncStorage
      //await AsyncStorage.setItem('user', JSON.stringify(data.user));
      //await AsyncStorage.setItem('loggedIn', 'true');

      // Navegar a la pantalla principal
      navigation.navigate('ChatScreen', { user: data.user });
    } catch (error: any) {
      // Manejar errores (pueden ser de servidor o de red)
      const errorMessage = error.response?.data?.error || 'Error desconocido';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      const googleToken = idToken;
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/register-with-google', {
        googleToken,
      });
      const data = response.data;

      //await AsyncStorage.setItem('user', JSON.stringify(data.user));
      //await AsyncStorage.setItem('loggedIn', 'true');

      navigation.navigate('ChatScreen', { user: data.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error desconocido';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleFacebookRegister = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        Alert.alert('Cancelado', 'El registro con Facebook fue cancelado');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('No se pudo obtener el token de acceso');
      }
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/register-with-facebook', {
        token: data.accessToken,
      });
      const resData = response.data;

      //await AsyncStorage.setItem('user', JSON.stringify(resData.user));
      //await AsyncStorage.setItem('loggedIn', 'true');

      navigation.navigate('ChatScreen', { user: resData.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error desconocido';
      Alert.alert('Error', errorMessage);
    }
  };

  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una cuenta</Text>
      <Text style={styles.subtitle}>Registrate para tener acceso a nuestras herramientas</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        placeholderTextColor="#aaa"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleRegister}>
        <Text style={styles.buttonText}>Registrarse con Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.facebookButton]} onPress={handleFacebookRegister}>
        <Text style={styles.buttonText}>Registrarse con Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login') }>
        <Text style={styles.linkText}>Ya tienes cuenta? Inicia Sesion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#3b5998',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;
