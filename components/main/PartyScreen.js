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
import Slider from "@react-native-community/slider";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { moderateScale } from "react-native-size-matters";

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
  const amRisker = authUid === riskerUid;

  const [creatorName, setCreatorName] = useState("");
  const [riskerName, setRiskerName] = useState("");
  const [creatorChoice, setCreatorChoice] = useState(null);
  const [riskerChoice, setRiskerChoice] = useState(null);
  const [betComplete, setBetComplete] = useState(false);
  const [creatorSliderValue, setCreatorSliderValue] = useState(0.5);
  const [riskerSliderValue, setRiskerSliderValue] = useState(0.5);

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .doc(creatorUid)
      .get()
      .then((snap) => snap.exists && setCreatorName(snap.data().name))
      .catch(console.error);
    firebase
      .firestore()
      .collection("users")
      .doc(riskerUid)
      .get()
      .then((snap) => snap.exists && setRiskerName(snap.data().name))
      .catch(console.error);
  }, [creatorUid, riskerUid]);

  useEffect(() => {
    const ref = firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId);
    return ref.onSnapshot((snap) => {
      if (!snap.exists) return;
      const d = snap.data();
      if (d.betComplete) setBetComplete(true);
      if (d.sliderCreatorChoice != null) setCreatorChoice(d.sliderCreatorChoice);
      if (d.sliderRiskerChoice != null) setRiskerChoice(d.sliderRiskerChoice);
    });
  }, [creatorUid, postId]);

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
const denyBet = async () => {
  try {
    await firebase
      .firestore()
      .collection("posts")
      .doc(creatorUid)
      .collection("userPosts")
      .doc(postId)
      .set({ deniedBet: true }, { merge: true });

    navigation.navigate("Home");
  } catch (error) {
    console.error("Error denying bet:", error);
  }
};
  const onCreatorSlideComplete = (v) => {
    if (v <= 0.25 || v >= 0.75) {
      const c = v < 0.5 ? 0 : 1;
      setCreatorChoice(c);
      writeChoice("sliderCreatorChoice", c);
    } else {
      setCreatorSliderValue(0.5);
    }
  };

  const onRiskerSlideComplete = (v) => {
    if (v <= 0.25 || v >= 0.75) {
      const c = v < 0.5 ? 0 : 1;
      setRiskerChoice(c);
      writeChoice("sliderRiskerChoice", c);
    } else {
      setRiskerSliderValue(0.5);
    }
  };

  useEffect(() => {
    if (
      betComplete ||
      creatorChoice == null ||
      riskerChoice == null ||
      creatorChoice !== riskerChoice
    )
      return;

    const creatorWins = creatorChoice === 0;
    const winnerUid = creatorWins ? creatorUid : riskerUid;
    const loserUid = creatorWins ? riskerUid : creatorUid;
    const winnerName = creatorWins ? creatorName : riskerName;

    const winnerRef = firebase.firestore().collection("users").doc(winnerUid);
    const loserRef = firebase.firestore().collection("users").doc(loserUid);
    const postRef = firebase
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

        tx.set(winnerRef, { creditBalance: wOld + wager }, { merge: true });
        tx.set(loserRef, { creditBalance: lOld - wager }, { merge: true });

        const agg = postRef.collection("agreements");
        tx.set(agg.doc(winnerUid), {});
        tx.set(agg.doc(loserUid), {});

        tx.set(postRef, { betComplete: true, Winner: winnerName }, { merge: true });
      })
      .then(() => {
        navigation.navigate("CConfirmedScreen", { creatorUid, postId });
      })
      .catch(console.error);
  }, [
    creatorChoice,
    riskerChoice,
    betComplete,
    creatorUid,
    riskerUid,
    postId,
    wager,
    navigation,
    creatorName,
    riskerName,
  ]);



  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.headerTitle}>Who Won The Agreement?</Text>

      <View style={styles.row}>
        <Image style={styles.avatar} source={{ uri: creatorPPUrl }} />
        <View style={styles.wagerBox}>
          <Text style={styles.wagerText}>${wager}</Text>
        </View>
        <Image style={styles.avatar} source={{ uri: riskerPPUrl }} />
      </View>

      <View
        pointerEvents={amCreator && !betComplete ? "auto" : "none"}
        style={[styles.sliderGroup, (!amCreator || betComplete) && styles.disabled]}
      >
        <Text style={styles.sliderLabel}>{creatorName}’s pick</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={creatorSliderValue}
          onValueChange={setCreatorSliderValue}
          onSlidingComplete={onCreatorSlideComplete}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#444"
          thumbTintColor="#fff"
        />
        <View style={styles.sideLabels}>
          <Text style={styles.sideLabel}>{creatorName} wins</Text>
          <Text style={styles.sideLabel}>{riskerName} wins</Text>
        </View>
      </View>

      <View
        pointerEvents={amRisker && !betComplete ? "auto" : "none"}
        style={[styles.sliderGroup, (!amRisker || betComplete) && styles.disabled]}
      >
        <Text style={styles.sliderLabel}>{riskerName}’s pick</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={riskerSliderValue}
          onValueChange={setRiskerSliderValue}
          onSlidingComplete={onRiskerSlideComplete}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#444"
          thumbTintColor="#fff"
        />
        <View style={styles.sideLabels}>
          <Text style={styles.sideLabel}>{creatorName} wins</Text>
          <Text style={styles.sideLabel}>{riskerName} wins</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Slide to who you think won—once both match, the agreement pays out.
      </Text>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>



      <Image
        source={require("../assets/ohbet-icon.png")}
        style={styles.logo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#85C8E5",
    padding: moderateScale(20, 0.1),
  },
  headerTitle: {
    fontSize: moderateScale(24, 0.1),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: moderateScale(20, 0.1),
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(30, 0.1),
  },
  avatar: {
    width: moderateScale(80, 0.1),
    height: moderateScale(80, 0.1),
    borderRadius: moderateScale(40, 0.1),
  },
  wagerBox: {
    backgroundColor: "white",
    paddingHorizontal: moderateScale(16, 0.1),
    paddingVertical: moderateScale(8, 0.1),
    marginHorizontal: moderateScale(12, 0.1),
    borderRadius: moderateScale(8, 0.1),
  },
  wagerText: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "bold",
    color: "green",
  },
  sliderGroup: {
    marginBottom: moderateScale(30, 0.1),
  },
  disabled: {
    opacity: 0.5,
  },
  sliderLabel: {
    color: "white",
    fontSize: moderateScale(16, 0.1),
    textAlign: "center",
    marginBottom: moderateScale(8, 0.1),
    fontWeight: "600",
  },
  slider: {
    width: "90%",
    alignSelf: "center",
    height: 40,
  },
  sideLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: moderateScale(6, 0.1),
  },
  sideLabel: {
    color: "white",
    fontSize: moderateScale(12, 0.1),
    paddingHorizontal: 10,
  },
  instruction: {
    textAlign: "center",
    color: "white",
    fontSize: moderateScale(24, 0.1),
    marginTop: moderateScale(10, 0.1),
  },
  homeBtn: {
    backgroundColor: "white",
    paddingVertical: moderateScale(12, 0.1),
    paddingHorizontal: moderateScale(20, 0.1),
    borderRadius: moderateScale(8, 0.1),
    alignSelf: "center",
    marginTop: moderateScale(20, 0.1),
  },
  homeBtnText: {
    color: "#36d8ff",
    fontSize: moderateScale(16, 0.1),
    fontWeight: "600",
  },
  logo: {
    width: moderateScale(175, 0.1),
    height: moderateScale(175, 0.1),
    marginTop: moderateScale(60, 0.1),
    alignSelf: "center",
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.userState.currentUser,
});

export default connect(mapStateToProps)(PartyScreen);