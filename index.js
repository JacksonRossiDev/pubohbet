// index.js
import 'react-native-gesture-handler';          // <-- before anything else if you use React Navigation
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);