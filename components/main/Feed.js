// Feed.js
// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { moderateScale } from "react-native-size-matters";  // ← add this
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, fetchUserFollowing } from "../../redux/actions";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomHeader from "../reusable/CustomHeader";
import StepIndicator from "react-native-step-indicator";
const STEP_LABELS = ["Initiated", "Accepted", "Complete", "Paid"];
// Pagination constant
const POSTS_PER_PAGE = 10;

// Your helper to chunk arrays:
const chunk = (arr, size = 10) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};
// how many to fetch per page

export default function Feed({ navigation }) {
  const dispatch    = useDispatch();
  const currentUser = useSelector(s => s.userState.currentUser);
  const userPosts   = useSelector(s => s.userState.posts        || []);
  const feed        = useSelector(s => s.usersState.feed        || []);
  const following   = useSelector(s => s.userState.following    || []);
const [isViewerVisible, setIsViewerVisible]     = useState(false);
const [selectedImageUri, setSelectedImageUri]   = useState(null);
// countdown timers (7-day expiry)
const [countdownTimers, setCountdownTimers]     = useState({});
  // 🚀 load user & following info on mount
  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchUserFollowing());
  }, [dispatch]);
  const [posts, setPosts]           = useState([]);   // all loaded so far
  const [visiblePosts, setVisible]  = useState([]);   // for FlatList
  const [lastDoc, setLastDoc]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper: split array into chunks of max 10 (for Firestore 'in' queries)
  const chunk = (arr, size=10) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
// inside Feed(), before your first useEffect:

// fetch comment counts for an array of posts
const fetchCommentCounts = async (postsArray) => {
  return Promise.all(
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
};
  // Load the first page
useEffect(() => {
  if (!currentUser) return;

  // 1) stamp your own posts
  const mine = userPosts.map(p => ({ ...p, user: currentUser }));

  // 2) combine with the feed Redux already fetched
  const combined = [...mine, ...feed];

  // 3) dedupe purely by post.id
  const mapById = new Map();
  combined.forEach(post => {
    if (!mapById.has(post.id)) {
      mapById.set(post.id, post);
    }
  });

  // 4) sort newest-first
  const deduped = Array.from(mapById.values()).sort(
    (a, b) => b.creation.seconds - a.creation.seconds
  );

  // 5) paginate & load first page
setPosts(deduped);

(async () => {
  const firstSlice = deduped.slice(0, POSTS_PER_PAGE);
  const withCounts = await fetchCommentCounts(firstSlice);
  setVisible(withCounts);
  setLoading(false);
})();
}, [currentUser, userPosts, feed]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const uids = [...following, currentUser.uid];
      const batches = chunk(uids);

      const snaps = await Promise.all(
        batches.map((batch) =>
          firebase
            .firestore()
            .collectionGroup("userPosts")
            .where("uid", "in", batch)
            .orderBy("creation", "desc")
            .startAfter(lastDoc.creation)
            .limit(POSTS_PER_PAGE)
            .get()
        )
      );

      let docs = snaps.flatMap((snap) => snap.docs.map((d) => ({
        id:   d.id,
        ...d.data(),
        creation: d.data().creation,
        user: {
          uid:   d.data().uid,
          name:  d.data().name,
          ppUrl: d.data().ppUrl,
        }
      })));

      // filter out already‐loaded
      const existingIds = new Set(posts.map((p) => p.id));
      docs = docs.filter((p) => !existingIds.has(p.id))
                 .sort((a, b) => b.creation.seconds - a.creation.seconds);

      setPosts((prev) => [...prev, ...docs]);
      setVisible((prev) => [...prev, ...docs]);
      if (docs.length) setLastDoc(docs[docs.length - 1]);
    } finally {
      setLoadingMore(false);
    }
  }, [currentUser, following, lastDoc, loadingMore, posts]);
