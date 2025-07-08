// Paywall.js
import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export default class Paywall extends Component {
  state = { amount: "" };

  handleDeposit = async () => {
    const deposit = parseFloat(this.state.amount);
    if (isNaN(deposit) || deposit <= 0) {
      return Alert.alert("Invalid amount", "Enter a positive number.");
    }

    const uid = firebase.auth().currentUser.uid;
    const db = firebase.firestore();
    const userRef = db.collection("users").doc(uid);

    try {
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw "User not found";

        // 1. add to depositor
        tx.update(userRef, {
          creditBalance: firebase.firestore.FieldValue.increment(deposit),
        });

        // 2. credit referrer 10%
        const referredBy = userSnap.data().referredBy;
        if (referredBy) {
          const bonus = deposit * 0.1;
          const referrerRef = db.collection("users").doc(referredBy);
          tx.update(referrerRef, {
            creditBalance: firebase.firestore.FieldValue.increment(bonus),
          });
        }
      });

      Alert.alert("Success", `You deposited $${deposit.toFixed(2)}.`);
      this.setState({ amount: "" });
    } catch (error) {
      console.error("Deposit error:", error);
      Alert.alert("Error", "Could not complete deposit.");
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Add Funds</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter amount"
          value={this.state.amount}
          onChangeText={(amount) => this.setState({ amount })}
        />
        <TouchableOpacity style={styles.button} onPress={this.handleDeposit}>
          <Text style={styles.buttonText}>Deposit</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20, 0.1),
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: moderateScale(22, 0.1),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: moderateScale(30, 0.1),
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    height: moderateScale(50, 0.1),
    paddingHorizontal: moderateScale(15, 0.1),
    fontSize: moderateScale(16, 0.1),
    marginBottom: moderateScale(20, 0.1),
  },
  button: {
    height: moderateScale(50, 0.1),
    borderRadius: 8,
    backgroundColor: "#46b6fd",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: moderateScale(16, 0.1),
    color: "#fff",
    fontWeight: "600",
  },
});