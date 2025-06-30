// @ts-check
import React, { Component } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/compat/app";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  fetchUser,
  fetchUserPosts,
  fetchUserFollowing,
  clearData,
} from "../redux/actions/index";

import FeedScreen from "./main/Feed";
import ProfileScreen from "./main/Profile";
import UserMatch from "./main/userMatch";
import SearchScreen from "./main/Search"
const Tab = createBottomTabNavigator();

export class Main extends Component {
  componentDidMount() {
    this.props.clearData();
    this.props.fetchUser();
    this.props.fetchUserFollowing();
    this.props.fetchUserPosts();
  }

  render() {
    return (
      <Tab.Navigator
        initialRouteName="Feed"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 80,
            paddingBottom: 15,
            borderTopColor: "#36d8ff",
            borderTopWidth: 0.5,
            overflow: "visible",
          },
          tabBarActiveTintColor: "#36d8ff",
          tabBarInactiveTintColor: "gray",
        }}
      >
        {/* Feed Tab */}
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={26} />
            ),
          }}
        />
       

        {/* Chat (Middle) Tab with Band */}
        <Tab.Screen
  name="Chat"
  component={UserMatch}
  options={{
    tabBarIcon: ({ focused }) => (
      <View style={styles.middleIconWrapper}>
        <Image
          source={require("../assets/ohbetlogonew.png")}
          style={styles.middleIcon}
        />
      </View>
    ),
    tabBarButton: props => (
      <TouchableOpacity
        {...props}
        style={[props.style, { top: -1.5 }]}
      />
    ),
  }}
/>

        {/* Profile Tab */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          listeners={({ navigation }) => ({
            tabPress: (event) => {
              event.preventDefault();
              navigation.navigate("Profile", {
                uid: firebase.auth().currentUser?.uid,
              });
            },
          })}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="account-circle"
                color={color}
                size={26}
              />
            ),
          }}
        />
        
      </Tab.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  middleIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 40,           // make it circular
    borderWidth: 0,             // kill any default border
    borderTopWidth: 4,          // only a top edge
    borderTopColor: '#36d8ff',     // or focused ? '#36d8ff' : 'grey'
    overflow: 'hidden',         // clip everything except that top border
    backgroundColor: 'white',   // matches your logo background
    alignItems: 'center',
    justifyContent: 'center',
    padding:1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  middleIcon: {
    width: 72,
    height: 72,
    borderRadius: 40,          // keep the image itself circular
  },
});




const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});
const mapDispatchProps = (dispatch) =>
  bindActionCreators(
    { fetchUser, fetchUserPosts, fetchUserFollowing, clearData },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchProps)(Main);
