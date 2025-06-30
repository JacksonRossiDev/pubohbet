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
import firebase from "firebase/compat/app";
require("firebase/firestore");
import { connect } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { designHeightToPx } from "../utils/dimensions";
import CustomHeader from "../reusable/CustomHeader";

function Feed(props, {navigation}) {
  const [posts, setPosts] = useState([]);
  // console.log(posts)


  useEffect(() => {
    if (props.following.length !== 0) {
      const feed = [...props.feed]
        .filter(({ user }) => props.following?.includes(user?.uid))
        .sort((x, y) => y.creation - x.creation)

      
      setPosts(feed);
    }
  }, [JSON.stringify(props.following), JSON.stringify(props.feed)]);

//   useEffect(() => {
//     console.log("refreshed")
//  }, [route]);


  useEffect(() => {
    props.navigation.addListener('focus', () => {
      console.log("reloaded");
    });
  }, [navigation]);

  const onDislikePress = (userId, postId) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(userId)
      .collection("userPosts")
      .doc(postId)
      .collection("likes")
      .doc(firebase.auth().currentUser?.uid)
      .delete();
  };

  const onLikePress = (userId, postId) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(userId)
      .collection("userPosts")
      .doc(postId)
      .collection("likes")
      .doc(firebase.auth().currentUser?.uid)
      .set({});
  };

  
  const onDislikePress1 = (userId, postId) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(userId)
      .collection("userPosts")
      .doc(postId)
      .collection("agreements")
      .doc(firebase.auth().currentUser?.uid)
      .delete();
  };

  const onLikePress1 = (userId, postId) => {
    console.log("SET!!!!!!!!!!!!!!!!!!!!!!")
    firebase
      .firestore()
      .collection("posts")
      .doc(userId)
      .collection("userPosts")
      .doc(postId)
      .collection("agreements")
      .doc(firebase.auth().currentUser?.uid)
      .set({})
      .then(console.log("SET!!!!!!!!!!!!!!!!!!!!!!"));
  };

  
 const isLoggedinto1 = true;
  const DATA45 = [
    {
      title: 'kyle',
      url: "https://i.ibb.co/xMsdv7N/IMG-7945.jpg",
      url2: 'https://i.ibb.co/P1FQb1s/IMG-5870.jpg'
    },
    {
      title: 'colin',
      url: "https://i.ibb.co/PgJXZMN/IMG-7946.jpg",

      url2: 'https://i.ibb.co/xMsdv7N/IMG-7945.jpg',
      profileParam:"CrgRt1F18iPdQv3qorYWxoFIWgQ2"
    },
    {
      title: 'barnick',
      url2: "https://i.ibb.co/PgJXZMN/IMG-7946.jpg",
      profileParam:"57TH2FithQgediFovABJ1uXZUv23",
      url: 'https://i.ibb.co/P1FQb1s/IMG-5870.jpg'
    },
    {
      title: 'steveW',
      url2: 'https://i.ibb.co/P1FQb1s/IMG-5870.jpg',
      url: "https://i.ibb.co/PgJXZMN/IMG-7946.jpg",
    },
    {
      title: 'rossi',
      url: "https://i.ibb.co/P1FQb1s/IMG-5870.jpg",
      url2: 'https://i.ibb.co/PgJXZMN/IMG-7946.jpg',

    },
    {
      
      title: 'buschemi',
      url: "https://i.ibb.co/P1FQb1s/IMG-5870.jpg",
      url2: 'https://i.ibb.co/xMsdv7N/IMG-7945.jpg',

    },
  
  ];



