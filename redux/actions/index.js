// @ts-check
import {
  USER_STATE_CHANGE,
  USER_POSTS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USERS_DATA_STATE_CHANGE,
  USERS_POSTS_STATE_CHANGE,
  USERS_LIKES_STATE_CHANGE,
  USERS_LIKES1_STATE_CHANGE,
  CLEAR_DATA,
  USERS_POSTS_LIKES_COUNT_STATE_CHANGE,
  USERS_POSTS_AGREEMENT_COUNT_STATE_CHANGE,
} from "../constants/index";
import firebase from "firebase/compat/app";
// import { SnapshotViewIOSComponent} from 'react-native'
require("firebase/firestore");

export function clearData() {
  return (dispatch) => {
    dispatch({ type: CLEAR_DATA });
  };
}
export function fetchUser() {
  return (dispatch) => {
    const uid = firebase.auth().currentUser?.uid;
    if (!uid) return;

    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          // grab the data and tack on the uid
          const userData = snapshot.data();
          userData.uid = snapshot.id;
          dispatch({
            type: USER_STATE_CHANGE,
            currentUser: userData,
          });
        } else {
          console.log("User doc does not exist");
        }
      })
      .catch(console.error);
  };
}

export function fetchUserFollowing() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("following")
      .doc(firebase.auth().currentUser?.uid)
      .collection("userFollowing")
      .onSnapshot((snapshot) => {
        let following = snapshot.docs.map((doc) => {
          const id = doc.id;
          return id;
        });
        dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
        for (let i = 0; i < following.length; i++) {
          dispatch(fetchUsersData(following[i], true));
        }
      });
  };
}

export function fetchUsersData(uid, getPosts) {
  return (dispatch, getState) => {
    const found = getState().usersState.users.some((el) => el.uid === uid);

    if (!found) {
      firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            let user = snapshot.data();
            user.uid = snapshot.id;

            dispatch({ type: USERS_DATA_STATE_CHANGE, user });
          } else {
            console.log("test");
          }
          if (getPosts) {
            /* //TODO maybe user.uid? user.id is original */
            dispatch(fetchUserFollowingPosts(uid));
          }
        });
    }
  };
}

export function fetchUserPosts() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(firebase.auth().currentUser?.uid)
      .collection("userPosts")
      .orderBy("creation", "desc")
      .get()
      .then((snapshot) => {
        let posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
      });
  };
}

export function fetchUserPostLikesCount(uid, postId) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(postId)
      .collection("likes")
      .get()
      .then((snapshot) => {
        dispatch({
          type: USERS_POSTS_LIKES_COUNT_STATE_CHANGE,
          postId,
          likesCount: snapshot.docs?.length,
        });
      });
  };
}
export function fetchUserPostAgreementCount(uid, postId) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(postId)
      .collection("agreements")
      .get()
      .then((snapshot) => {
        dispatch({
          type: USERS_POSTS_AGREEMENT_COUNT_STATE_CHANGE,
          postId,
          agreementCount: snapshot.docs?.length,
        });
      });
  };
}

export function fetchUserFollowingLikes(uid, postId) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(postId)
      .collection("likes")
      .doc(firebase.auth().currentUser?.uid)
      .onSnapshot((snapshot) => {
        // TODO original: const uid = snapshot.ZE.path.segments[3]  console.log(snapshot)
        // console.log({snapshot});
        const postId = snapshot.ref.path.split("/")[3];

        let currentUserLike = false;
        if (snapshot.exists) {
          currentUserLike = true;
        }
        dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike });
        dispatch(fetchUserPostLikesCount(uid, postId));
      });
  };
}
export function fetchUserFollowingLikes1(uid, postId) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(postId)
      .collection("agreements")
      .doc(firebase.auth().currentUser?.uid)
      .onSnapshot((snapshot) => {
        // TODO original: const uid = snapshot.ZE.path.segments[3]  console.log(snapshot)
        // console.log({snapshot});
        const postId = snapshot.ref.path.split("/")[3];

        let currentUserLike1 = false;
        if (snapshot.exists) {
          currentUserLike1 = true;
        }
        dispatch({ type: USERS_LIKES1_STATE_CHANGE, postId, currentUserLike1 });
        dispatch(fetchUserPostLikesCount(uid, postId));
        dispatch(fetchUserPostAgreementCount(uid, postId));
      });
  };
}


export function fetchUserFollowingPosts(uid) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .orderBy("creation", "desc")
      .limit(10)
      .get()
      .then((snapshot) => {
        // TODO original: const uid = snapshot.query.EP.path.segments[1]  console.log(snapshot)
        const uid = snapshot._delegate.query._query.path.segments[1];
        // console.log({snapshot, uid});
        const user = getState().usersState.users.find((el) => el.uid === uid);
        let posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;

          return { id, ...data, user };
        });

        for (let i = 0; i < posts.length; i++) {
          dispatch(fetchUserPostLikesCount(uid, posts[i].id));
          dispatch(fetchUserPostAgreementCount(uid, posts[i].id));
          dispatch(fetchUserFollowingLikes(uid, posts[i].id));
          dispatch(fetchUserFollowingLikes1(uid, posts[i].id));
        }
        dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
      });
  };
}
