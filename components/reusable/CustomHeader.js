// CustomHeader.js
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import firebase from "firebase/compat/app";
import "firebase/firestore";

const CustomHeader = (props) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const uid = firebase.auth().currentUser?.uid;
    if (!uid) return;

    const unsub = firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .onSnapshot(
        (snap) => {
          if (snap.exists) {
            setUser(snap.data());
          }
        },
        (err) => {
          console.warn("CustomHeader listener error:", err);
        }
      );

    return () => unsub();
  }, []);

  return (
    <View style={styles.navBar}>
      {/* Search Icon on the left */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Search")}
        style={styles.iconLeft}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>

      {/* Logo in the center */}
      <Image
        style={{ width: 100, height: 30 }}
        source={require("../../assets/ohbetpls.png")}
      />

      {/* Balance Button on the right */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.balanceButton}
        onPress={console.log("paywall")}
      >
        <Text style={styles.balanceText}>
          {typeof user?.creditBalance === "number"
            ? user.creditBalance
            : "--"}
        </Text>
        <Ionicons name="radio-button-on-sharp" color={"white"} size={25} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(20, 0.1),
    height: moderateScale(48, 0.1),
    backgroundColor: "#6CB4EE",
  },
  iconLeft: {
    position: "absolute",
    left: 5,
    padding: 5,
  },
  balanceButton: {
    position: "absolute",
    right: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    color: "white",
    fontSize: moderateScale(16, 0.1),
    marginRight: moderateScale(4, 0.1),
  },
});

export default CustomHeader;