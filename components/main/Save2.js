// @ts-check
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { designHeightToPx } from "../utils/dimensions";
import { moderateScale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
import { fetchUserPosts } from "../../redux/actions";

require("firebase/firestore");

export default function Save2(props) {
  const dispatch = useDispatch();
  const [caption, setCaption] = useState("");
  const [wager, setWager] = useState(0);
  const [status, setStatus] = useState("");
  const [userRisker, setUserRisker] = useState(null);

  console.log('mostimportant', props.route.params?.passedID)

  const passedID = props.route.params?.passedID;

//   const handleChange = (text) => { 
//     // Allow only numbers 
//     const numericValue = text.replace(/[^0-9]/g, ""); 
//     setWager(numericValue); 
// }; 

  const uploadImage = async () => {
    const uri = props.route.params?.image;
    if (uri) {
      const childPath = `post/${
        firebase.auth().currentUser?.uid
      }/${Math.random().toString(36)}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const task = firebase.storage().ref().child(childPath).put(blob);

      const taskProgress = (snapshot) => {
        console.log(`transferred: ${snapshot.bytesTransferred}`);
      };
      const taskCompleted = () => {
        task.snapshot.ref.getDownloadURL().then((snapshot) => {
          savePostData(snapshot);
        });
      };
      const taskError = (snapshot) => {
        console.log(snapshot);
      };
      task.on("state_changed", taskProgress, taskError, taskCompleted);
    } else {
      // create caption only post
      savePostData();
    }
  };

  const savePostData = (downloadURL = "") => {
    firebase
      .firestore()
      .collection("posts")
      .doc(firebase.auth().currentUser?.uid)
      .collection("userPosts")
      .add({
        downloadURL,
        status,
        caption,
        userRisker,
        betterAgree: true,
        wager: Number(wager),
        likesCount: 0,
        agreementCount:0,
        creation: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function () {
        props.navigation.popToTop();
        // @ts-ignore
        dispatch(fetchUserPosts());
      });
  };

  useEffect(() => {
    const uid = props.route.params?.uid;
    if (props.route.params?.uid !== firebase.auth().currentUser?.uid) {
      firebase
        .firestore()
        .collection("users")
        .doc(passedID)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUserRisker(snapshot.data());
          } else {
            console.log("does not exist3");
          }
        });
    }
  }, [props.route.params.uid]);

  console.log("OBJECT FOR USER", userRisker)
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "white",
        padding: 20,
      }}
    >
      {props.route.params?.image && (
        <Image source={{ uri: props.route.params.image }} style={{width:150, height:150, marginBottom:30}} />
      )}

      <View style={styles.wrapper}>
        <Text style={{textAlign: 'center'}}>Create your risk with @{userRisker?.name}</Text>
        </View>
      <View style={styles.wrapper}>
        <TextInput
          style={styles.input}
          placeholder="Write a Caption..."
          value={caption}
          multiline
          onChangeText={setCaption}
        />
      </View>
      {/* <View style={styles.wrapper}>
        <TextInput
          style={styles.input}
          placeholder={props.route.params?.uid}
          value={props.route.params?.uid}
          multiline
          onChangeText={setRisker}
        />
      </View> */}
      <View style={styles.wrapper}>
        <TextInput
          style={styles.input}
          onChangeText={setWager}
          value={wager}
          placeholder="Amount"
          keyboardType="numeric"
        />
      </View>
      

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.postStatusBtn}
        onPress={() => uploadImage()}
      >
        <Text style={styles.postStatusBtnTitle}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    padding: moderateScale(20, 0.1),
  },
  wrapper: {
    width: "100%",
    marginBottom: moderateScale(20, 0.1),
  },
  input: {
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 5,
    padding: designHeightToPx(20),
    minHeight: designHeightToPx(80),
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
  },
  postStatusBtn: {
    width: "100%",
    height: designHeightToPx(40),
    backgroundColor: "#6CB4EE",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: moderateScale(4, 0.1),
  },
  postStatusBtnTitle: {
    fontSize: moderateScale(12, 0.1),
    fontWeight: "500",
    color: "white",
  },
});
