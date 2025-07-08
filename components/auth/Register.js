// Register.js
import React, { Component } from "react";
import {
  TextInput,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { designHeightToPx } from "../utils/dimensions";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
      referralCode: "",    // ← add this
    };
  }

onSignUp = async () => {
  const { name, email, password, referralCode } = this.state;
  const db = firebase.firestore();

  try {
    // 1️⃣ Create the Auth user
    const result = await firebase
      .auth()
      .createUserWithEmailAndPassword(email.trim(), password);
    const uid = result.user.uid;
    console.log("✅ Created auth user:", uid);

    // 2️⃣ Resolve the referral code, if provided
    let referredBy = null;
    const code = referralCode.trim();
    if (code) {
      const codeDoc = await db.collection("codes").doc(code).get();
      if (codeDoc.exists) {
        referredBy = codeDoc.data().owner;
        console.log(`🏷️  Referral code "${code}" → UID:`, referredBy);
      } else {
        Alert.alert("Invalid Code", "That referral code doesn’t exist.");
        return; // abort on bad code
      }
    }

    // 3️⃣ Write the user profile document
    await db.collection("users").doc(uid).set({
      name: name.trim(),
      email: email.trim(),
      creditBalance: 500,
      referredBy,
    });
    console.log("📄 Wrote user doc at users/" + uid);

    // 4️⃣ Navigate to the Home feed
  } catch (err) {
    console.error("🚨 Signup error:", err);
    Alert.alert("Signup failed", err.message);
  }
};

  render() {
    const { insets } = this.props;
    const { name, email, password, referralCode } = this.state;

    return (
      <ImageBackground
        source={require("../../assets/pit.jpeg")}
        style={{ flex: 1 }}
        resizeMode="stretch"
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <View style={styles.container}>
            <View style={styles.blank} />
            <View style={styles.form}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    padding: moderateScale(20, 0.1),
                    paddingTop: designHeightToPx(70 - insets.bottom),
                  }}
                >
                  <Text style={styles.login}>Register a new account</Text>
                  <Text style={styles.desc}>
                    Enter your info and, if you have one, a referral code.
                  </Text>

                  {/* Name */}
                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="Doe John"
                      value={name}
                      onChangeText={(name) => this.setState({ name })}
                    />
                    <Text style={styles.inputLabel}>Name</Text>
                  </View>

                  {/* Email */}
                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(email) => this.setState({ email })}
                    />
                    <Text style={styles.inputLabel}>Email</Text>
                  </View>

                  {/* Password */}
                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="••••••••"
                      secureTextEntry
                      value={password}
                      onChangeText={(password) =>
                        this.setState({ password })
                      }
                    />
                    <Text style={styles.inputLabel}>Password</Text>
                  </View>

                  {/* Referral Code */}
                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="Jacksonrisker11"
                      autoCapitalize="none"
                      value={referralCode}
                      onChangeText={(referralCode) =>
                        this.setState({ referralCode })
                      }
                    />
                    <Text style={styles.inputLabel}>Referral Code</Text>
                  </View>

                  {/* Register Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.loginBtn}
                    onPress={this.onSignUp}
                  >
                    <Text style={styles.loginBtnLabel}>Register</Text>
                  </TouchableOpacity>

                  {/* Already have an account */}
                  <Text style={styles.signupDesc}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate("Login")}
                  >
                    <Text style={styles.signupLabel}>SIGN IN</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blank: { flex: 2, marginTop: -40, backgroundColor: "transparent" },
  form: {
    flex: 8,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  login: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "500",
    marginBottom: moderateScale(20, 0.1),
  },
  desc: {
    fontSize: moderateScale(14, 0.1),
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: moderateScale(30, 0.1),
  },
  wrapper: {
    width: "100%",
    marginBottom: moderateScale(15, 0.1),
  },
  input: {
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: moderateScale(20, 0.1),
    height: moderateScale(50, 0.1),
    fontSize: moderateScale(14, 0.1),
  },
  topInput: { marginBottom: moderateScale(10, 0.1) },
  inputLabel: {
    position: "absolute",
    top: moderateScale(-8, 0.1),
    left: moderateScale(20, 0.1),
    backgroundColor: "white",
    paddingHorizontal: moderateScale(5, 0.1),
    color: "#2E85F7",
    fontSize: moderateScale(12, 0.1),
  },
  loginBtn: {
    width: "100%",
    height: moderateScale(50, 0.1),
    backgroundColor: "#46b6fd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: moderateScale(20, 0.1),
  },
  loginBtnLabel: {
    fontSize: moderateScale(16, 0.1),
    color: "white",
    fontWeight: "600",
  },
  signupDesc: {
    fontSize: moderateScale(14, 0.1),
    color: "#00000040",
  },
  signupLabel: {
    fontSize: moderateScale(14, 0.1),
    color: "#000",
    fontWeight: "600",
    marginTop: moderateScale(5, 0.1),
  },
});

export default withSafeAreaInsets(Register);