// PrePartyScreen.js
// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import AnimatedHand from "./AnimatedHand";
import { moderateScale } from "react-native-size-matters";

const PrePartyScreen = ({ currentUser, route, navigation }) => {
  const {
    postId,
    wager = 0,
    creatorUid,
    creatorPPUrl,
    riskerUid,
    riskerPPUrl,
  } = route.params;

  const [self, setSelf] = useState(null);

  useEffect(() => {
    const unsub = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser?.uid)
      .onSnapshot((snap) => snap.exists && setSelf(snap.data()));
    return () => unsub();
  }, []);

  const isRisker = currentUser.uid === riskerUid;

  const gotoDeal = async () => {
    await firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId)
      .update({ handsShaken: true });
    navigation.navigate("PartyScreen", {
      postId,
      wager,
      creatorUid,
      creatorPPUrl,
      creatorBalance: self?.creditBalance ?? 0,
      riskerUid,
      riskerPPUrl,
      riskerBalance: self?.creditBalance ?? 0,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 1) Title */}
        <Text style={styles.title}>Pending Agreement</Text>

        {/* 2) Avatars side by side */}
        <View style={styles.avatarsRow}>
          <Image style={styles.avatar} source={{ uri: creatorPPUrl }} />
          <Image style={styles.avatar} source={{ uri: riskerPPUrl }} />
        </View>

        {/* 3) Wager box */}
        <View style={styles.wagerBox}>
          <Text style={styles.wagerBoxText}>${wager}</Text>
        </View>

        {/* 4) Hand animation */}
        <View style={styles.handContainer}>
          {isRisker ? (
            <AnimatedHand onFinish={gotoDeal} />
          ) : (
            <Text style={styles.waitText}>
              Waiting for challenger to accept…
            </Text>
          )}
        </View>

        {/* 5) Instruction under hands - moved up closer */}
        <Text style={styles.instruction}>Slide Your Hand to Begin!</Text>

        {/* 6) Logo under instruction */}
        <Image
          source={require('../assets/ohbet-icon.png')}
          style={styles.logo}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#85C8E5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: moderateScale(20, 0.1),
  },
  title: {
    fontSize: moderateScale(30, 0.1),
    fontWeight: "700",
    color: "white",
    marginBottom: moderateScale(20, 0.1),
  },
  avatarsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: moderateScale(20, 0.1),
  },
  avatar: {
    width: moderateScale(130, 0.1),
    height: moderateScale(130, 0.1),
    borderRadius: moderateScale(65, 0.1),
    borderWidth: moderateScale(4, 0.1),
    borderColor: 'white',
  },
  wagerBox: {
    backgroundColor: "white",
    paddingHorizontal: moderateScale(20, 0.1),
    paddingVertical: moderateScale(10, 0.1),
    borderRadius: moderateScale(8, 0.1),
    marginBottom: moderateScale(30, 0.1),
  },
  wagerBoxText: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "600",
    color: "#6CB4EE",
  },
  handContainer: {
    width: "100%",
    marginTop: moderateScale(60, 0.1),  // reduced from 140 to bring up
    alignItems: "center",
    marginBottom: moderateScale(15, 0.1),
  },
  waitText: {
    color: "white",
    fontSize: moderateScale(16, 0.1),
    textAlign: "center",
  },
  instruction: {
    color: "white",
    fontSize: moderateScale(30, 0.1),
    fontWeight: "600",
    marginTop: moderateScale(45, 0.1), // closer under hands
  },
  logo: {
    width: moderateScale(175, 0.1),
    height: moderateScale(175, 0.1),
    marginTop: moderateScale(60, 0.1),
    alignSelf: 'center',
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.userState.currentUser,
});

export default connect(mapStateToProps)(PrePartyScreen);
