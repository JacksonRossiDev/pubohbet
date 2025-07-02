// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { connect, useDispatch } from "react-redux";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomHeader from "../reusable/CustomHeader";
import { moderateScale } from "react-native-size-matters";
import {
  fetchUser,
  fetchUserFollowing,
  fetchUserPosts,
} from "../../redux/actions";
import StepIndicator from "react-native-step-indicator";

const STEP_LABELS = ["Initiated", "Accepted", "Complete", "Paid"];
const POSTS_PER_PAGE = 10;

function Feed({
  currentUser,
  userPosts = [],
  feed = [],
  usersFollowingLoaded,
  navigation,
}) {
  const dispatch = useDispatch();

  // all posts array and paginated visible posts
  const [allPosts, setAllPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);

  // pagination & loading flags
  const [page, setPage] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // image viewer state
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  // load Redux data on mount
  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchUserFollowing());
    dispatch(fetchUserPosts());
  }, [dispatch]);

  // combine, dedupe, sort whenever feed or userPosts change
  useEffect(() => {
    const mine = userPosts.map((p) => ({ ...p, user: currentUser }));
    const combined = [...mine, ...feed];
    const uniqueMap = combined.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    const sorted = Object.values(uniqueMap).sort(
      (a, b) => b.creation.seconds - a.creation.seconds
    );
    setAllPosts(sorted);
    setPage(1);
  }, [feed, userPosts, currentUser]);

  // fetch comment counts helper
  const fetchCommentCounts = async (postsArray) =>
    Promise.all(
      postsArray.map(async (post) => {
        try {
          const snap = await firebase
            .firestore()
            .collection("posts")
            .doc(post.user.uid)
            .collection("userPosts")
            .doc(post.id)
            .collection("comments")
            .get();
          return { ...post, commentsCount: snap.size };
        } catch {
          return { ...post, commentsCount: 0 };
        }
      })
    );

  // load first page of posts + their comment counts
  useEffect(() => {
    if (!allPosts.length) {
      setLoadingInitial(false);
      return;
    }
    (async () => {
      try {
        const firstSlice = allPosts.slice(0, POSTS_PER_PAGE);
        const withCounts = await fetchCommentCounts(firstSlice);
        setVisiblePosts(withCounts);
      } catch (e) {
        console.error("Error loading initial posts:", e);
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, [allPosts]);

  // infinite scroll handler
  const handleLoadMore = async () => {
    if (loadingMore) return;
    if (visiblePosts.length >= allPosts.length) return;

    setLoadingMore(true);
    const start = page * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const nextSlice = allPosts.slice(start, end);

    try {
      const nextWithCounts = await fetchCommentCounts(nextSlice);
      setVisiblePosts((prev) => [...prev, ...nextWithCounts]);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error("Error loading more posts:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  // like/dislike helpers
  const onLikePress = (uid, pid, col) =>
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(pid)
      .collection(col)
      .doc(firebase.auth().currentUser.uid)
      .set({});
  const onDislikePress = (uid, pid, col) =>
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(pid)
      .collection(col)
      .doc(firebase.auth().currentUser.uid)
      .delete();

  // show spinner until initial load + following data ready
  if (loadingInitial || !usersFollowingLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <CustomHeader
        name={`Hi, ${currentUser?.name ?? "user"}`}
        navigation={navigation}
      />

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        initialNumToRender={POSTS_PER_PAGE}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? <ActivityIndicator style={{ margin: 12 }} /> : null
        }
        ListHeaderComponent={() => (
          <>
            {/* trending carousel placeholder */}
            <View style={styles.trendingWrapper}>
              {/* TODO: implement your trending carousel here */}
            </View>

            {/* create-risk prompt */}
            <View style={styles.postStatusContainer}>
              <View style={styles.postStatusWrapper}>
                <View style={styles.postStatusHeader}>
                  <Image
                    style={styles.postStatusHeaderImage}
                    source={{ uri: currentUser?.ppUrl }}
                  />
                  <Text style={styles.postStatusHeaderTitle}>
                    Want to create a risk, {currentUser?.name}?
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.postStatusBtn}
                  onPress={() => navigation.navigate("Chat")}
                >
                  <Text style={styles.postStatusBtnTitle}>
                    Create Risk Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        renderItem={({ item }) => {
          const currentPhase = item.betComplete
            ? 4
            : item.handsShaken
            ? 2
            : 1;
          const isOwner = item.user.uid === currentUser.uid;

          return (
            <TouchableOpacity
              onPress={() => {
                const params = {
                  postId: item.id,
                  wager: item.wager,
                  creatorUid: item.user.uid,
                  creatorPPUrl: item.user.ppUrl,
                  riskerUid: item.userRisker?.uid,
                  riskerPPUrl: item.userRisker?.ppUrl,
                };
                navigation.navigate(
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
                        navigation.navigate("Profile", { uid: item.user.uid })
                      }
                      style={styles.postHeaderLeft}
                    >
                      <View style={styles.postHeaderImageWrapper}>
                        <Image
                          style={styles.postHeaderImage}
                          source={{ uri: item.user.ppUrl }}
                        />
                      </View>
                      <View style={styles.postHeaderSecondImageWrapper}>
                        <Image
                          style={styles.postHeaderImage}
                          source={{ uri: item.userRisker?.ppUrl }}
                        />
                      </View>
                      <View style={styles.postHeaderTextWrapper}>
                        <Text style={styles.postHeaderTitle}>
                          {item.user.name} challenged {item.userRisker?.name}
                        </Text>
                        <Text style={styles.postHeaderDesc}>
                          {moment(item.creation.seconds * 1000).format(
                            "DD MMM YYYY"
                          )}
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

                  {/* Wager */}
                  <View style={{ flexDirection: "row", marginTop: 12 }}>
                    <Ionicons name="cash-outline" color="green" size={20} />
                    <Text style={styles.paidWagerCaption}>
                      ${item.wager}
                    </Text>
                  </View>

                  {/* Secondary Image */}
                  {item.url?.length > 0 && (
                    <Image style={styles.image} source={{ uri: item.url }} />
                  )}

                  {/* 4-Step Progress Indicator */}
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
                          ? onDislikePress(item.user.uid, item.id, "likes")
                          : onLikePress(item.user.uid, item.id, "likes")
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
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: 12,
                      }}
                      onPress={() =>
                        navigation.navigate("Comment", {
                          postId: item.id,
                          uid: item.user.uid,
                        })
                      }
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        color="#6CB4EE"
                        size={20}
                      />
                      <Text style={{ marginLeft: 4 }}>
                        {item.commentsCount ?? 0}
                      </Text>
                    </TouchableOpacity>

                    {selectedImageUri && (
                      <ImageViewing
                        images={[{ uri: selectedImageUri }]}
                        imageIndex={0}
                        visible={isViewerVisible}
                        onRequestClose={() => setIsViewerVisible(false)}
                        backgroundColor="black"
                      />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#6CB4EE",
  },
  trendingWrapper: {
    width: "100%",
    backgroundColor: "#6CB4EE",
    marginTop: -15,
    padding: moderateScale(20, 0.1),
    marginBottom: 20,
  },
  trendingPost: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(24, 0.1),
  },
  trendingImageWrapper: {
    padding: moderateScale(2, 0.1),
    borderRadius: moderateScale(34, 0.1),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(8, 0.1),
  },
  trendingImage: {
    width: 50,
    height: 50,
    borderRadius: moderateScale(30, 0.1),
  },
  trendingImageWrapper2: {
    padding: moderateScale(2, 0.1),
    borderRadius: moderateScale(34, 0.1),
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
    marginBottom: moderateScale(8, 0.1),
  },
  trendingImage2: {
    width: 50,
    height: 50,
    marginLeft: 30,
    borderRadius: moderateScale(30, 0.1),
  },
  trendingTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    color: "white",
  },
  postStatusContainer: {
    width: "100%",
    paddingHorizontal: moderateScale(20, 0.1),
    marginBottom: moderateScale(28, 0.1),
  },
  postStatusWrapper: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(4, 0.1),
    padding: moderateScale(18, 0.1),
    alignItems: "center",
  },
  postStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(12, 0.1),
  },
  postStatusHeaderImage: {
    width: moderateScale(36, 0.1),
    height: moderateScale(36, 0.1),
    borderRadius: moderateScale(18, 0.1),
  },
  postStatusHeaderTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    marginLeft: moderateScale(12, 0.1),
  },
  postStatusBtn: {
    width: "80%",
    height: moderateScale(40, 0.1),
    backgroundColor: "#6CB4EE",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: moderateScale(4, 0.1),
  },
  postStatusBtnTitle: {
    fontSize: moderateScale(12, 0.1),
    color: "white",
  },
  postContainer: {
    width: "100%",
    paddingHorizontal: moderateScale(20, 0.1),
    marginBottom: moderateScale(28, 0.1),
  },
  postWrapper: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(4, 0.1),
    padding: moderateScale(18, 0.1),
  },
  postHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(20, 0.1),
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  postHeaderImageWrapper: {
    padding: moderateScale(1, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  postHeaderSecondImageWrapper: {
    marginLeft: -35,
    marginTop: 30,
    padding: moderateScale(1, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  postHeaderImage: {
    width: moderateScale(40, 0.1),
    height: moderateScale(40, 0.1),
    borderRadius: moderateScale(20, 0.1),
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
    marginBottom: moderateScale(20, 0.1),
  },
  paidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    color: "green",
    marginLeft: 3,
    marginBottom: moderateScale(20, 0.1),
  },
  image: {
    borderRadius: moderateScale(4, 0.1),
    aspectRatio: 1,
    flex: 1,
  },
});

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

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  userPosts: store.userState.posts,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps)(Feed);