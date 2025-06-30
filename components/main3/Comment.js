// @ts-check
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import firebase from "firebase/compat/app";
require("firebase/firestore");

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../redux/actions/index";
import { moderateScale } from "react-native-size-matters";
import { designHeightToPx } from "../utils/dimensions";
import { SafeAreaView } from "react-native-safe-area-context";

function Comment(props) {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    function matchUserToComment(comments) {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].hasOwnProperty("user")) {
          continue;
        }

        const user = props.users.find((x) => x.uid === comments[i].creator);
        if (user == undefined) {
          props.fetchUsersData(comments[i].creator, false);
        } else {
          comments[i].user = user;
        }
      }
      setComments(comments);
    }
    if (props.route.params.postId !== postId) {
      firebase
        .firestore()
        .collection("posts")
        .doc(props.route.params.uid)
        .collection("userPosts")
        .doc(props.route.params.postId)
        .collection("comments")
        .get()
        .then((snapshot) => {
          let comments = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          matchUserToComment(comments);
        });
      setPostId(props.route.params.postId);
    } else {
      matchUserToComment(comments);
    }
  }, [props.route.params.postId, props.users]);

  const onCommentSend = () => {
    firebase
      .firestore()
      .collection("posts")
      .doc(props.route.params.uid)
      .collection("userPosts")
      .doc(props.route.params.postId)
      .collection("comments")
      .add({
        creator: firebase.auth().currentUser?.uid,
        text,
      })
      .then(() => setText(""));
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <View
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        <FlatList
          numColumns={1}
          horizontal={false}
          data={comments}
          renderItem={({ item }) => (
            <View style={styles.postHeaderLeft}>
              <View style={styles.postHeaderImageWrapper}>
                <Image
                  style={styles.postHeaderImage}
                  source={{
                    uri: item?.user?.ppUrl,
                  }}
                />
              </View>
              <View style={styles.postHeaderTextWrapper}>
                <Text style={styles.postHeaderTitle}>
                  {item?.user?.name ?? "username"}
                </Text>
                <Text style={styles.postHeaderDesc}>{item.text}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: moderateScale(20, 0.1) }} />
          )}
        />
        <View style={styles.wrapper}>
          <TextInput
            style={styles.input}
            placeholder="Comment..."
            value={text}
            multiline
            onChangeText={setText}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.postStatusBtn}
          onPress={() => onCommentSend()}
        >
          <Text style={styles.postStatusBtnTitle}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    backgroundColor:  "#36d8ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: moderateScale(4, 0.1),
  },
  postStatusBtnTitle: {
    fontSize: moderateScale(12, 0.1),
    fontWeight: "500",
    color: "white",
  },
  postHeaderLeft: {
    width: "100%",
    flexDirection: "row",
  },
  postHeaderImageWrapper: {
    borderColor: "#BE0000",
    width: moderateScale(46, 0.1),
    height: moderateScale(46, 0.1),
    padding: moderateScale(1, 0.1),
    borderWidth: moderateScale(2, 0.1),
    borderRadius: moderateScale(23, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  postHeaderImage: {
    width: moderateScale(40, 0.1),
    height: moderateScale(40, 0.1),
    borderRadius: moderateScale(20, 0.1),
    borderColor: "#BE0000",
  },
  postHeaderTextWrapper: {
    marginLeft: moderateScale(12, 0.1),
  },
  postHeaderTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "700",
    marginBottom: 8,
  },
  postHeaderDesc: {
    fontSize: moderateScale(14, 0.1),
    color: "#000000",
  },
});

const mapStateToProps = (store) => ({
  users: store.usersState.users,
});
const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
