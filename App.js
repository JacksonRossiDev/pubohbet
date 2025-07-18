// App.js
// @ts-nocheck
import React, { Component } from "react";
import { View, Text, StyleSheet, StatusBar, Alert } from "react-native";
import { Video } from "expo-av";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import rootReducer from "./redux/reducers";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import CConfirmedScreen from "./components/main/CConfirmedScreen";
import WithdrawScreen from "./components/main/WithdrawScreen";
import RegisterScreen from "./components/auth/Register";
import LoginScreen    from "./components/auth/Login";
import MainScreen     from "./components/Main";
import AddScreen      from "./components/main/Add";
import SaveScreen     from "./components/main/Save";
import SaveScreen2    from "./components/main/Save2";
import CommentScreen  from "./components/main/Comment";
import PrePartyScreen from "./components/main/PrePartyScreen";
import PartyScreen    from "./components/main/PartyScreen";
import Search         from "./components/main/Search";

const store = createStore(rootReducer, applyMiddleware(thunk));
const Stack = createStackNavigator();

// tell Expo how to show incoming notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:   true,
    shouldPlaySound:   false,
    shouldSetBadge:    false,
  }),
});

export default class App extends Component {
  state = {
    showSplash:    true,
    loaded:        false,
    loggedIn:      false,
    expoPushToken: null,
  };

  async componentDidMount() {
    // 1) register for push and log the token
    this.registerForPushNotificationsAsync();

    // 2) watch auth state
    this.unsubscribeAuth = firebase
      .auth()
      .onAuthStateChanged(user => {
        this.setState({
          loggedIn: !!user,
          loaded:   true,
        });
      });

    // 3) fallback splash timeout
    this.splashTimer = setTimeout(() => {
      this.setState({ showSplash: false });
    }, 5000);

    // 4) listen for notifications in-app
    this.notificationListener = Notifications.addNotificationReceivedListener(n =>
      console.log("Notification received:", n)
    );
    this.responseListener = Notifications.addNotificationResponseReceivedListener(r =>
      console.log("Notification response:", r)
    );
  }

  componentWillUnmount() {
    // clean up everything
    this.unsubscribeAuth && this.unsubscribeAuth();
    clearTimeout(this.splashTimer);
    Notifications.removeNotificationSubscription(this.notificationListener);
    Notifications.removeNotificationSubscription(this.responseListener);
  }

  // encapsulate all push setup in one method
  registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      Alert.alert("Push notifications only work on physical devices");
      return;
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Push notification permission not granted!");
      return;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log("Expo push token:", tokenData.data);
    this.setState({ expoPushToken: tokenData.data });
    // (Optional) save token to Firestore here, e.g.:
    // const u = firebase.auth().currentUser;
    // if (u) {
    //   await firebase.firestore()
    //     .collection("users")
    //     .doc(u.uid)
    //     .set({ expoPushToken: tokenData.data }, { merge: true });
    // }
  };

  render() {
    const { showSplash, loaded, loggedIn } = this.state;

    // 1) Splash
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
              if (status.didJustFinish) this.setState({ showSplash: false });
            }}
          />
        </View>
      );
    }

    // 2) Waiting for auth
    if (!loaded) {
      return (
        <View style={styles.center}>
          <Text>Checking authentication…</Text>
        </View>
      );
    }

    // 3) Main app
    return (
      <Provider store={store}>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: { secondaryContainer: "transparent" }
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
                <Stack.Screen
                  name="CConfirmedScreen"
                  component={CConfirmedScreen}
                />
                <Stack.Screen name="Search" component={Search} />
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