// CConfirmedScreen.js
// @ts-nocheck
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { moderateScale } from "react-native-size-matters";
import * as ImagePicker from "expo-image-picker";

const CConfirmedScreen = ({ route, navigation }) => {
  const { creatorUid, postId } = route.params;
  const [uploading, setUploading] = useState(false);

  // 1) Animated pulse for the text
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  // 2) Pick image
  const pickImage = useCallback(async () => {
    // 1) Ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos.");
      return;
    }
  
    // 2) Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
  
    // 3) If user canceled
    if (result.canceled) return;
  
    // 4) Grab the URI from the new assets array
    const asset = result.assets && result.assets[0];
    if (!asset?.uri) {
      Alert.alert("Error", "Could not read that image. Please try again.");
      return;
    }
  
    uploadImageAsync(asset.uri);
  }, []);

  // 3) Upload blob to Firebase Storage and save URL to Firestore
  const uploadImageAsync = async (uri) => {
    setUploading(true);
    try {
      // make sure uri is non‐empty
      if (typeof uri !== "string" || uri.trim() === "") {
        throw new Error("Invalid image URI");
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new TypeError("Network request failed"));
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const storageRef = firebase
        .storage()
        .ref()
        .child(`posts/${creatorUid}/userPosts/${postId}/media.jpg`);
      const snap = await storageRef.put(blob);
      blob.close();

      const downloadURL = await snap.ref.getDownloadURL();

      if (!downloadURL) {
        throw new Error("Failed to get download URL");
      }

      await firebase
        .firestore()
        .collection("posts")
        .doc(creatorUid)
        .collection("userPosts")
        .doc(postId)
        .set({ downloadURL }, { merge: true });

      Alert.alert("Success", "Media added to your post!");
    } catch (err) {
      console.error(err);
      Alert.alert("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.title,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        Bet Complete!
      </Animated.Text>

      {uploading ? (
        <ActivityIndicator size="large" color="#fff" style={{ margin: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Add Media</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.homeButton]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#36d8ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: moderateScale(28, 0.1),
    fontWeight: "bold",
    color: "white",
    marginBottom: moderateScale(30, 0.1),
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: moderateScale(12, 0.1),
    paddingHorizontal: moderateScale(24, 0.1),
    borderRadius: moderateScale(6, 0.1),
    marginTop: moderateScale(12, 0.1),
  },
  homeButton: {
    backgroundColor: "#6CB4EE",
  },
  buttonText: {
    color: "#333",
    fontSize: moderateScale(16, 0.1),
    fontWeight: "600",
  },
});

export default connect()(CConfirmedScreen);