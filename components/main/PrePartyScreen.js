// PrePartyScreen.js
// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
    Modal,
  TouchableOpacity,
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
  const [modalVisible, setModalVisible] = useState(false);

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
        // if their balance is too low, show modal instead of proceeding
    if ((self?.creditBalance ?? 0) < wager) {
      setModalVisible(true);
      return;
    }
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

  return (
    <SafeAreaView style={styles.safe}>
            {/* Balance Too Low Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Insufficient Balance</Text>
            <Text style={styles.modalMessage}>
              You don’t have enough credits to accept this bet.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Withdraw");
              }}
            >
              <Text style={styles.modalButtonText}>Buy More Credits</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
<TouchableOpacity
  style={{
    backgroundColor: "#ff4d4d",
    paddingVertical: moderateScale(12, 0.1),
    paddingHorizontal: moderateScale(20, 0.1),
    borderRadius: moderateScale(8, 0.1),
    alignSelf: "center",
    marginTop: moderateScale(20, 0.1),
  }}
  onPress={denyBet}
>
  <Text
    style={{
      color: "white",
      fontSize: moderateScale(16, 0.1),
      fontWeight: "600",
    }}
  >
    Deny
  </Text>
</TouchableOpacity>
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
    marginTop: moderateScale(35, 0.1),
    alignSelf: 'center',
  },
    // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: moderateScale(8, 0.1),
    padding: moderateScale(20, 0.1),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: '700',
    marginBottom: moderateScale(10, 0.1),
  },
  modalMessage: {
    fontSize: moderateScale(14, 0.1),
    textAlign: 'center',
    marginBottom: moderateScale(20, 0.1),
  },
  modalButton: {
    backgroundColor: '#6CB4EE',
    paddingVertical: moderateScale(10, 0.1),
    paddingHorizontal: moderateScale(20, 0.1),
    borderRadius: moderateScale(4, 0.1),
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: moderateScale(14, 0.1),
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.userState.currentUser,
});

export default connect(mapStateToProps)(PrePartyScreen);
