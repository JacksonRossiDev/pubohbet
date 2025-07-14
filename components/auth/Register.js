// Register.js
// @ts-nocheck
import React, { Component } from "react";
import {
  TextInput,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { designHeightToPx } from "../utils/dimensions";
import * as ImagePicker from "expo-image-picker";
import { connect } from "react-redux";
import { fetchUser } from "../../redux/actions";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
      referralCode: "",
      photoUri: null,
    };
  }

  // ask permission & pick from the library
  pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets && result.assets[0];
    if (asset?.uri) {
      this.setState({ photoUri: asset.uri });
    }
  };

  onSignUp = async () => {
    const { name, email, password, referralCode, photoUri } = this.state;
    const db = firebase.firestore();

    if (!photoUri) {
      return Alert.alert(
        "Profile Photo Required",
        "Please select a profile photo before registering."
      );
    }

    try {
      // 1) Auth
      const result = await firebase
        .auth()
        .createUserWithEmailAndPassword(email.trim(), password);
      const uid = result.user.uid;

      // 2) Referral
      let referredBy = null;
      const code = referralCode.trim();
      if (code) {
        const codeDoc = await db.collection("codes").doc(code).get();
        if (codeDoc.exists) {
          referredBy = codeDoc.data().owner;
        } else {
          return Alert.alert("Invalid Code", "That referral code doesn’t exist.");
        }
      }

      // 3) Upload photo
      const resp = await fetch(photoUri);
      const blob = await resp.blob();
      const storageRef = firebase.storage().ref().child(`profile/${uid}`);
      await storageRef.put(blob);
      const ppUrl = await storageRef.getDownloadURL();

      // 4) Write user doc
      await db.collection("users").doc(uid).set({
        name:          name.trim(),
        email:         email.trim(),
        creditBalance: 500,
        referredBy,
        ppUrl,
      });

      // 5) Refresh Redux user
      await this.props.fetchUser();

      // Auth listener in App.js will switch to Home
    } catch (err) {
      console.error("🚨 Signup error:", err);
      Alert.alert("Signup failed", err.message);
    }
  };

  render() {
    const { insets } = this.props;
    const { name, email, password, referralCode, photoUri } = this.state;

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

                  {/* Profile Photo Picker */}
                  <View style={styles.wrapper}>
                    <TouchableOpacity
                      style={styles.photoBtn}
                      onPress={this.pickImage}
                    >
                      <Text style={styles.photoBtnText}>
                        {photoUri ? "Change Profile Photo" : "Select Profile Photo"}
                      </Text>
                    </TouchableOpacity>
                    {photoUri && (
                      <Image
                        source={{ uri: photoUri }}
                        style={styles.photoPreview}
                      />
                    )}
                  </View>

                  {/* Register Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.loginBtn,
                      { opacity: photoUri ? 1 : 0.5 }
                    ]}
                    onPress={this.onSignUp}
                    disabled={!photoUri}
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
  photoBtn: {
    width: "100%",
    backgroundColor: "#46b6fd",
    paddingVertical: moderateScale(12, 0.1),
    borderRadius: 10,
    alignItems: "center",
    marginBottom: moderateScale(12, 0.1),
  },
  photoBtnText: { color: "white", fontWeight: "600" },
  photoPreview: {
    width: moderateScale(80, 0.1),
    height: moderateScale(80, 0.1),
    borderRadius: moderateScale(40, 0.1),
    marginTop: moderateScale(8, 0.1),
    alignSelf: "center",
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
  signupDesc: { fontSize: moderateScale(14, 0.1), color: "#00000040" },
  signupLabel: {
    fontSize: moderateScale(14, 0.1),
    color: "#000",
    fontWeight: "600",
    marginTop: moderateScale(5, 0.1),
  },
});

export default connect(
  null,
  { fetchUser }
)(withSafeAreaInsets(Register));