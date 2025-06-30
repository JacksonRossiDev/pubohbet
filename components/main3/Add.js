// @ts-check
import React, { useState, useEffect } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,

} from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { moderateScale } from "react-native-size-matters";
import Ionicons from "react-native-vector-icons/Ionicons";


// https://docs.expo.dev/versions/latest/sdk/camera/#takepictureasync
// https://docs.expo.dev/versions/latest/sdk/imagepicker/

export default function Add(props) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(String);
  const [type, setType] = useState(CameraType.back);
  console.log("IMPORTANT", props.route.params?.uid)


  const passedID = props.route.params?.uid
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  const takePicture = async () => {
    if( camera ) {
      const options = {quality: 0.5};
      const data = await camera.takePictureAsync(options);
      console.log(data.uri);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  // Test

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={{ flex: 1,  height:50, marginTop:190 }} />}
      <Camera
        // ref={ref => setCamera(this.ref)}
        style={styles.camera}
        type={type}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
          <Ionicons
                    name="camera-reverse-outline"
                    color={"#36d8ff"}
                    size={20}
                
                  />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Ionicons
                    name="camera-outline"
                    color={"#36d8ff"}
                    size={20}
                
                  />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons
                    name="image-outline"
                    color={"#36d8ff"}
                    size={20}
                
                  />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.navigate("Save2", { image, passedID })}
          >
            <Ionicons
                    name="arrow-forward-outline"
                    color={"#36d8ff"}
                    size={20}
                
                  />
          </TouchableOpacity>
          
        </View>
      </Camera>
      
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: "row",
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor:'black',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: moderateScale(16, 0.1),
    color: "white",
  },
});
