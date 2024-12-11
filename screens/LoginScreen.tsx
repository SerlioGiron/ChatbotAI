import React, {useState}from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import ReactNativeBiometrics from 'react-native-biometrics';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


GoogleSignin.configure({
  scopes: ['email'],
  webClientId: "325175137681-96dvf07e821und6p3v0fdrmpqa10qjnt.apps.googleusercontent.com", // Obtén este ID de cliente de la consola de Firebase
  offlineAccess: true,
});

const rnBiometrics = new ReactNativeBiometrics();


const LoginScreen = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Correo y contraseña son requeridos.');
      return;
    }

    try {
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/login-with-email', {
        email,
        password,
      });
      if(response.status === 200){
        const user = response.data.existingUser;
        Alert.alert('Éxito', 'Inicio de sesión exitoso.');
        setLoggedIn(true);
        navigation.navigate('ChatScreen', { user });
      }
      
      // Guardar el usuario en AsyncStorage o en estado global si lo prefieres
      //await AsyncStorage.setItem('user', JSON.stringify({ email }));
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  };


  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        console.log('Inicio de sesión cancelado');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        console.log('No se obtuvo el token de acceso');
        return;
      }
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/login-with-facebook', {
        token: data.accessToken,
      });
      if(response.status === 200){
        const user = response.data.existingUser;
        Alert.alert('Éxito', 'Inicio de sesión con Facebook exitoso.');
        setLoggedIn(true);
        navigation.navigate('ChatScreen', { user });
      }
    } catch (error) {
      Alert.alert('Error en el inicio de sesión con Facebook:');
    }
  };
  const handleBiometricLogin = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', 'El dispositivo no admite autenticación biométrica.');
        return;
      }

      const result = await rnBiometrics.simplePrompt({
        promptMessage: biometryType === 'FaceID' ? 'Inicia sesión con Face ID' : 'Inicia sesión con huella digital',
      });

      if (result.success) {
        Alert.alert('Éxito', 'Autenticación biométrica exitosa.');
        navigation.navigate('ChatScreen');
      } else {
        Alert.alert('Error', 'Autenticación fallida.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo autenticar.');
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      const googleToken = idToken;
      const response = await axios.post('https://serverchatbot-paa8.onrender.com/login-with-google', {
        googleToken,
      });
      if(response.status === 200){
        const user = response.data.existingUser;
        Alert.alert('Éxito', 'Inicio de sesión con Google exitoso.');
        setLoggedIn(true);
        navigation.navigate('ChatScreen', { user });
      }
      // } else {
      //   Alert.alert('Error', 'Verificación de token fallida.');
      // }
    } catch (error) {
      if ((error as any).code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancel', 'El inicio de sesión fue cancelado.');
      } else if ((error as any).code === statusCodes.IN_PROGRESS) {
        Alert.alert('Signin in progress', 'El inicio de sesión ya está en progreso.');
      } else if ((error as any).code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('PLAY_SERVICES_NOT_AVAILABLE', 'Los servicios de Google Play no están disponibles o están desactualizados.');
      } else {
        Alert.alert('Error', 'Ocurrió un error al iniciar sesión.');
      }
    }
  };
  



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido!</Text>
      <Text style={styles.subtitle}>Inicia Sesion</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo"
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Inicio de Sesion</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Inicio de Sesion con Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.facebookButton]} onPress={handleFacebookLogin}>
        <Text style={styles.buttonText}>Inicio de Sesion con Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={handleBiometricLogin}>
        <Text style={styles.linkText}>Inicio de Sesion con Face Id</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>No tienes cuenta? Registrate</Text>
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

export default LoginScreen;
