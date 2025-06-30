// App.js
// @ts-nocheck
import React, { Component } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import rootReducer from "./redux/reducers";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Video } from "expo-av";

import RegisterScreen from "./components/auth/Register";
import LoginScreen    from "./components/auth/Login";
import MainScreen     from "./components/Main";
import AddScreen      from "./components/main/Add";
import SaveScreen     from "./components/main/Save";
import SaveScreen2    from "./components/main/Save2";
import CommentScreen  from "./components/main/Comment";
import PrePartyScreen from "./components/main/PrePartyScreen";
import PartyScreen    from "./components/main/PartyScreen";
import Paywall        from "./components/main/WithdrawScreen";
import Search from "./components/main/Search";

const store = createStore(rootReducer, applyMiddleware(thunk));
const Stack = createStackNavigator();

const firebaseConfig = {
  apiKey: "AIzaSyBbcBZZL8KRb521O5IklU3dpM6Ze4DSe90",
  authDomain: "ohbet-8d4b3.firebaseapp.com",
  projectId: "ohbet-8d4b3",
  storageBucket: "ohbet-8d4b3.appspot.com",
  messagingSenderId: "965970461687",
  appId: "1:965970461687:web:689b5c6d33f20a8b4c64f2",
  measurementId: "G-9K19GV4EZ2"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

export default class App extends Component {
  state = {
    showSplash: true,    // ← show splash video first
    loaded:     false,   // ← firebase auth loaded
    loggedIn:   false,
  };

  async componentDidMount() {
    // 1. Listen for auth:
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({ 
        loggedIn: !!user,
        loaded:   true,
      });
    });
    // 2. Fallback: hide splash after max duration
    this.splashTimer = setTimeout(() => {
      this.setState({ showSplash: false });
    }, 5000); // 5s fallback
  }

  componentWillUnmount() {
    this.splashTimer && clearTimeout(this.splashTimer);
  }

  render() {
    const { showSplash, loaded, loggedIn } = this.state;

    // 1) Splash video screen
    if (showSplash) {
      return (
        <View style={styles.splashContainer}>
          <StatusBar hidden />
          <Video
            source={require("./assets/ohbetsplash.mp4")}
            style={styles.splashVideo}
            resizeMode="cover"
            shouldPlay
            onPlaybackStatusUpdate={status => {
              if (status.didJustFinish) {
                // video finished → hide splash
                this.setState({ showSplash: false });
              }
            }}
          />
        </View>
      );
    }

    // 2) While auth is initializing
    if (!loaded) {
      return (
        <View style={styles.center}>
          <Text>Checking authentication…</Text>
        </View>
      );
    }

    // 3) Not logged in → auth stack
    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login"    component={LoginScreen} />
          
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    // 4) Logged in → main app
    return (
      <Provider store={store}>
        <NavigationContainer theme={{ 
          ...DefaultTheme,
          colors: { secondaryContainer: "transparent" },
        }}>
          <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home"             component={MainScreen} />
            <Stack.Screen name="Add"              component={AddScreen} />
            <Stack.Screen name="Save"             component={SaveScreen} />
            <Stack.Screen name="Save2"            component={SaveScreen2} />
            <Stack.Screen name="PartyScreen"      component={PartyScreen} />
            <Stack.Screen name="PrePartyScreen"   component={PrePartyScreen} />
            <Stack.Screen name="Comment"          component={CommentScreen} />
            <Stack.Screen name="Paywall"          component={Paywall} />
            <Stack.Screen name="Search"          component={Search} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  splashVideo: {
    width: "100%",
    height: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
