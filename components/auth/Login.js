import React, { Component } from "react";
import {
  TextInput,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import {
  SafeAreaView,
  withSafeAreaInsets,
} from "react-native-safe-area-context";


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "Jacksonrossitest123@gmail.com",
      password: "Jackson11",
      name: "Dev",
    };

    this.onSignUp = this.onSignUp.bind(this);
  }

  onSignUp() {
    const { email, password } = this.state;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  sendPasswordReset() {
    const {email} = this.state;
    // [START auth_send_password_reset]
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert("Password Reset Email Sent!")
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
      });

  }

  render() {
    const { insets } = this.props;
    return (
      <ImageBackground
      backgroundColor="black"
        source={require("../../assets/pit.jpeg")}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <View style={styles.container}>
            <View style={styles.blank}></View>
            <View
              style={[
                styles.form,
                {
                  paddingTop: moderateScale(70 - insets.bottom, 0.1),
                  paddingBottom: insets.bottom,
                },
              ]}
            >
              

              <View style={styles.wrapper}>
                <TextInput
                  style={[styles.input, styles.topInput]}
                  placeholder="someemail@gmail.com"
                  value={this.state.email}
                  onChangeText={(email) => this.setState({ email })}
                />
                <Text style={styles.inputLabel}>Email</Text>
              </View>

              <View style={styles.wrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="******************"
                  secureTextEntry={true}
                  value={this.state.password}
                  onChangeText={(password) => this.setState({ password })}
                />
                <Text style={styles.inputLabel}>Password</Text>
              </View>
              <View style={styles.wrapper}>
                <TouchableOpacity style={styles.forgotBtn} onPress={() => this.sendPasswordReset()}>
                  <Text style={styles.forgotLabel}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.loginBtn}
                onPress={() => this.onSignUp()}
              >
                <Text style={styles.loginBtnLabel}>Login</Text>
              </TouchableOpacity>

              <Text style={styles.signupDesc}>Don't have account</Text>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Register")}
              >
                <Text style={styles.signupLabel}>SIGN UP</Text>
              </TouchableOpacity>
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
  blank: {
    flex: 2,
    backgroundColor: "transparent",
  },
  form: {
    flex: 8,
    backgroundColor: "white",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: moderateScale(20, 0.1),
  },
  login: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "500",
    marginBottom: moderateScale(20, 0.1),
  },
  desc: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: moderateScale(24, 0.1),
    paddingHorizontal: moderateScale(25, 0.1),
    marginBottom: moderateScale(50, 0.1),
  },
  forgotBtn: {
    marginVertical: moderateScale(15, 0.1),
    marginBottom: moderateScale(75, 0.1),
  },
  forgotLabel: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
    color: "#46b6fd",
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
    color: "#46b6fd",
    paddingHorizontal: moderateScale(10, 0.1),
    backgroundColor: "white",
  },
  input: {
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: moderateScale(30, 0.1),
    height: moderateScale(70, 0.1),
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
  },
  topInput: {
    marginBottom: moderateScale(40, 0.1),
  },
  loginBtn: {
    width: "100%",
    height: moderateScale(70, 0.1),
    backgroundColor: "#46b6fd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: moderateScale(75, 0.1),
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
    color: "#46b6fd",
  },
});

export default withSafeAreaInsets(Login);


// <SafeAreaView>
      //   <View>
      //     <TextInput
      //       placeholder="name"
      //       onChangeText={(name) => this.setState({ name })}
      //     />
      //     <TextInput
      //       placeholder="email"
      //       onChangeText={(email) => this.setState({ email })}
      //     />
      //     <TextInput
      //       placeholder="password"
      //       secureTextEntry={true}
      //       onChangeText={(password) => this.setState({ password })}
      //     />
      //     <TextInput
      //       placeholder="Occupation"
      //       onChangeText={(occupation) => this.setState({ occupation })}
      //     />

      //     <Button onPress={() => this.onSignUp()} title="Sign Up" />
      //   </View>
      // </SafeAreaView>