import {View, Text, Image, Pressable, StyleSheet, TouchableOpacity, Switch} from "react-native"
import React, {useEffect, useLayoutEffect, useState} from "react";
import { ScrollView, TouchableHighlight,  } from "react-native-gesture-handler";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import Ionicons, { Button } from "react-native-vector-icons/Ionicons";
import firebase from "firebase/compat/app";
import { connect, useDispatch } from "react-redux";
import { moderateScale } from "react-native-size-matters";


require("firebase/firestore");



const PrePartyScreen = (props) => {
    const [currentLoggedinUser, setCurrentLoggedinUser] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [isEnabled2, setIsEnabled2] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const toggleSwitch2 = () => setIsEnabled2(previousState => !previousState);
    const riskWager = props.route.params.wager
    const currentUserLoggedinBalance = currentLoggedinUser?.creditBalance

    const newLoserBalance = currentUserLoggedinBalance - riskWager

    const userRiskerEmail = props.route.params?.userRisker?.email
    const userRiskerEmailtoLower = userRiskerEmail.toLowerCase();
    useEffect(() => {
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser?.uid)
            .get()
            .then((snapshot) => {
              if (snapshot.exists) {
                setCurrentLoggedinUser(snapshot.data());
              } else {
                console.log("does not exist3");
              }
            });
      }, []);

      useEffect (() => {
        if (isEnabled && isEnabled2) {
          props.navigation.navigate("PartyScreen", {
            wager: props.route.params.wager,
            userRisker : props.route.params?.userRisker,
            ppUrl: props?.route?.params?.ppUrl,
            myName: props?.route?.params?.myName,
            uid:props?.route?.params?.uid ,
            postId: props?.route?.params?.postId,
            agreementCount: props?.route?.params?.agreementCount

          })
        
        // console.log('both clicked')
        // console.log('WAGER', props.route.params.wager)
        }
      })

      // console.log('CLIU',currentLoggedinUser?.creditBalance)
      // console.log('CLIU2',currentLoggedinUser)

      console.log('SAME',userRiskerEmailtoLower)
      console.log('SAME',firebase.auth().currentUser?.email)


    const goBack = () => {
        props.navigation.navigate('Search')
    }
    const goingScreen = () => {
        props.navigation.navigate('YoureGoingScreen', {
          
          imageUrl: props.route.params.imageUrl,
          
        })
    }
    const maybeScreen = () => {
        props.navigation.navigate('Search')
    }
    const notGoingScreen = () => {
        props.navigation.navigate('Search')
    }
    const betterBalance = props?.route?.params?.creditBalance
    const withdrawBalance = props?.route?.params?.withdrawBalance
    const riskerBalance = props.route.params?.userRisker?.creditBalance

    console.log('WDB',withdrawBalance)

    console.log(props.route.params)




    const withdrawBalanceTotal = Number(withdrawBalance)


    const numBetterBalance = Number(betterBalance)

    console.log(betterBalance, 'better balance')
    console.log(riskWager, 'riskWager')
    console.log(typeof(betterBalance), 'TObetter balance')
    console.log(typeof riskWager, 'TOriskWager')
   
 
    console.log(withdrawBalanceTotal + riskWager)
    
    const winnerPayout = () => {
        firebase
          .firestore()
          .collection("users")
          .doc(props?.route?.params?.uid)
          .set({creditBalance: (numBetterBalance + riskWager), withdrawBalance: (withdrawBalanceTotal + riskWager)}, { merge: true } );
      };

      const loserPayment = () => {
        firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser?.uid)
            .set({creditBalance: newLoserBalance}, { merge: true } );
        };
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

          props.navigation.navigate('Home')
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

          goingScreen();
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
          .then(winnerPayout())
          .then(loserPayment())
          .then(props.navigation.navigate('Home', {'paramPropKey': 'paramPropValue'}));
      };
    return (
        <ScrollView style={{backgroundColor:'#6CB4EE', }}>
            

            {/* <View style={{backgroundColor:'white'}}>
                <View classname="px-4 pt-4">
                    <Text className="text-3xl font-bold">{props.route.params.title}</Text>
                    <Text className="text-3xl font-bold">Wager:{props.route.params.wager}</Text>
                    <Text className="text-l ">{props.route.params.name}</Text>
                    <View className="flex-row space-x-2 my-1">
                        <View className="flex-row items-center space-x-1">
                            <Ionicons name="calendar" opacity={0.5}/> 
                            <Text className="text-xs text-gray-500">
                                <Text className="text-500">{props.route.params.date}</Text>    
                            </Text>
                        </View>                   
                        <View className="flex-row items-center space-x-1">
                            <Ionicons name="location" opacity={0.5}/> 
                            <Text className="text-xs text-gray-500">
                                <Text className="text-s-gray">{props.route.params.location}</Text>    
                            </Text>
                        </View>                   
                        <View className="flex-row items-center space-x-1">
                            <Ionicons name="people" opacity={0.5}/> 
                            <Text className="text-xs text-gray-500">
                                <Text className="text-s-gray">{props.route.params.likesCount}</Text>    
                            </Text>
                        </View>                   
                     </View>
                    <Text className="text-gray-500 mt-2 pb-4">{props.route.params.caption}</Text>
                </View>
            </View> */}
            
            <View style = {styles.postHeaderImageWrapper}>
            <View style={{justifyContent: 'flex-start', alignItems: 'center'}}>
              
                      <Image
                        style={styles.postHeaderImage}
                        source={{
                          uri: props?.route?.params?.ppUrl
                        }}
                      />
                                  <View style={{justifyContent: 'flex-start', alignItems: 'center', marginLeft:150}}>
                                    <Text style={{color:'green', fontWeight:'bold', fontSize:15}}>${props.route.params.wager}</Text>
</View>
                      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={styles.switchStyle}
      /> 
                  
                    
                    </View>
                    <View style={{justifyContent: 'flex-start'}}>
                    <Image
                        style={styles.postHeaderImage}
                        source={{
                          uri: props.route.params.userRiskerPPUrl
                        }}
                      />
                      {props.route.params.userRisker.name === props.route.params.myName ?
                      <Switch
                      trackColor={{false: '#767577', true: '#81b0ff'}}
                      thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={toggleSwitch2}
                      value={isEnabled2}
                      style={styles.switchStyle}
              
                    />
                    :
                    <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch2}
        value={isEnabled2}
        disabled
        style={styles.switchStyle}

      />
      
                    
                    
                    }
                    {/* <View style={{ alignItems: 'center', marginTop: 50 }}>
    <Image
      source={require('../../assets/handshake.webp')} // Replace with actual path
      style={{ width: 50, height: 50 }}
    />
  </View> */}
                     
                      
            </View>

         
        
            

      
                    
                    
            </View>
            
            
            
            
            
            
                
        </ScrollView>
    )


};


  export default PrePartyScreen;

  const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width:12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  thumbCentered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingVertical:80,
    flexDirection:'row',
    marginTop:80,

   
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
   
  }, 
  thumbTextCentered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingVertical:80,
    flexDirection:'row',
    marginTop:-150,

   
   
  }, 
  thumbCenteredOne: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingVertical:80,
    marginTop:80,
    flexDirection:'row',
   
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
   
  }, 
  title: { 
    fontSize: 18, 
    marginVertical: 2, 
  }, 
  subtitle: { 
    fontSize: 14, 
    color: "#888", 
  }, 
  postHeaderImageWrapper: {
    // borderColor: "#BE0000",
    padding: moderateScale(1, 0.1),
    flexDirection:'row',
    
    justifyContent: "center",
    alignItems: "center",
  },
  postHeaderImage: {
    width: moderateScale(130, 0.1),
    height: moderateScale(130, 0.1),
    borderRadius: 100,
    marginRight:20,
    marginTop: 30


    // borderColor: "#BE0000",
  },
  switchStyle : {
    // transform: [{ rotate: '270deg'}],
    marginTop: 130,
    marginLeft:20,
    transform: [{ scaleX: 3 }, { scaleY: 5 },{ rotate: '270deg'} ]
  }
});