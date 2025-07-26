// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { connect, useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import firebase from "firebase/compat/app";
import { moderateScale } from "react-native-size-matters";
import moment from "moment";
import CustomHeader from "../reusable/CustomHeader";
import { designHeightToPx } from "../utils/dimensions";
import { fetchUserPosts } from "../../redux/actions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BlurView } from 'expo-blur';
import { ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StepIndicator from "react-native-step-indicator";
const STEP_LABELS = ["Initiated", "Accepted", "Complete", "Paid"];

const stepIndicatorStyles = {
  stepIndicatorSize: 20,
  currentStepIndicatorSize: 24,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#6CB4EE",
  stepStrokeFinishedColor: "#6CB4EE",
  stepStrokeUnFinishedColor: "#E0E0E0",
  separatorFinishedColor: "#6CB4EE",
  separatorUnFinishedColor: "#E0E0E0",
  stepIndicatorFinishedColor: "#6CB4EE",
  stepIndicatorUnFinishedColor: "#E0E0E0",
  stepIndicatorCurrentColor: "#FFF",
  stepIndicatorLabelCurrentColor: "#6CB4EE",
  stepIndicatorLabelFinishedColor: "#FFF",
  stepIndicatorLabelUnFinishedColor: "#7A7A7A",
  labelColor: "#7A7A7A",
  currentStepLabelColor: "#000",
};
require("firebase/firestore");

function Profile(props) {
  const dispatch = useDispatch();
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState(0);
  const [numberOfFollowing, setNumberOfFollowing] = useState(0);
  const [numberOfFollower, setNumberOfFollower] = useState(0);
  const currentUser = firebase.auth().currentUser.uid
  useEffect(() => {
    if (props.route.params?.uid === firebase.auth().currentUser?.uid) {
      dispatch(fetchUserPosts());
    }
  }, []);

  useEffect(() => {
    if (props.route.params?.uid === firebase.auth().currentUser?.uid) {
      setUserPosts(props.posts);
      console.log(props.route.params?.uid)
    }
  }, [props.route.params?.uid, props.posts]);

  useEffect(() => {
  // figure out whose profile we're on:
  const uid = props.route.params?.uid || firebase.auth().currentUser.uid;

  // 1) load that user's Firestore document into `user`
  firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get()
    .then((snap) => {
      if (snap.exists) {
        setUser(snap.data());
      }
    })
    .catch(console.warn);

  // 2) load that user's posts into `userPosts`
  firebase
    .firestore()
    .collection("posts")
    .doc(uid)
    .collection("userPosts")
    .orderBy("creation", "desc")
    .get()
    .then((snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
    })
    .catch(console.warn);
}, [props.route.params?.uid]);

 

  useEffect(() => {
    const uid = props.route.params?.uid || firebase.auth().currentUser?.uid;

    firebase
      .firestore()
      .collection("following")
      .doc(uid)
      .collection("userFollowing")
      .get()
      .then((snapshot) => {
        if (snapshot.docs) {
          setNumberOfFollowing(snapshot.docs.length);
        }
      });

    firebase
      .firestore()
      .collectionGroup("userFollowing")
      .get()
      .then((snapshot) => {
        if (snapshot.docs) {
          setNumberOfFollower(
            snapshot.docs.filter((doc) => doc.id === uid).length
          );
        }
      });

    if (props.following.indexOf(props.route.params.uid) > -1) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params.uid, props.following]);



  const tallyAlert = () => {
    if (userPosts?.length <= 10) {
      alert(`Please create ${10 - userPosts?.length} more risks to unlock your Trust Tally`)
    }
    else {
      alert(`Trust Tally Placeholder`)

    }
  }

  const getPhase = item => {
  if (item.betComplete) return 4;
  if (item.Winner)     return 3;
  if (item.betExpired) return 2;
  return 1;
};
  const onUnFollow = () => {
    firebase
      .firestore()
      .collection("following")
      .doc(firebase.auth().currentUser?.uid)
      .collection("userFollowing")
      .doc(props.route.params.uid)
      .delete();
  };

  const goingScreen = () => {
    props.navigation.navigate('Paywall', {
      
      
    })
}
  const onLogout = async () => {
    await firebase.auth().signOut();
    await AsyncStorage.removeItem('userToken');
    props.navigation.replace('Login'); // or your root auth screen
  };
  const onFollow = () => {
    firebase
      .firestore()
      .collection("following")
      .doc(firebase.auth().currentUser?.uid)
      .collection("userFollowing")
      .doc(props.route.params.uid)
      .set({});
  };


const currentUserUid = firebase.auth().currentUser.uid;
const profileUid = props.route.params?.uid ?? currentUserUid;

const renderPost = ({ item }) => {
  // 1) Countdown calculation (like Feed.js)
  let countdown = null;
  if (
    !item.betComplete &&
    !item.deniedBet &&
    !item.betExpired &&
    item.creation?.seconds
  ) {
    const days    = item.durationDays ?? 7;
    const startMs = item.creation.seconds * 1000;
    const endMs   = startMs + days * 24 * 60 * 60 * 1000;
    const diff    = endMs - Date.now();
    if (diff > 0) {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdown = `${d}d ${h}h ${m}m ${s}s`;
    }
  }

  // 2) User/risker/phase logic
  const postUserUid  = item.user?.uid   ?? profileUid;
  const postUserName = item.user?.name  ?? user.name;
  const postUserPP   = item.user?.ppUrl ?? user.ppUrl;
  const riskerUid    = item.userRisker?.uid;
  const riskerName   = item.userRisker?.name;
  const riskerPP     = item.userRisker?.ppUrl;
  const isOwner      = postUserUid === currentUserUid;
  const isExpired    = item.betExpired;
  const currentPhase = item.betComplete
    ? 4
    : item.Winner
    ? 3
    : isExpired
    ? 2
    : 1;

  return (
    <TouchableOpacity
      disabled={item.deniedBet || item.betExpired || item.Winner}
      onPress={() => {
        const params = {
          postId:       item.id,
          wager:        item.wager,
          creatorUid:   postUserUid,
          creatorPPUrl: postUserPP,
          riskerUid,
          riskerPPUrl:  riskerPP,
        };
        props.navigation.navigate(
          isOwner ? "PartyScreen" : "PrePartyScreen",
          params
        );
      }}
    >
      <View style={styles.postContainer}>
        <View style={styles.postWrapper}>
          {/* Header */}
          <View style={styles.postHeaderWrapper}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() =>
                props.navigation.navigate("Profile", { uid: postUserUid })
              }
              style={styles.postHeaderLeft}
            >
              <View style={styles.postHeaderImageWrapper}>
                <Image
                  style={styles.postHeaderImage}
                  source={{ uri: postUserPP }}
                />
              </View>
              {riskerPP && (
                <View style={styles.postHeaderSecondImageWrapper}>
                  <Image
                    style={styles.postHeaderImage}
                    source={{ uri: riskerPP }}
                  />
                </View>
              )}
              <View style={styles.postHeaderTextWrapper}>
                <Text style={styles.postHeaderTitle}>
                  {postUserName} challenged {riskerName}
                </Text>
                <Text style={styles.postHeaderDesc}>
                  {moment(item.creation.seconds * 1000).format("DD MMM YYYY")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Caption / Image */}
          {item.caption?.length > 0 && (
            <Text style={styles.postCaption}>{item.caption}</Text>
          )}
          {item.downloadURL?.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={async () => {
                await Image.prefetch(item.downloadURL);
                setSelectedImageUri(item.downloadURL);
                setIsViewerVisible(true);
              }}
            >
              <Image
                style={styles.image}
                source={{ uri: item.downloadURL }}
              />
            </TouchableOpacity>
          )}

          {/* Badges */}
          {item.deniedBet ? (
            <View style={styles.deniedBadge}>
              <Text style={styles.deniedBadgeText}>Bet Denied</Text>
            </View>
          ) : isExpired ? (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>Bet Expired</Text>
            </View>
          ) : item.Winner ? (
            <View style={styles.winnerBadge}>
              <Text style={styles.winnerBadgeText}>
                Winner: {item.Winner}
              </Text>
            </View>
          ) : null}

          {/* Timer */}
          {countdown && (
            <View style={styles.timerWrapper}>
              <Text style={styles.timerText}>⏳ {countdown}</Text>
            </View>
          )}

          {/* Wager */}
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <Ionicons name="cash-outline" color="green" size={20} />
            <Text style={styles.paidWagerCaption}>${item.wager}</Text>
          </View>

          {/* Secondary Image */}
          {item.url?.length > 0 && (
            <Image style={styles.image} source={{ uri: item.url }} />
          )}

          {/* 4-Step Indicator */}
          <View style={{ marginTop: 12, paddingHorizontal: 0 }}>
            <StepIndicator
              customStyles={stepIndicatorStyles}
              currentPosition={currentPhase - 1}
              labels={STEP_LABELS}
              stepCount={4}
            />
          </View>

          {/* Reactions & Comments */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                item.currentUserLike
                  ? onDislikePress(item.user?.uid, item.id, "likes")
                  : onLikePress(item.user?.uid, item.id, "likes")
              }
            >
              <Ionicons
                name={
                  item.currentUserLike
                    ? "chevron-up-circle"
                    : "chevron-up-circle-outline"
                }
                color="#6CB4EE"
                size={22}
              />
            </TouchableOpacity>
            <Text style={{ marginLeft: 8 }}>
              {item.likesCount ?? 0}
            </Text>

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}
              onPress={() =>
                props.navigation.navigate("Comment", {
                  postId: item.id,
                  uid: postUserUid,
                })
              }
            >
              <Ionicons name="chatbubble-outline" color="#6CB4EE" size={20} />
              <Text style={{ marginLeft: 4 }}>
                {item.commentsCount ?? 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};


  if (user === null) {
    return <View />;
  }

const header = () => {
  return (
    <View style={styles.container}>
      {/* PROFILE IMAGE, NAME, TALLY */}
      <View style={styles.header}>
        <View style={styles.profileImageWrapper}>
          <Image
            style={styles.profileImage}
            source={{ uri: user.ppUrl }}
          />
        </View>
        <Text style={styles.username}>{user.name}</Text>

        <View style={styles.informationWrapper}>
          <View style={styles.informationColumn} />
          <View style={styles.informationColumn}>
            <TouchableOpacity onPress={tallyAlert} activeOpacity={0.8}>
              <View style={styles.tallyContainer}>
                <ImageBackground
                  source={require('../../assets/brush.webp')}
                  style={styles.tallyBackground}
                  imageStyle={{ borderRadius: 8 }}
                >
                  <Text style={styles.blurredNumber}>28</Text>
                </ImageBackground>
              </View>
            </TouchableOpacity>
            <Text style={styles.informationDesc}>Trust Tally</Text>
            <View style={styles.comingSoonOverlay}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
            {props.route.params?.uid === currentUser && (
              <TouchableOpacity
                style={[styles.logoutBtn, { marginTop: 8 }]}
                onPress={onLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutBtnLabel}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.informationColumn} />
        </View>
      </View>

      {/* RISKS / FOLLOWING / FOLLOWERS */}
      <View style={styles.informationWrapper}>
        <View style={styles.informationColumn}>
          <Text style={styles.informationTitle}>
            {userPosts?.length ?? 0}
          </Text>
          <Text style={styles.informationDesc}>Risks</Text>
        </View>
        <View style={styles.informationColumn}>
          <Text style={styles.informationTitle}>{numberOfFollowing}</Text>
          <Text style={styles.informationDesc}>Following</Text>
        </View>
        <View style={styles.informationColumn}>
          <Text style={styles.informationTitle}>{numberOfFollower}</Text>
          <Text style={styles.informationDesc}>Followers</Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      {props.route.params.uid === currentUser ? (
        <View style={styles.createRiskButton}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.followBtn}
            onPress={goingScreen}
          >
            <Text style={styles.followBtnLabel}>Withdrawal</Text>
          </TouchableOpacity>
        </View>
      ) : !following ? (
        <View style={styles.followBtnWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.followBtn}
            onPress={onFollow}
          >
            <Text style={styles.followBtnLabel}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.extendFollowBtn}
          >
            <Ionicons name="menu" color="white" size={20} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.followBtnWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.followBtn}
            onPress={onUnFollow}
          >
            <Text style={styles.followBtnLabel}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.messageBtn}
          >
            <Text style={styles.followBtnLabel}>Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {props.route.params.uid !== currentUser && (
        <View style={styles.createRiskButton}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.followBtn}
            onPress={() =>
              props.navigation.navigate("Save", { uid: props.route.params.uid })
            }
          >
            <Text style={styles.followBtnLabel}>
              Create Risk with {user.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TABS */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabColumn}>
          <TouchableOpacity
            activeOpacity={1}
            style={tab === 0 ? styles.tabSelectedBtn : styles.tabUnSelectedBtn}
            onPress={() => setTab(0)}
          >
            <Text
              style={
                tab === 0 ? styles.tabSelectedLabel : styles.tabUnSelectedLabel
              }
            >
              Mailbox
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabColumn}>
          <TouchableOpacity
            activeOpacity={1}
            style={tab === 1 ? styles.tabSelectedBtn : styles.tabUnSelectedBtn}
            onPress={() => setTab(1)}
          >
            <Text
              style={
                tab === 1 ? styles.tabSelectedLabel : styles.tabUnSelectedLabel
              }
            >
              Ongoing
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabColumn}>
          <TouchableOpacity
            activeOpacity={1}
            style={tab === 2 ? styles.tabSelectedBtn : styles.tabUnSelectedBtn}
            onPress={() => setTab(2)}
          >
            <Text
              style={
                tab === 2 ? styles.tabSelectedLabel : styles.tabUnSelectedLabel
              }
            >
              Complete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

  isTouchable = props.route.params?.uid === currentUser

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <CustomHeader
        back={!!props.route.params?.uid}
        name={`Hi, ${user?.name}`}
        navigation={props.navigation}
      />
{tab === 0 && (
  <FlatList
    showsVerticalScrollIndicator={false}
    ListHeaderComponent={header}
    numColumns={1}
    style={styles.listCaption}
    data={userPosts.filter(item => getPhase(item) === 1)}
    renderItem={renderPost}
    ListFooterComponent={() => (
      <View style={{ height: designHeightToPx(32, 0.1) }} />
    )}
  />
)}

{tab === 1 && (
  <FlatList
    showsVerticalScrollIndicator={false}
    ListHeaderComponent={header}
    numColumns={1}
    style={styles.listCaption}
    data={userPosts.filter(item => getPhase(item) === 2)}
    renderItem={renderPost}
    ListFooterComponent={() => (
      <View style={{ height: designHeightToPx(32, 0.1) }} />
    )}
  />
)}

{tab === 2 && (
  <FlatList
    showsVerticalScrollIndicator={false}
    ListHeaderComponent={header}
    numColumns={1}
    style={styles.listCaption}
    data={userPosts.filter(item => getPhase(item) >= 3)}
    renderItem={renderPost}
    ListFooterComponent={() => (
      <View style={{ height: designHeightToPx(32, 0.1) }} />
    )}
  />
)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#6CB4EE",
  },
  listWrapper: {
    flex: 1,
    backgroundColor: "#6CB4EE",
    paddingHorizontal: moderateScale(20, 0.1),
  },
  listCaption: {
    flex: 1,
    backgroundColor: "#6CB4EE",
  },
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#6CB4EE",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: moderateScale(20, 0.1),
    backgroundColor: "#6CB4EE",
  },
  profileImageWrapper: {
    borderColor: "#BE0000",
    padding: moderateScale(2, 0.1),
    borderWidth: moderateScale(2, 0.1),
    borderRadius: moderateScale(62, 0.1),
    marginBottom: moderateScale(8, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: moderateScale(120, 0.1),
    height: moderateScale(120, 0.1),
    borderRadius: moderateScale(60, 0.1),
    borderColor: "#BE0000",
  },
  username: {
    fontSize: moderateScale(20, 0.1),
    fontWeight: "500",
    color: "white",
    lineHeight: moderateScale(24, 0.1),
    marginBottom: moderateScale(12, 0.1),
  },
  email: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    color: "#7A7A7A",
    lineHeight: moderateScale(24, 0.1),
    marginBottom: moderateScale(30, 0.1),
  },
  followBtnWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: designHeightToPx(40, 0.1),
  },
  createRiskButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: designHeightToPx(40, 0.1),
  },
  followBtn: {
    borderRadius: 4,
    paddingHorizontal: moderateScale(44, 0.1),
    paddingVertical: moderateScale(12, 0.1),
    backgroundColor: "white",
  },
  followBtnLabel: {
    fontSize: moderateScale(12, 0.1),
    fontWeight: "500",
    color: "#6CB4EE",
  },
  messageBtn: {
    borderRadius: 4,
    paddingHorizontal: moderateScale(44, 0.1),
    paddingVertical: moderateScale(12, 0.1),
    marginLeft: 20,
    backgroundColor: "white",
  },
  messageBtnLabel: {
    fontSize: moderateScale(12, 0.1),
    fontWeight: "500",
    color: "#6CB4EE",
  },
  extendFollowBtn: {
    borderRadius: moderateScale(19, 0.1),
    backgroundColor: "#2E85F716",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: moderateScale(16, 0.1),
    width: moderateScale(38, 0.1),
    height: designHeightToPx(38, 0.1),
  },
  informationWrapper: {
    width: "100%",
    flexDirection: "row",
    marginBottom: designHeightToPx(30, 0.1),
  },
  informationColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  informationTitle: {
    fontSize: moderateScale(20, 0.1),
    lineHeight: moderateScale(24, 0.1),
    fontWeight: "500",
    color: "white",
    marginBottom: moderateScale(4, 0.1),
  },
  informationDesc: {
    fontSize: moderateScale(12, 0.1),
    lineHeight: moderateScale(24, 0.1),
    fontWeight: "400",
    color: "white",
  },

  // Trust Tally styles
  tallyContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  tallyBackground: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    opacity: 0.3,
  },
  blurredNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    zIndex: 1,
  },
  comingSoonOverlay: {
    position: "absolute",
    top: 25,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 16,
    zIndex: 2,
    minWidth: 90,
    alignItems: "center",
  },
  comingSoonText: {
    color: "#6CB4EE",
    fontSize: 10,
    fontWeight: "600",
  },

  tabWrapper: {
    width: "90%",
    flexDirection: "row",
    marginBottom: designHeightToPx(44, 0.1),
  },
  tabColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabSelectedBtn: {
    paddingVertical: moderateScale(10, 0.1),
    borderRadius: moderateScale(4, 0.1),
    width: "85%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  tabUnSelectedBtn: {
    paddingVertical: moderateScale(10, 0.1),
    borderRadius: moderateScale(4, 0.1),
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabSelectedLabel: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    color: "#6CB4EE",
  },
  tabUnSelectedLabel: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    color: "white",
  },

  imageWrapper: {
    width: "33.3%",
    padding: moderateScale(6, 0.1),
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 0.86,
    borderRadius: moderateScale(9, 0.1),
  },

  postContainer: {
    width: "100%",
    paddingHorizontal: moderateScale(20, 0.1),
    marginTop: moderateScale(14, 0.1),
  },
  postWrapper: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(4, 0.1),
    padding: moderateScale(18, 0.1),
  },
  postHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(20, 0.1),
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  postHeaderImageWrapper: {
    borderColor: "#BE0000",
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
  postHeaderSecondImageWrapper: {
    marginLeft: -35,
    marginTop: 30,
    padding: moderateScale(1, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  postHeaderTextWrapper: {
    marginLeft: moderateScale(12, 0.1),
    marginTop: 15,
  },
  postHeaderTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
  },
  postHeaderDesc: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    color: "#7A7A7A",
  },
  postCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(12, 0.1),
  },

  // badges & timer & wager
  deniedBadge: {
    backgroundColor: "red",
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(10, 0.1),
    paddingVertical: moderateScale(4, 0.1),
    borderRadius: moderateScale(12, 0.1),
    marginBottom: moderateScale(8, 0.1),
  },
  deniedBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: moderateScale(12, 0.1),
  },
  expiredBadge: {
    backgroundColor: "red",
  marginTop:20,
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(10, 0.1),
    paddingVertical: moderateScale(4, 0.1),
    borderRadius: moderateScale(12, 0.1),
    marginBottom: moderateScale(8, 0.1),
  },
  expiredBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: moderateScale(12, 0.1),
  },
  winnerBadge: {
    backgroundColor: "green",
    alignSelf: "flex-start",
    marginTop:20,
    paddingHorizontal: moderateScale(10, 0.1),
    paddingVertical: moderateScale(4, 0.1),
    borderRadius: moderateScale(12, 0.1),
    marginBottom: moderateScale(8, 0.1),
  },
  winnerBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: moderateScale(12, 0.1),
  },
  timerWrapper: {
    backgroundColor: "#FFE4B5",
    paddingVertical: moderateScale(4, 0.1),
    paddingHorizontal: moderateScale(10, 0.1),
    borderRadius: moderateScale(10, 0.1),
    alignSelf: "flex-start",
    marginBottom: moderateScale(8, 0.1),
  },
  timerText: {
    color: "#333",
    fontWeight: "600",
    fontSize: moderateScale(12, 0.1),
  },
  paidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    color: "green",
    marginLeft: 3,
    marginBottom: moderateScale(20, 0.1),
  },
  unpaidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    color: "red",
    marginBottom: moderateScale(20, 0.1),
  },

  logoutBtn: {
    marginTop: moderateScale(16, 0.1),
    backgroundColor: "white",
    paddingVertical: moderateScale(12, 0.1),
    paddingHorizontal: moderateScale(24, 0.1),
    borderRadius: 16,
  },
  logoutBtnLabel: {
    color: "#6CB4EE",
    fontSize: moderateScale(12, 0.1),
    fontWeight: "500",
    textAlign: "center",
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
