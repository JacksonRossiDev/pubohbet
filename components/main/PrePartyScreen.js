// PrePartyScreen.js
// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';

import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import AnimatedHand from "./AnimatedHand";
import { moderateScale } from "react-native-size-matters";
import { TouchableOpacity } from "react-native-gesture-handler";

const PrePartyScreen = ({ currentUser, route, navigation }) => {
  // log to confirm
  useEffect(() => {
    console.log("PreParty params:", route.params);
  }, [route.params]);
  const goback = async () => {
    console.log("hi");

    navigation.navigate("Home")
    
  }
  const {
    postId,
    wager = 0,

    // now matching your Feed.js
    creatorUid,
    creatorPPUrl,

    riskerUid,
    riskerPPUrl,

    agreementCount = 0,
  } = route.params;

  const [self, setSelf] = useState(null);
  useEffect(() => {
    const unsub = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser?.uid)
      .onSnapshot((snap) => {
        if (snap.exists) setSelf(snap.data());
      });
    return () => unsub();
  }, []);

  const isRisker = currentUser.uid === riskerUid;

  const gotoDeal = async () => {
    try {
      // 1) mark handshake in Firestore
      await firebase
        .firestore()
        .collection("posts")
        .doc(creatorUid)            // the user‐folder
        .collection("userPosts")    // their sub‐collection
        .doc(postId)                // the actual post
        .update({ handsShaken: true });
  
      // 2) then navigate
      navigation.navigate("PartyScreen", {
        postId,
        wager,
        creatorUid,
        creatorPPUrl,
        creatorBalance: self?.creditBalance ?? 0,
        riskerUid,
        riskerPPUrl,
        riskerBalance: self?.creditBalance ?? 0,
        agreementCount,
      });
    } catch (err) {
      console.error("Error setting handsShaken:", err);
      // you could alert the user here if you want
    }
  };
  

  return (
    <ScrollView style={{ backgroundColor: "#6CB4EE" }}>
      <SafeAreaView style={styles.headerRow}>
        <TouchableOpacity onPress={goback}>
        <AntDesign name="back" size={24} color="white" />
        </TouchableOpacity>

        <Image style={styles.avatar} source={{ uri: creatorPPUrl }} />
        <Text style={styles.wagerText}>${wager}</Text>
        <Image style={styles.avatar} source={{ uri: riskerPPUrl }} />
      </SafeAreaView>

      <View style={styles.handContainer}>
        {isRisker ? (
          <AnimatedHand onFinish={gotoDeal} />
        ) : (
          <Text style={styles.waitText}>
            Waiting for challenger to accept…
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: moderateScale(20, 0.1),
  },
  avatar: {
    width: moderateScale(130, 0.1),
    height: moderateScale(130, 0.1),
    borderRadius: 100,
    marginHorizontal: moderateScale(20, 0.1),
  },
  wagerText: {
    fontSize: moderateScale(18, 0.1),
    fontWeight: "bold",
    color: "green",
  },
  handContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: moderateScale(300, 0.1),
  },
  waitText: {
    color: "white",
    fontSize: moderateScale(16, 0.1),
    textAlign: "center",
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.userState.currentUser,
});

export default connect(mapStateToProps)(PrePartyScreen);