// delayedPopup()
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <CustomHeader name={`Hi, ${props.currentUser?.name ?? "user"}`} navigation={props.navigation}/>
      <FlatList
        numColumns={1}
        style={styles.listWrapper}
        horizontal={false}
        data={posts}
        ListHeaderComponent={() => (
          <>
            {/* trending */}
            <View style={styles.trendingWrapper}>
              
              <FlatList
                numColumns={1}
                style={styles.trendingContainer}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={() => (
                  <View style={{ width: moderateScale(20, 0.1) }} />
                )}
                horizontal={true}
                data={DATA45}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() =>
                    props.navigation.navigate("Profile", {
                      uid: item.profileParam,
                    })
                  } >
                  <View style={styles.trendingPost}>
                    <View style={styles.trendingImageWrapper}>
                      <Image
                        style={styles.trendingImage}
                        source={{
                          uri: item.url,
                        }}
                      />
                      
                    </View>
                    <View style={styles.trendingImageWrapper2}>
                      <Image
                        style={styles.trendingImage2}
                        source={{
                          uri: item.url2,
                        }}
                      />
                      
                    </View>
                    
                    {/* <Text style={styles.trendingTitle}>{item.title} <MaterialCommunityIcons name="check-decagram" color={'white'}/> </Text> */}
                  </View>
                  </TouchableOpacity>
                  
                )}
              />
            </View>

            {/* post status */}
            <View style={styles.postStatusContainer}>
              <View style={styles.postStatusWrapper}>
                <View style={styles.postStatusHeader}>
                  <Image
                    style={styles.postStatusHeaderImage}
                    source={{
                      uri: props.currentUser?.ppUrl,
                    }}
                  />
                  <Text style={styles.postStatusHeaderTitle}>
                    Want to create a risk, {props.currentUser?.name || "user"}?
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.postStatusBtn}
                  onPress={() => props.navigation.navigate("userMatch")}
                >
                  <Text style={styles.postStatusBtnTitle}>Create Risk Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        
        renderItem={({ item }) => (

          
          <TouchableOpacity onPress={() =>
            props.navigation.navigate("PartyScreen", {
              postId: item.id,
              uid: item.user.uid,
              creditBalance: item.user.uid,
              name: item.user.name,
              time: item.creation.seconds,
              caption: item.caption,
              location: item.location,
              title: item.title,
              imageUrl: item.url,
              betterAgree: item?.betterAgree,
              riskerAgree: item?.riskerAgree,
              date: item.date,
              wager: item.wager,
              ppUrl: item.user.ppUrl,
              currentUserLike: item.currentUserLike,
              currentUserLike1: item.currentUserLike1,
              likesCount: item.likesCount,
              agreementCount: item.agreementCount,
              userRisker: item?.userRisker,
              creditBalance: item?.user?.creditBalance,
              withdrawBalance: item?.user?.withdrawBalance,

            })
          }>
          <View style={styles.postContainer}>
            <View style={styles.postWrapper}>
              <View style={styles.postHeaderWrapper}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() =>
                    item.user?.uid &&
                    props.navigation.navigate("Profile", {
                      uid: item.user.uid,
                    })
                  }
                  style={styles.postHeaderLeft}
                >
                  <View style={styles.postHeaderImageWrapper}>
                    <Image
                      style={styles.postHeaderImage}
                      source={{
                        uri:  item.user.ppUrl
                      }}
                    />
                  </View>
                  <View style={styles.postHeaderSecondImageWrapper}>
                  <Image
                      style={styles.postHeaderImage}
                      source={{
                        uri:  item?.userRisker?.ppUrl
                      }}
                    />
                  </View>
                  <View style={styles.postHeaderTextWrapper}>
                    <Text style={styles.postHeaderTitle}>{item.user.name} and {item?.userRisker?.name}</Text>
                    <Text style={styles.postHeaderDesc}>
                      {moment(item.creation.seconds * 1000).format(
                        "DD MMM YYYY"
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                onPress={() =>
                  item.user?.uid &&
                  props.navigation.navigate("Profile", {
                    uid: item.user.uid,
                  })
                }
                
                
                activeOpacity={0.8}>
                  <Ionicons name="menu" color={"#36d8ff"} size={20} />
                </TouchableOpacity>
              </View>

              {item.caption && item.caption.length && (
                <Text style={styles.postCaption}>{item.caption}</Text>
              )}
              {item.downloadURL && item.downloadURL.length && (
                <Image
                  style={styles.image}
                  source={{ uri: item.downloadURL }}
                />
              )}
              

              {/* <View style={{flexDirection:'row'}}>
                  <Ionicons name="person-circle-outline" color={"black"} size={20} /> 
                      {item.wager && item.wager.length && (
                        <Text style={styles.wagerCaption}>{" "+item.risker}</Text>
                      )}
              </View> */}
              <View style={{flexDirection:'row'}}>
                  {item?.agreementCount ? (
                    <View style={{flexDirection:'row'}}>
                    <Ionicons
                      name="happy"
                      color='green'
                      size={22}
                      
                    />
                    <Text style={{marginTop:3.5, color:'green'}}>Paid</Text>
                    </View>
                  ) : (
                    <View style={{flexDirection:'row'}}>

                    <Ionicons
                      name="sad"
                      color='red'
                      size={22}
                      
                    />
                    <Text style={{marginTop:3.5, color:'red'}}>UnPaid</Text>
                    </View>
                  )}
              </View>
              <View style={{flexDirection:'row'}}>

              <Ionicons name="cash-outline" color={"green"} size={20} /> 
              {(typeof item.wager === 'number') &&  (
                <Text style={styles.paidWagerCaption}>{`$${item.wager}`}</Text>
              )}
              </View>
              
              
              
              {item.url && item.url.length && (
                <Image
                  style={styles.image}
                  source={{ uri: item.url }}
                />
              )}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop:10 }}>
                <View>
                  {item?.currentUserLike ? (
                    <Ionicons
                      name="chevron-up-circle"
                      color={"#36d8ff"}
                      size={22}
                      onPress={() =>
                        item?.currentUserLike
                          ? onDislikePress(item.user.uid, item.id)
                          : onLikePress(item.user.uid, item.id)
                      }
                    />
                  ) : (
                    <Ionicons
                      name="chevron-up-circle-outline"
                      color={"#36d8ff"}
                      size={22}
                      onPress={() =>
                        item?.currentUserLike
                          ? onDislikePress(item.user.uid, item.id)
                          : onLikePress(item.user.uid, item.id)
                      }
                    />
                  )}
                </View>
                
                
                <Text>{item?.likesCount ?? 0}</Text>
                <View style={{ marginLeft: 8 }}>
                  <Ionicons
                    name="chatbubble-outline"
                    color={"#36d8ff"}
                    size={20}
                    onPress={() =>
                      props.navigation.navigate("Comment", {
                        postId: item.id,
                        uid: item.user.uid,
                      })
                    }
                  />
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Ionicons
                    name="send"
                    color={"#36d8ff"}
                    size={20}
                    onPress={() =>
                      props.navigation.navigate("Comment", {
                        postId: item.id,
                        uid: item.user.uid,
                      })
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    color: "white",
    backgroundColor: "#36d8ff",
  },
  listWrapper: {
    flex: 1,
    backgroundColor: "#36d8ff",
  },
  trendingContainer: {
    flex: 1,
    marginHorizontal: moderateScale(-20, 0.1),
    marginBottom:-28
  },
  trendingWrapper: {
    width: "100%",
    backgroundColor: "#36d8ff",
    marginTop:-15,
    padding: moderateScale(20, 0.1),
    marginBottom: 20,
  },
  trendingHeaderWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(24, 0.1),
  },
  trendingLabel: {
    fontSize: moderateScale(24, 0.1),
    fontWeight: "600",
    color:"white",
    lineHeight: moderateScale(30, 0.1),
  },
  trendingPost: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(24, 0.1),
  },
  trendingImageWrapper: {
    borderColor: "#BE0000",
    padding: moderateScale(2, 0.1),
    borderRadius: moderateScale(34, 0.1),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(8, 0.1),
  },
  trendingImageWrapper2: {
    borderColor: "#BE0000",
    padding: moderateScale(2, 0.1),
    borderRadius: moderateScale(34, 0.1),
    justifyContent: "center",
    alignItems: "center",
    marginTop:-50,
    
    marginBottom: moderateScale(8, 0.1),
  },
  trendingImage: {
    width: 50,
    height: 50,
    borderRadius: moderateScale(30, 0.1),
    borderColor: "#BE0000",
  },
  trendingImage2: {
    width: 50,
    height: 50,
    marginLeft:30,
    borderRadius: moderateScale(30, 0.1),
    borderColor: "#BE0000",
  },
  trendingTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    color:"white",
    lineHeight: moderateScale(18, 0.1),
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
    width: "100%",
    marginBottom: moderateScale(12, 0.1),
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: '#36d8ff',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: moderateScale(4, 0.1),
  },
  postStatusBtnTitle: {
    fontSize: moderateScale(12,),
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
    justifyContent: "space-between",
    marginBottom: moderateScale(20, 0.1),
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  locationWrapper: {
    
  },
  
  postHeaderImage: {
    width: moderateScale(40, 0.1),
    height: moderateScale(40, 0.1),
    borderRadius: moderateScale(20, 0.1),
    borderColor: "#BE0000",
  },
  postHeaderTextWrapper: {
    marginLeft: moderateScale(12, 0.1),
    marginTop:15
  },
  postHeaderTitle: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "400",
  },
  postHeaderDesc: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    lineHeight: moderateScale(12, 0.1),
    color: "#7A7A7A",
  },
  postCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
  },
  wagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
    
  },
   paidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
    color:'green',
    marginLeft:3
    
  },
   unpaidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
    color:'red'
    
  },
  postCaptionBold: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: 'bold',
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
  },
  image: {
    borderRadius: moderateScale(4, 0.1),
    flex: 1,
    aspectRatio: 1 / 1,
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
    fontWeight: "400",
  },
});

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#36d8ff",
//   },
//   listWrapper: {
//     flex: 1,
//     backgroundColor: "##36d8ff",
//   },
//   trendingContainer: {
//     flex: 1,
//     marginHorizontal: moderateScale(-20, 0.1),
//   },
//   trendingWrapper: {
//     width: "100%",
//     backgroundColor: "#fff",
//     padding: moderateScale(20, 0.1),
//     marginBottom: designHeightToPx(45),
//   },
//   trendingHeaderWrapper: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: designHeightToPx(24),
//   },
//   trendingLabel: {
//     fontSize: moderateScale(24, 0.1),
//     fontWeight: "600",
//     lineHeight: moderateScale(30, 0.1),
//   },
//   trendingPost: {
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: moderateScale(24, 0.1),
//   },
//   trendingImageWrapper: {
//     borderColor: "#BE0000",
//     padding: moderateScale(2, 0.1),
//     borderWidth: moderateScale(2, 0.1),
//     borderRadius: moderateScale(34, 0.1),
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: moderateScale(8, 0.1),
//   },
//   trendingImage: {
//     width: moderateScale(60, 0.1),
//     height: moderateScale(60, 0.1),
//     borderRadius: moderateScale(30, 0.1),
//     borderColor: "#BE0000",
//   },
//   trendingTitle: {
//     fontSize: moderateScale(14, 0.1),
//     fontWeight: "500",
//     lineHeight: moderateScale(18, 0.1),
//   },
//   postStatusContainer: {
//     width: "100%",
//     paddingHorizontal: moderateScale(20, 0.1),
//     marginBottom: moderateScale(28, 0.1),
//   },
//   postStatusWrapper: {
//     backgroundColor: "#FFF",
//     borderRadius: moderateScale(4, 0.1),
//     padding: moderateScale(18, 0.1),
//     alignItems: "center",
//   },
//   postStatusHeader: {
//     width: "100%",
//     marginBottom: moderateScale(12, 0.1),
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   postStatusHeaderImage: {
//     width: moderateScale(36, 0.1),
//     height: moderateScale(36, 0.1),
//     borderRadius: moderateScale(18, 0.1),
//   },
//   postStatusHeaderTitle: {
//     fontSize: moderateScale(14, 0.1),
//     fontWeight: "500",
//     marginLeft: moderateScale(12, 0.1),
//   },
//   postStatusBtn: {
//     width: "80%",
//     height: designHeightToPx(40, 0.1),
//     backgroundColor: "#2E85F7",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: moderateScale(4, 0.1),
//   },
//   postStatusBtnTitle: {
//     fontSize: moderateScale(12, 0.1),
//     fontWeight: "500",
//     color: "white",
//   },
//   postContainer: {
//     width: "100%",
//     paddingHorizontal: moderateScale(20, 0.1),
//     marginBottom: moderateScale(28, 0.1),
//   },
//   postWrapper: {
//     backgroundColor: "#FFF",
//     borderRadius: moderateScale(4, 0.1),
//     padding: moderateScale(18, 0.1),
//   },
//   postHeaderWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: moderateScale(20, 0.1),
//   },
//   postHeaderLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   postHeaderImageWrapper: {
//     borderColor: "#BE0000",
//     padding: moderateScale(1, 0.1),
//     borderWidth: moderateScale(2, 0.1),
//     borderRadius: moderateScale(23, 0.1),
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   postHeaderImage: {
//     width: moderateScale(40, 0.1),
//     height: moderateScale(40, 0.1),
//     borderRadius: moderateScale(20, 0.1),
//     borderColor: "#BE0000",
//   },
//   postHeaderTextWrapper: {
//     marginLeft: moderateScale(12, 0.1),
//   },
//   postHeaderTitle: {
//     fontSize: moderateScale(14, 0.1),
//     fontWeight: "400",
//   },
//   postHeaderDesc: {
//     fontSize: moderateScale(10, 0.1),
//     fontWeight: "400",
//     lineHeight: moderateScale(12, 0.1),
//     color: "#7A7A7A",
//   },
//   postCaption: {
//     fontSize: moderateScale(14, 0.1),
//     fontWeight: "500",
//     lineHeight: moderateScale(18, 0.1),
//     marginBottom: moderateScale(20, 0.1),
//   },
//   image: {
//     borderRadius: moderateScale(4, 0.1),
//     flex: 1,
//     width: "100%",
//     aspectRatio: 1 / 1,
//     marginBottom: moderateScale(20, 0.1),
//   },
// });
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);