useEffect(() => {
  const interval = setInterval(() => {
    const newTimers = {};

    visiblePosts.forEach((item) => {
      // how many days this bet lasts (fallback to 7)
      const days   = item.durationDays ?? 7;
      const startMs = item.creation.seconds * 1000;
      const endMs   = startMs + days * 24 * 60 * 60 * 1000;
      const diff    = endMs - Date.now();

      if (diff > 0) {
        // compute days / hours / minutes / seconds
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        newTimers[item.id] = `${d}d ${h}h ${m}m ${s}s`;
      } else if (!item.betExpired) {
        // once expired, mark in Firestore so UI disables it
        firebase
          .firestore()
          .collection("posts")
          .doc(item.user.uid)
          .collection("userPosts")
          .doc(item.id)
          .update({ betExpired: true })
          .catch(console.warn);
      }
    });

    setCountdownTimers(newTimers);
  }, 1000);

  return () => clearInterval(interval);
}, [visiblePosts]);
  if (loading) {
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
        onEndReached={loadMore}
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
            const isExpired = item.betExpired;

          const currentPhase = item.betComplete
            ? 4
            : item.handsShaken
            ? 2
            : 1;
          const isOwner = item.user.uid === currentUser.uid;
const countdown = countdownTimers[item.id];
          return (
            <TouchableOpacity
  disabled={item.deniedBet || item.betExpired}

              onPress={() => {
                const isOwner = item.user.uid === currentUser.uid;
                const params = {
                  postId:       item.id,
                  wager:        item.wager,
                  creatorUid:   item.user.uid,
                  creatorPPUrl: item.user.ppUrl,
                  riskerUid:    item.userRisker?.uid,
                  riskerPPUrl:  item.userRisker?.ppUrl,
                };
                console.log("→ Feed.navigate params:", params);
        
                if (isOwner) {
                  navigation.navigate("PartyScreen", params);
                } else {
                  navigation.navigate("PrePartyScreen", params);
                }
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
    <Text style={styles.winnerBadgeText}>Winner: {item.Winner}</Text>
  </View>
) : null}

          {/* Timer (only if not expired) */}
{!item.betComplete &&
 !item.deniedBet &&
 !item.betExpired &&
 countdown && (
  <View style={styles.timerWrapper}>
    <Text style={styles.timerText}>⏳ {countdown}</Text>
  </View>
)}
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
  deniedBadge: {
  backgroundColor: 'red',
  alignSelf: 'flex-start',
  paddingHorizontal: moderateScale(10, 0.1),
  paddingVertical: moderateScale(4, 0.1),
  borderRadius: moderateScale(12, 0.1),
  marginBottom: moderateScale(8, 0.1),
},
deniedBadgeText: {
  color: 'white',
  fontWeight: '600',
  fontSize: moderateScale(12, 0.1),
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

  winnerBadge: {
  backgroundColor: 'green',
  alignSelf: 'flex-start',
  paddingHorizontal: moderateScale(10, 0.1),
  paddingVertical: moderateScale(4, 0.1),
  borderRadius: moderateScale(12, 0.1),
  marginBottom: moderateScale(8, 0.1),
},
winnerBadgeText: {
  color: 'white',
  fontWeight: '600',
  fontSize: moderateScale(12, 0.1),
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
  expiredBadge: {
  backgroundColor: 'red',
  alignSelf: 'flex-start',
  paddingHorizontal: moderateScale(10, 0.1),
  paddingVertical: moderateScale(4, 0.1),
  borderRadius: moderateScale(12, 0.1),
  marginBottom: moderateScale(8, 0.1),
},
expiredBadgeText: {
  color: 'white',
  fontWeight: '600',
  fontSize: moderateScale(12, 0.1),
},
  timerWrapper: {
  backgroundColor: "#FFE4B5",
  paddingVertical: moderateScale(4, 0.1),
  paddingHorizontal: moderateScale(10, 0.1),
  borderRadius: moderateScale(10, 0.1),
  alignSelf: 'flex-start',
  marginBottom: moderateScale(8, 0.1),
},
timerText: {
  color: "#333",
  fontWeight: "600",
  fontSize: moderateScale(12, 0.1),
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

