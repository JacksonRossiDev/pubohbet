// App.js
// @ts-nocheck
import 'react-native-gesture-handler'; // required if you use React Navigation
import React, { Component } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, Platform } from 'react-native';
import { Video } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import rootReducer from './redux/reducers';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CConfirmedScreen from './components/main/CConfirmedScreen';
import WithdrawScreen     from './components/main/WithdrawScreen';
import RegisterScreen     from './components/auth/Register';
import LoginScreen        from './components/auth/Login';
import MainScreen         from './components/Main';
import AddScreen          from './components/main/Add';
import SaveScreen         from './components/main/Save';
import SaveScreen2        from './components/main/Save2';
import CommentScreen      from './components/main/Comment';
import PrePartyScreen     from './components/main/PrePartyScreen';
import PartyScreen        from './components/main/PartyScreen';
import Search             from './components/main/Search';

// ————————————————————————
// Firebase initialization
const firebaseConfig = {
  apiKey:             "AIzaSyBbcBZZL8KRb521O5IklU3dpM6Ze4DSe90",
  authDomain:         "ohbet-8d4b3.firebaseapp.com",
  projectId:          "ohbet-8d4b3",
  storageBucket:      "ohbet-8d4b3.appspot.com",
  messagingSenderId:  "965970461687",
  appId:              "1:965970461687:web:689b5c6d33f20a8b4c64f2",
  measurementId:      "G-9K19GV4EZ2"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ————————————————————————
// Redux store
const store = createStore(rootReducer, applyMiddleware(thunk));

// ————————————————————————
// React Navigation stack
const Stack = createStackNavigator();

// ————————————————————————
// Expo notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:   true,
    shouldPlaySound:   false,
    shouldSetBadge:    false,
  }),
});

// Android notification channel (required on Android 8+)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name:             'default',
    importance:       Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       '#FF231F7C',
  });
}

export default class App extends Component {
  state = {
    showSplash:    true,
    loaded:        false,
    loggedIn:      false,
    expoPushToken: null,
  };

  componentDidMount() {
    // 1) Watch Firebase auth state, then register & save push token once logged in
    this.unsubscribeAuth = firebase.auth().onAuthStateChanged(async (user) => {
      this.setState({ loaded: true, loggedIn: !!user });

      if (user) {
        const token = await this.registerForPushNotificationsAsync();

        if (token) {
          try {
            await firebase
              .firestore()
              .collection('users')
              .doc(user.uid)
              .set({ expoPushToken: token }, { merge: true });
            console.log('Expo push token saved to Firestore');
          } catch (e) {
            console.error('Failed to save push token', e);
          }
        }
      }
    });

    // 2) Fallback splash timeout
    this.splashTimer = setTimeout(() => {
      this.setState({ showSplash: false });
    }, 5000);

    // 3) In-app notification listeners
    this.notificationListener = Notifications.addNotificationReceivedListener(n =>
      console.log('Notification received:', n)
    );
    this.responseListener = Notifications.addNotificationResponseReceivedListener(r =>
      console.log('Notification response:', r)
    );
  }

  componentWillUnmount() {
    this.unsubscribeAuth && this.unsubscribeAuth();
    clearTimeout(this.splashTimer);
    Notifications.removeNotificationSubscription(this.notificationListener);
    Notifications.removeNotificationSubscription(this.responseListener);
  }

  // Encapsulate push setup; returns the token string
  registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      Alert.alert('Push notifications only work on physical devices');
      return null;
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Push notification permission not granted!');
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('Expo push token:', tokenData.data);
    this.setState({ expoPushToken: tokenData.data });
    return tokenData.data;
  };

  render() {
    const { showSplash, loaded, loggedIn } = this.state;

    // 1) Splash screen (video)
    if (showSplash) {
      return (
        <View style={styles.splashContainer}>
          <StatusBar hidden />
          <Video
            source={require('./assets/ohbetsplash.mp4')}
            style={styles.splashVideo}
            resizeMode="cover"
            shouldPlay
            onPlaybackStatusUpdate={status => {
              if (status.didJustFinish) this.setState({ showSplash: false });
            }}
          />
        </View>
      );
    }

    // 2) Waiting for Firebase auth
    if (!loaded) {
      return (
        <View style={styles.center}>
          <Text>Checking authentication…</Text>
        </View>
      );
    }

    // 3) Main application
    return (
      <Provider store={store}>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: { secondaryContainer: 'transparent' },
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!loggedIn ? (
              <>
                <Stack.Screen name="Login"    component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Home"           component={MainScreen} />
                <Stack.Screen name="Add"            component={AddScreen} />
                <Stack.Screen name="Save"           component={SaveScreen} />
                <Stack.Screen name="Save2"          component={SaveScreen2} />
                <Stack.Screen name="PartyScreen"    component={PartyScreen} />
                <Stack.Screen name="PrePartyScreen" component={PrePartyScreen} />
                <Stack.Screen name="Comment"        component={CommentScreen} />
                <Stack.Screen name="Withdraw"       component={WithdrawScreen} />
                <Stack.Screen name="CConfirmedScreen" component={CConfirmedScreen} />
                <Stack.Screen name="Search"         component={Search} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  splashVideo: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});