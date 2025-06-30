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
import CustomHeader from "../reusable/CustomHeader";
import moment from "moment";
import { designHeightToPx } from "../utils/dimensions";
require("firebase/firestore");

export default function Search(props) {
  const [users, setUsers] = useState([]);
  // const [users, setUsers] = useState<users[]>([]);

  const fetchUsers = (search) => {
    firebase
      .firestore()
      .collection("users")
      .where("name", ">=", search)
      .get()
      .then((snapshot) => {
        let users = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        // @ts-ignore
        setUsers(users);
      });
  };
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      {/* <CustomHeader name={"Search Anything"} /> */}

      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" color={"#7A7A7A"} size={20} />
          <TextInput
            style={styles.input}
            placeholder="someemail@gmail.com"
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
                      uri: item.ppUrl,
                    }}
                  />
                </View>
                <View style={styles.searchResultTextWrapper}>
                  <Text style={styles.searchResultTitle}>{item.name}</Text>
                  <Text style={styles.searchResultDesc}>
                    {moment().format("DD MMM YYYY")}
                  </Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8}>
                <Ionicons name="menu" color={"#2E85F7"} size={20} />
              </TouchableOpacity>
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
    backgroundColor: "#36d8ff",
  },
  container: {
    width: "100%",
    alignItems: "center",
    marginTop:15,
    flex: 1,
    paddingHorizontal: moderateScale(20, 0.1),
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
    marginTop: designHeightToPx(48),
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
    color:'white',
    marginBottom: moderateScale(4, 0.1),
  },
  searchResultDesc: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    lineHeight: moderateScale(12, 0.1),
    color: "white",
  },
});
