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


require("firebase/firestore");

function Profile(props) {
  const dispatch = useDispatch();
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState(0);
  const [numberOfFollowing, setNumberOfFollowing] = useState(0);
  const [numberOfFollower, setNumberOfFollower] = useState(0);

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
    if (props.route.params?.uid === firebase.auth().currentUser?.uid) {
      setUser(props.currentUser);
    }
  }, [props.route.params?.uid, props.currentUser]);

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

  useEffect(() => {
    if (props.route.params?.uid !== firebase.auth().currentUser?.uid) {
      firebase
        .firestore()
        .collection("users")
        .doc(props.route.params?.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUser(snapshot.data());
          } else {
            console.log("does not exist3");
          }
        });
      firebase
        .firestore()
        .collection("posts")
        .doc(props.route.params?.uid)
        .collection("userPosts")
        .orderBy("creation", "desc")
        .get()
        .then((snapshot) => {
          let posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setUserPosts(posts);
        });
        console.log(props.route.params?.uid)

    }
  }, [props.route.params.uid]);

  const tallyAlert = () => {
    if (userPosts?.length <= 10) {
      alert(`Please create ${10 - userPosts?.length} more risks to unlock your Trust Tally`)
    }
    else {
      alert(`What is a Trust Tally? >.....`)

    }
  }
  
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

  const onFollow = () => {
    firebase
      .firestore()
      .collection("following")
      .doc(firebase.auth().currentUser?.uid)
      .collection("userFollowing")
      .doc(props.route.params.uid)
      .set({});
  };

  if (user === null) {
    return <View />;
  }

  const header = () => (
    <View
      style={[
        styles.container,
        tab === 1 && { paddingHorizontal: moderateScale(20, 0.1) },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.profileImageWrapper}>
          <Image
            style={styles.profileImage}
            source={{
              uri: user.ppUrl,
            }}
          />
        </View>
        <Text style={styles.username}>{user.name}</Text>
        {/* <Text style={styles.email}>{user.occupation}</Text> */}


        <View style={styles.informationWrapper}>
          <View style={styles.informationColumn}>
            
          </View>


            {userPosts?.length <= 10 
            ?
            <TouchableOpacity onPress={()=> tallyAlert()}>
          <View style={styles.informationColumn}>
          <Ionicons name="lock-closed-outline" color={"white"} size={30} />
            <Text style={styles.informationDesc}>Trust Tally</Text>
          </View>
          </TouchableOpacity>
          :
          <TouchableOpacity onPress={()=> tallyAlert()}>
          <View style={styles.informationColumn}>
            <Text style={styles.informationDesc}>{userPosts?.length}</Text>
            <Text style={styles.informationDesc}>{"Trust Tally"}</Text>
          </View>
          </TouchableOpacity>

            
            
            }
          

          
          <View style={styles.informationColumn}>
            
          </View>
        </View>
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
        





        {props.route.params.uid === firebase.auth().currentUser?.uid && (
          <>
          <View style={styles.createRiskButton}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.followBtn}
                  onPress={() =>
                    goingScreen()
                    
                  }
                >
                  <Text style={styles.followBtnLabel}>Withdrawal </Text>
                </TouchableOpacity>
               

               
              </View>
          </>
        )}





        {props.route.params.uid !== firebase.auth().currentUser?.uid && (
          <>
            {!following ? (
              <View style={styles.followBtnWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.followBtn}
                  onPress={() => onFollow()}
                >
                  <Text style={styles.followBtnLabel}>Follow</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.extendFollowBtn}
                >
                  <Ionicons name="menu" color={"white"} size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.followBtnWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.followBtn}
                  onPress={() => onUnFollow()}
                >
                  <Text style={styles.followBtnLabel}>Following</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.messageBtn}
                >
                  <Text style={styles.followBtnLabel}>Message </Text>
                </TouchableOpacity>

               
              </View>
            )}
            <View style={styles.createRiskButton}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.followBtn}
                  onPress={() =>
                    props.navigation.navigate("Save", { uid: props.route.params?.uid })
                  }
                >
                  <Text style={styles.followBtnLabel}>Create Risk with {user.name} </Text>
                </TouchableOpacity>
               

               
              </View>
            
          </>
        )}
        {/* <Button title="Logout" onPress={() => onLogout()} /> */}
      </View>

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
              Media
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
              Text
            </Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.tabColumn}>
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
              Tagged
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );

  

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
          numColumns={3}
          style={styles.listWrapper}
          data={userPosts.filter((e) => e.downloadURL && e.downloadURL !== "")}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
            </View>
          )}
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
          data={userPosts.filter((e) => !e.downloadURL || e.downloadURL === "")}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <View style={styles.postWrapper}>
                <View style={styles.postHeaderWrapper}>
                  <View style={styles.postHeaderLeft}>
                    {/* <View style={styles.postHeaderImageWrapper}>
                      <Image
                        style={styles.postHeaderImage}
                        source={{
                          uri: user.ppUrl,
                        }}
                      />
                    </View> */}
                    <View style={styles.postHeaderSecondImageWrapper}>
                    {/* <Image
                      style={styles.postHeaderImage}
                      source={{
                        uri:  item?.userRisker?.ppUrl
                      }}
                    /> */}
                  </View>
                    <View style={styles.postHeaderTextWrapper}>
                      <Text style={styles.postHeaderTitle}>{user.name} and {item?.userRisker?.name}</Text>
                      <Text style={styles.postHeaderDesc}>
                        {moment(item.creation.seconds * 1000).format(
                          "DD MMM YYYY"
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.postCaption}>{item.caption}</Text>
                {/* <View style={{flexDirection:'row'}}>
                  <Ionicons name="person-circle-outline" color={"black"} size={20} /> 
                      {item.wager && item.wager.length && (
                        <Text style={styles.wagerCaption}>{" "+item.risker}</Text>
                      )}
              </View> */}
              <View style={{flexDirection:'row', marginTop:20}}>
              <Ionicons name="cash-outline" color={"green"} size={20} /> 
              {item.wager && item.wager.length && (
                <Text style={styles.paidWagerCaption}>{" $"+item.wager}</Text>
              )}
              </View>
              
              {item.status ==="paid" ? 
              
              <View style={{flexDirection:'row'}}>
              <Ionicons name="checkmark-circle-outline" color={"green"} size={20} /> 
              {item.wager && item.wager.length && (
                <Text style={styles.paidWagerCaption}>{" "} Paid</Text>
              )}
              </View>
                :
                <View style={{flexDirection:'row'}}>
              <Ionicons name="alert-circle-outline" color={"red"} size={20} /> 
              {item.wager && item.wager.length && (
                <Text style={styles.unpaidWagerCaption}>{" "}Unpaid</Text>
              )}
              </View>
          }
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ height: designHeightToPx(32, 0.1) }} />
          )}
        />
      )}
      {tab === 2 && (
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          style={styles.listWrapper}
          numColumns={1}
          data={[]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#36d8ff",
  },
  listWrapper: {
    flex: 1,
    backgroundColor: "#36d8ff",
    paddingHorizontal: moderateScale(20, 0.1),
  },
  listCaption: {
    flex: 1,
    backgroundColor: "#36d8ff",
  },
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#36d8ff",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: moderateScale(20, 0.1),
    backgroundColor: "#36d8ff",
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
    color:'white',
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
    color: "#36d8ff",

  },
  messageBtn: {
    borderRadius: 4,
    paddingHorizontal: moderateScale(44, 0.1),
    paddingVertical: moderateScale(12, 0.1),
    marginLeft:20,
    backgroundColor: "white",
  },
  messageBtnLabel: {
    fontSize: moderateScale(12, 0.1),
    fontWeight: "500",
    color: "#36d8ff",

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
    color:'white',
    marginBottom: moderateScale(4, 0.1),
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
  tabSelectedLabel: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    color: "#36d8ff",
  },
  tabUnSelectedBtn: {
    paddingVertical: moderateScale(10, 0.1),
    borderRadius: moderateScale(4, 0.1),
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabUnSelectedLabel: {
    fontSize: moderateScale(10, 0.1),
    fontWeight: "400",
    color: 'white'
  },
  informationDesc: {
    fontSize: moderateScale(12, 0.1),
    lineHeight: moderateScale(24, 0.1),
    fontWeight: "400",
    color: "white",
  },
  postHeaderSecondImageWrapper: {
    marginLeft: -35,
    marginTop: 30,
    padding: moderateScale(1, 0.1),
  
    justifyContent: "center",
    alignItems: "center",
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
  },
  paidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
    color:'green'
    
  },
   unpaidWagerCaption: {
    fontSize: moderateScale(14, 0.1),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    marginBottom: moderateScale(20, 0.1),
    color:'red'
    
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
