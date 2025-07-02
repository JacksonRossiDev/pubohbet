// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import firebase from "firebase/compat/app";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import moment from "moment";
import { designHeightToPx } from "../utils/dimensions";
require("firebase/firestore");

export default function Search(props) {
  const [users, setUsers] = useState([]);

  const fetchUsers = (search) => {
    firebase
      .firestore()
      .collection("users")
      .where("name", ">=", search)
      .get()
      .then((snapshot) => {
        const users = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const id = doc.id;
            if (data?.name && data?.ppUrl) {
              return { id, ...data };
            }
            return null;
          })
          .filter(Boolean);
        setUsers(users);
      });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>

        {/* Back Arrow Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => props.navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search" color={"#7A7A7A"} size={20} />
          <TextInput
            style={styles.input}
            placeholder="someemail@gmail.com"
            placeholderTextColor="#7A7A7A"
            onChangeText={(search) => fetchUsers(search)}
          />
        </View>

        <FlatList
          numColumns={1}
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
          horizontal={false}
          data={users}
          ListHeaderComponent={() => (
            <View style={{ height: moderateScale(20, 0.1) }} />
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.searchResultWrapper}
              onPress={() =>
                props.navigation.navigate("Profile", { uid: item.id })
              }
            >
              <View style={styles.searchResultLeft}>
                <View style={styles.searchResultImageWrapper}>
                  <Image
                    style={styles.searchResultImage}
                    source={{
                      uri: item.ppUrl || "https://via.placeholder.com/40",
                    }}
                  />
                </View>
                <View style={styles.searchResultTextWrapper}>
                  <Text style={styles.searchResultTitle}>
                    {item.name || "No Name"}
                  </Text>
                  <Text style={styles.searchResultDesc}>
                    {moment().format("DD MMM YYYY")}
                  </Text>
                </View>
              </View>

              <Ionicons name="menu" color={"#2E85F7"} size={20} />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#6CB4EE",
  },
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 15,
    flex: 1,
    paddingHorizontal: moderateScale(20, 0.1),
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: moderateScale(10, 0.1),
    marginBottom: moderateScale(10, 0.1),
    padding: moderateScale(8, 0.1),
  },
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxHeight: moderateScale(70, 0.1),
    height: designHeightToPx(70),
    backgroundColor: "#EEF0F5",
    borderRadius: moderateScale(10, 0.1),
    marginTop: designHeightToPx(10),
    padding: moderateScale(12, 0.1),
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: moderateScale(12, 0.1),
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
  },
  searchResultWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(20, 0.1),
  },
  searchResultLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultImageWrapper: {
    borderColor: "#BE0000",
    padding: moderateScale(1, 0.1),
    borderWidth: moderateScale(2, 0.1),
    borderRadius: moderateScale(23, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultImage: {
    width: moderateScale(40, 0.1),
    height: moderateScale(40, 0.1),
    borderRadius: moderateScale(20, 0.1),
    borderColor: "#BE0000",
  },
  searchResultTextWrapper: {
    marginLeft: moderateScale(12, 0.1),
  },
  searchResultTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
    color: "white",
    marginBottom: moderateScale(4, 0.1),
  },
  searchResultDesc: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    lineHeight: moderateScale(12, 0.1),
    color: "white",
  },
});