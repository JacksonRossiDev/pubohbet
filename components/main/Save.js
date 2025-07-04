// @ts-check
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { useDispatch } from "react-redux";
import { fetchUserPosts } from "../../redux/actions";
import { moderateScale } from "react-native-size-matters";

require("firebase/firestore");

export default function Save(props) {
  const dispatch = useDispatch();
  const [caption, setCaption] = useState("");
  const [wager, setWager] = useState("");
  const [status, setStatus] = useState("");
  const [userRisker, setUserRisker] = useState(null);

  const uploadImage = async () => {
    const uri = props.route.params?.image;
    if (uri) {
      const childPath = `post/${firebase.auth().currentUser?.uid}/${Math.random().toString(36)}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const task = firebase.storage().ref().child(childPath).put(blob);

      task.on(
        "state_changed",
        (snapshot) => console.log(`transferred: ${snapshot.bytesTransferred}`),
        (error) => console.log(error),
        () => {
          task.snapshot.ref.getDownloadURL().then((snapshot) => {
            savePostData(snapshot);
          });
        }
      );
    } else {
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

        userRisker: {
          uid:            userRisker.uid,
          name:           userRisker.name,
          email:          userRisker.email,
          ppUrl:          userRisker.ppUrl,
          creditBalance:  userRisker.creditBalance,  // optional
        },        betterAgree: true,
        wager: Number(wager),
        likesCount: 0,
        agreementCount: 0,
        creation: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        props.navigation.popToTop();
        dispatch(fetchUserPosts());
      });
  };

useEffect(() => {
  const otherUid = props.route.params?.uid;
  if (otherUid && otherUid !== firebase.auth().currentUser?.uid) {
    firebase
      .firestore()
      .collection("users")
      .doc(otherUid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data();
          data.uid = snapshot.id;       // ← stitch in the UID
          setUserRisker(data);
        }
      });
  }
}, [props.route.params.uid]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {props.route.params?.image && (
        <Image source={{ uri: props.route.params.image }} style={styles.imagePreview} />
      )}

      <Text style={styles.title}>Create your risk with @{userRisker?.name}</Text>

      <View style={styles.captionBox}>
        <TextInput
          style={styles.captionInput}
          placeholder="What's on your mind?"
          value={caption}
          multiline
          onChangeText={setCaption}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.wagerContainer}>
        <Text style={styles.wagerLabel}>Wager</Text>
        <View style={styles.wagerInputWrapper}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.wagerInput}
            placeholder="0"
            keyboardType="numeric"
            value={wager}
            onChangeText={setWager}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.postButton} onPress={uploadImage} activeOpacity={0.9}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop:100
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#eee",
  },
  captionBox: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  captionInput: {
    fontSize: 15,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
  },
  wagerContainer: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },
  wagerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  wagerInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  dollarSign: {
    fontSize: 16,
    marginRight: 6,
    color: "#444",
  },
  wagerInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  postButton: {
    width: "100%",
    backgroundColor: "#6CB4EE",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
});