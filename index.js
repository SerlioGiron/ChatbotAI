/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerComponent(appName, () => LoginScreen);
