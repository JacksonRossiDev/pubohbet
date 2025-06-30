// PartyScreen.js
// @ts-nocheck
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { moderateScale } from "react-native-size-matters";
import { TouchableOpacity } from 'react-native-gesture-handler';

const PartyScreen = ({ currentUser, route, navigation }) => {
  const {
    postId,
    wager,
    creatorUid,
    creatorPPUrl,
    riskerUid,
    riskerPPUrl,
  } = route.params;

  // Local state for what each user slid, plus completion flag
  const [creatorChoice, setCreatorChoice] = useState(null);
  const [riskerChoice, setRiskerChoice]   = useState(null);
  const [betComplete, setBetComplete]     = useState(false);

  // 1) Subscribe in real time to the post doc so we know:
  //    • if it’s already completed
  //    • if either slider field already exists (e.g. returning user)
  useEffect(() => {
    const docRef = firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId);

    const unsub = docRef.onSnapshot((snap) => {
      if (!snap.exists) return;
      const data = snap.data();
      if (data.betComplete) {
        setBetComplete(true);
      }
      if (data.sliderCreatorChoice != null) {
        setCreatorChoice(data.sliderCreatorChoice);
      }
      if (data.sliderRiskerChoice != null) {
        setRiskerChoice(data.sliderRiskerChoice);
      }
    });
    return () => unsub();
  }, [creatorUid, postId]);

  // 2) Who is who?
  const amCreator = firebase.auth().currentUser?.uid === creatorUid;
  const amRisker  = firebase.auth().currentUser?.uid === riskerUid;
  const goback = async () => {
    console.log("hi");

    navigation.navigate("Home")

  }
  // 3) Helpers to write each slider field
  const writeChoice = (field, choice) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId)
      .set({ [field]: choice }, { merge: true })
      .catch(console.error);
  };

  const onCreatorSlide = (val) => {
    const c = val < 0.5 ? 0 : 1;
    setCreatorChoice(c);
    writeChoice("sliderCreatorChoice", c);
  };
  const onRiskerSlide = (val) => {
    const c = val < 0.5 ? 0 : 1;
    setRiskerChoice(c);
    writeChoice("sliderRiskerChoice", c);
  };

  // 4) Once both exist, match, and not already completed → payout + mark done
  useEffect(() => {
    if (
      betComplete ||
      creatorChoice == null ||
      riskerChoice == null ||
      creatorChoice !== riskerChoice
    ) {
      return;
    }
  
    const creatorWins = creatorChoice === 0;
    const winnerUid   = creatorWins ? creatorUid : riskerUid;
    const loserUid    = creatorWins ? riskerUid  : creatorUid;
  
    // Firestore references
    const winnerRef = firebase.firestore().collection("users").doc(winnerUid);
    const loserRef  = firebase.firestore().collection("users").doc(loserUid);
    const postDocRef = firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId);
  
    firebase
      .firestore()
      .runTransaction(async (tx) => {
        const [wSnap, lSnap] = await Promise.all([
          tx.get(winnerRef),
          tx.get(loserRef),
        ]);
        const wOld = wSnap.data()?.creditBalance ?? 0;
        const lOld = lSnap.data()?.creditBalance ?? 0;
  
        // now this is numeric addition
        tx.set(
          winnerRef,
          { creditBalance: wOld + wager },
          { merge: true }
        );
        tx.set(
          loserRef,
          { creditBalance: lOld - wager },
          { merge: true }
        );
  
        // mark agreements & complete
        const agg = postDocRef.collection("agreements");
        tx.set(agg.doc(winnerUid), {});
        tx.set(agg.doc(loserUid), {});
        tx.set(postDocRef, { betComplete: true }, { merge: true });
      })
      .then(() => navigation.navigate("Home"))
      .catch(console.error);
  }, [
    creatorChoice,
    riskerChoice,
    betComplete,
    creatorUid,
    riskerUid,
    postId,
    wager,    // now a number
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={goback}>
        <AntDesign name="back" size={24} color="white" />
        </TouchableOpacity>
      {/* avatars + wager */}
      <View style={styles.row}>
        <Image style={styles.avatar} source={{ uri: creatorPPUrl }} />
        <Text style={styles.wager}>${wager}</Text>
        <Image style={styles.avatar} source={{ uri: riskerPPUrl }} />
      </View>

      {/* CREATOR slider: only interactive if you’re the creator & not done */}
      <View
        pointerEvents={amCreator && !betComplete ? "auto" : "none"}
        style={[styles.sliderGroup, !amCreator || betComplete ? styles.disabled : {}]}
      >
        <Text style={styles.label}>Creator’s pick</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={creatorChoice != null ? creatorChoice : 0.5}
          onValueChange={onCreatorSlide}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#444"
          thumbTintColor="#fff"
        />
        <View style={styles.sideLabels}>
          <Text style={styles.sideLabel}>Creator wins</Text>
          <Text style={styles.sideLabel}>Challenger wins</Text>
        </View>
      </View>

      {/* RISKER slider: only interactive if you’re the risker & not done */}
      <View
        pointerEvents={amRisker && !betComplete ? "auto" : "none"}
        style={[styles.sliderGroup, !amRisker || betComplete ? styles.disabled : {}]}
      >
        <Text style={styles.label}>Challenger’s pick</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={riskerChoice != null ? riskerChoice : 0.5}
          onValueChange={onRiskerSlide}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#444"
          thumbTintColor="#fff"
        />
        <View style={styles.sideLabels}>
          <Text style={styles.sideLabel}>Creator wins</Text>
          <Text style={styles.sideLabel}>Challenger wins</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Slide to who you think won—once both match, the bet pays out.
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
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: moderateScale(80, 0.1),
    height: moderateScale(80, 0.1),
    borderRadius: moderateScale(40, 0.1),
    marginHorizontal: 20,
  },
  wager: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "bold",
    color: "green",
  },
  sliderGroup: {
    marginBottom: 30,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sideLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  sideLabel: {
    color: "white",
    fontSize: moderateScale(12, 0.1),
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
