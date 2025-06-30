import React, { Component } from "react";
import {
  TextInput,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import {
  SafeAreaView,
  withSafeAreaInsets,
} from "react-native-safe-area-context";
import { designHeightToPx } from "../utils/dimensions";

export class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      name: "",
      
    };

    this.onSignUp = this.onSignUp.bind(this);
  }

  onSignUp() {
    const { email, password, name, } = this.state;
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        firebase
          .firestore()
          .collection("users")
          // @ts-ignore
          .doc(firebase.auth().currentUser.uid)
          .set({
            name,
            email,
            
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const { email, password, name } = this.state;

    const { insets } = this.props;

    return (
      <ImageBackground
      source={require("../../assets/pit.jpeg")}
        style={{ flex: 1 }}
        resizeMode="stretch"
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <View style={styles.container}>
            <View style={styles.blank}>
              {/* <Image
                source={require("../../assets/pit.jpeg")}
                style={styles.logo}
                resizeMode="contain"
              /> */}
            </View>
            <View style={styles.form}>
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingBottom: insets.bottom,
                    padding: moderateScale(20, 0.1),
                    paddingTop: designHeightToPx(70 - insets.bottom),
                  }}
                >
                  <Text style={styles.login}>Register a new account</Text>
                  <Text style={styles.desc}>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </Text>

                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="Doe John"
                      value={name}
                      onChangeText={(name) => this.setState({ name })}
                    />
                    <Text style={styles.inputLabel}>Name</Text>
                  </View>
                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="someemail@gmail.com"
                      value={email}
                      onChangeText={(email) => this.setState({ email })}
                    />
                    <Text style={styles.inputLabel}>Email</Text>
                  </View>
                  <View style={styles.wrapper}>
                    <TextInput
                      style={[styles.input, styles.topInput]}
                      placeholder="******************"
                      secureTextEntry={true}
                      value={password}
                      onChangeText={(password) => this.setState({ password })}
                    />
                    <Text style={styles.inputLabel}>Password</Text>
                  </View>
                  

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.loginBtn}
                    onPress={() => this.onSignUp()}
                  >
                    <Text style={styles.loginBtnLabel}>Register</Text>
                  </TouchableOpacity>

                  <Text style={styles.signupDesc}>Already have an account</Text>
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
  container: {
    flex: 1,
    flexDirection: "column",
  },
  logo: { maxHeight: 90, height: designHeightToPx(90), aspectRatio: 254 / 91 },
  blank: {
    flex: 2,
    marginTop:-40,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    flex: 8,
    backgroundColor: "white",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  login: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "500",
    marginBottom: designHeightToPx(20),
  },
  desc: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: moderateScale(24, 0.1),
    paddingHorizontal: moderateScale(25, 0.1),
    marginBottom: designHeightToPx(50),
  },
  forgotBtn: {
    marginTop: designHeightToPx(15, 0.1),
    marginBottom: designHeightToPx(75),
  },
  forgotLabel: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
    color: "#2E85F7",
  },
  wrapper: {
    width: "100%",
  },
  inputLabel: {
    position: "absolute",
    top: moderateScale(-8, 0.1),
    left: moderateScale(20, 0.1),
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    color: "#2E85F7",
    paddingHorizontal: moderateScale(10, 0.1),
    backgroundColor: "white",
  },
  input: {
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: designHeightToPx(30),
    height: designHeightToPx(70),
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
  },
  topInput: {
    marginBottom: designHeightToPx(40),
  },
  loginBtn: {
    width: "100%",
    height: designHeightToPx(70, 0.1),
    backgroundColor: "#46b6fd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: designHeightToPx(70),
  },
  loginBtnLabel: {
    fontSize: moderateScale(16, 0.1),
    fontWeight: "600",
    color: "white",
  },
  signupDesc: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
    marginBottom: moderateScale(10, 0.1),
    color: "#00000040",
  },
  signupLabel: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "600",
    color: "#000000",
    marginBottom: moderateScale(10, 0.1),
  },
});

export default withSafeAreaInsets(Register);
