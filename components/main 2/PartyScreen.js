// PartyScreen.js
// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { moderateScale } from "react-native-size-matters";
import Ionicons from "react-native-vector-icons/Ionicons";

const PartyScreen = ({ currentUser, route, navigation }) => {
  const {
    postId,
    wager,
    creatorUid,
    creatorPPUrl,
    riskerUid,
    riskerPPUrl,
  } = route.params;

  const authUid = firebase.auth().currentUser?.uid;
  const amCreator = authUid === creatorUid;
  const amRisker  = authUid === riskerUid;

  const [creatorAgreed, setCreatorAgreed] = useState(false);
  const [riskerAgreed,  setRiskerAgreed]  = useState(false);

  // listen for agreements
  useEffect(() => {
    const base = firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId)
      .collection("agreements");

    const unsubCreator = base
      .doc(creatorUid)
      .onSnapshot((snap) => setCreatorAgreed(snap.exists));

    const unsubRisker = base
      .doc(riskerUid)
      .onSnapshot((snap) => setRiskerAgreed(snap.exists));

    return () => {
      unsubCreator();
      unsubRisker();
    };
  }, [creatorUid, riskerUid, postId]);

  // once both have agreed, do payout & flag complete
  useEffect(() => {
    if (!creatorAgreed || !riskerAgreed) return;

    const postRef = firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId);

    const winnerUid = creatorAgreed && riskerAgreed
      ? // determine who wins from your own logic; here we assume creator choice==0 => creator wins
        // if you need dynamic winner logic, replace this line with your own:
        creatorUid
      : null;

    if (!winnerUid) return;

    const loserUid = winnerUid === creatorUid ? riskerUid : creatorUid;

    firebase
      .firestore()
      .runTransaction(async (tx) => {
        const [wSnap, lSnap] = await Promise.all([
          tx.get(firebase.firestore().collection("users").doc(winnerUid)),
          tx.get(firebase.firestore().collection("users").doc(loserUid)),
        ]);
        const wOld = wSnap.data()?.creditBalance ?? 0;
        const lOld = lSnap.data()?.creditBalance ?? 0;

        tx.set(
          firebase.firestore().collection("users").doc(winnerUid),
          { creditBalance: wOld + wager },
          { merge: true }
        );
        tx.set(
          firebase.firestore().collection("users").doc(loserUid),
          { creditBalance: lOld - wager },
          { merge: true }
        );

        // mark the post as complete
        tx.set(postRef, { betComplete: true }, { merge: true });
      })
      .then(() => navigation.navigate("Home"))
      .catch(console.error);
  }, [creatorAgreed, riskerAgreed, creatorUid, riskerUid, postId, wager]);

  // record agreement for this user
  const onTap = () => {
    const side = amCreator ? creatorUid : riskerUid;
    firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId)
      .collection("agreements")
      .doc(side)
      .set({})
      .catch(console.error);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.avatarsRow}>
        <Image style={styles.avatar} source={{ uri: creatorPPUrl }} />
        <Text style={styles.wagerText}>${wager}</Text>
        <Image style={styles.avatar} source={{ uri: riskerPPUrl }} />
      </View>

      <View style={styles.thumbsRow}>
        {/* Creator’s thumb */}
        <View style={styles.thumbWrapper}>
          <Image style={styles.smallAvatar} source={{ uri: creatorPPUrl }} />
          <TouchableOpacity
            disabled={!amCreator || creatorAgreed}
            onPress={onTap}
          >
            <Ionicons
              name={creatorAgreed ? "thumbs-up" : "thumbs-up-outline"}
              size={64}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Risker’s thumb */}
        <View style={styles.thumbWrapper}>
          <Image style={styles.smallAvatar} source={{ uri: riskerPPUrl }} />
          <TouchableOpacity
            disabled={!amRisker || riskerAgreed}
            onPress={onTap}
          >
            <Ionicons
              name={riskerAgreed ? "thumbs-up" : "thumbs-up-outline"}
              size={64}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.instruction}>
        Tap your thumb when you agree the bet completed. Both must tap to settle.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#36d8ff",
    padding: 20,
  },
  avatarsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: moderateScale(100, 0.1),
    height: moderateScale(100, 0.1),
    borderRadius: moderateScale(50, 0.1),
    marginHorizontal: 20,
  },
  wagerText: {
    fontSize: moderateScale(24, 0.1),
    fontWeight: "bold",
    color: "white",
  },
  thumbsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 40,
  },
  thumbWrapper: {
    alignItems: "center",
  },
  smallAvatar: {
    width: moderateScale(60, 0.1),
    height: moderateScale(60, 0.1),
    borderRadius: moderateScale(30, 0.1),
    marginBottom: 12,
  },
  instruction: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontSize: moderateScale(14, 0.1),
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.userState.currentUser,
});

export default connect(mapStateToProps)(PartyScreen);
