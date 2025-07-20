// App.js
// @ts-nocheck
import 'react-native-gesture-handler'; // required if you use React Navigation
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Video } from 'expo-av';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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
        // Pass UID so helper can save + alert
        await this.registerForPushNotificationsAsync(user.uid);
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

  /**
   * Pulls an Expo push token, saves it to state & Firestore, and shows a confirmation Alert.
   * @param {string} uid  Firebase Auth UID of the current user
   */
/**
 * Pulls an Expo push token, saves it to state & Firestore, and shows a confirmation Alert.
 * @param {string} uid  Firebase Auth UID of the current user
 */
registerForPushNotificationsAsync = async (uid) => {
  console.log('🏁 Starting push flow', {
    uid,
    buildProfile: 'production',  // hard-coded for TestFlight
    dev: __DEV__,
    platform: Platform.OS,
    osVersion: Platform.Version,
  });

  // 1) Check existing permissions
  const { status: existingStatus, granted, canAskAgain } =
    await Notifications.getPermissionsAsync();
  console.log('🔍 Existing permissions:', { existingStatus, granted, canAskAgain });

  // 2) Request if not granted
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status, granted: granted2, canAskAgain: canAskAgain2 } =
      await Notifications.requestPermissionsAsync();
    console.log('🎯 Requested permissions:', { status, granted2, canAskAgain2 });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('⚠️ Push permissions denied');
    Alert.alert('Permissions denied', 'Cannot receive push notifications.');
    return null;
  }

  // 3) Fetch the Expo push token
  let tokenResponse;
  try {
    tokenResponse = await Notifications.getExpoPushTokenAsync();
    console.log('🎉 getExpoPushTokenAsync response:', tokenResponse);
  } catch (err) {
    console.error('❌ Error fetching Expo push token:', err);
    Alert.alert('Token error', err.message || String(err));
    return null;
  }
  const token = tokenResponse.data;
  console.log('🏷 Expo push token:', token);

  // 4) Save to Firestore
  try {
    console.log('💾 Writing token to Firestore for uid:', uid);
    await firebase
      .firestore()
      .collection('users')
      .doc(uid)
      .set({ expoPushToken: token }, { merge: true });
    console.log('✅ Firestore write succeeded');
    Alert.alert('Push Enabled', `Token saved (${token.slice(-8)})`);
  } catch (err) {
    console.error('❌ Firestore write failed:', err);
    Alert.alert('Save error', err.message || String(err));
  }

  return token;
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