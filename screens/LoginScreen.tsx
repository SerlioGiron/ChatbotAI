import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import ReactNativeBiometrics from 'react-native-biometrics';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


GoogleSignin.configure({
  scopes: ['email'],
  webClientId: "325175137681-96dvf07e821und6p3v0fdrmpqa10qjnt.apps.googleusercontent.com", // Obtén este ID de cliente de la consola de Firebase
  offlineAccess: true,
});

const rnBiometrics = new ReactNativeBiometrics();


const LoginScreen = ({navigation}: {navigation: NavigationProp<any>}) => {

  const[email, setEmail] = useState('');
  const[password, setPassword] = useState('');
  const [loggedIn, setloggedIn] = useState(false);
  const [userInfo, setuserInfo] = useState([]);
  
  const handleFacebookLogin = async () => {
    try {
      // Pide permisos al usuario
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);

      if (result.isCancelled) {
        console.log("Inicio de sesión cancelado");
        return;
      }

      // Obtén el token de acceso
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        console.log("No se obtuvo el token de acceso");
        return;
      }

      console.log("Token de acceso:", data.accessToken);

      // Ejemplo de llamada al backend:
      // const response = await fetch('http://tu-backend.com/auth/facebook', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ accessToken: data.accessToken }),
      // });
      // const userInfo = await response.json();
      // console.log("Usuario autenticado:", userInfo);
    } catch (error) {
      console.error("Error en el inicio de sesión con Facebook:", error);
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
            promptMessage: biometryType === 'FaceID'
                ? 'Inicia sesión con Face ID'
                : 'Inicia sesión con huella digital'
        });

        if (result.success) {
            Alert.alert('Éxito', 'Autenticación biométrica exitosa.');
            navigation.navigate('Chat');
        } else {
            Alert.alert('Error', 'Autenticación fallida.');
        }
    } catch (error) {
        Alert.alert('Error', 'No se pudo autenticar. ');
    }
};
const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const {accessToken, idToken} = await GoogleSignin.getTokens();
    setloggedIn(true);

    // Muestra un mensaje de éxito
    console.log('Info de usuario:', userInfo);
    console.log('Token de acceso:', accessToken);
    Alert.alert('Log in successfully');
  } catch (error) {
    if ((error as any).code === statusCodes.SIGN_IN_CANCELLED) {
      // El usuario canceló el flujo de inicio de sesión
      Alert.alert('Cancel');
    } else if ((error as any).code === statusCodes.IN_PROGRESS) {
      Alert.alert('Signin in progress');
      // La operación (por ejemplo, inicio de sesión) ya está en progreso
    } else if ((error as any).code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('PLAY_SERVICES_NOT_AVAILABLE');
      // Los servicios de Google Play no están disponibles o están desactualizados
    } else {
      // Ocurrió otro error
      Alert.alert('An error occurred');
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
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatScreen')}>
        <Text style={styles.buttonText}>Inicio de Sesion</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={signInWithGoogle}>
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
