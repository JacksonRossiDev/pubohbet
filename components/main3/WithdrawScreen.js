// import {View, Text, Image, StyleSheet, TextInput,} from "react-native"
// import React, {useEffect, useLayoutEffect, useState} from "react";
// import { ScrollView,  TouchableOpacity, } from "react-native-gesture-handler";
// import { useRoute } from "@react-navigation/native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { moderateScale } from "react-native-size-matters";
// import { designHeightToPx } from "../utils/dimensions";
// import { SafeAreaView } from "react-native-safe-area-context";
// import firebase from "firebase/compat/app";


// require("firebase/firestore");


// const YoureGoingScreen = (props) => {    
// const delay = ms => new Promise(res => setTimeout(res, ms));
// const [user, setUser] = useState(null);
// const [stripeEmail, setStripeEmail] = useState("");



    
 
//     return (
//         <SafeAreaView style={styles.safe}>
            
//             <View style={styles.container}>
//             <View style={styles.totalsContainer}>
//                 <Text style={styles.userBalance}>Credit Balance</Text>
//                 <Text style={styles.balance}>{user?.creditBalance}</Text>
//                 <Text style={styles.userBalance}>Withdrawable Balance</Text>
//                 <Text style={styles.balance}>{user?.withdrawBalance}</Text>
//                 <TextInput
//                 style={styles.stripeEmail}
//                 placeholder="Enter your Stripe Email"
//                 value={stripeEmail}
//                 multiline
//                 onChangeText={setStripeEmail}
//               />
//             </View>
            
            
//             <View style={styles.followBtnWrapper}>
//                 <TouchableOpacity
//                   activeOpacity={0.8}
//                   style={styles.followBtn}
//                   onPress={() => props.navigation.navigate('Home')}
//                 >
//                   <Text style={styles.followBtnLabel}>Back</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   activeOpacity={0.8}
//                   style={styles.messageBtn}
//                   onPress={() => setToZero()}
//                 >
//                   <Text style={styles.followBtnLabel}>Withdrawal </Text>
//                 </TouchableOpacity>

               
//               </View>
//               </View>
            
            
            
            
                
//         </SafeAreaView>
//     )


// };

// export default YoureGoingScreen



import {ScrollView, Text, TouchableOpacity, StyleSheet,View,TextInput, Image, Alert} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import { moderateScale } from "react-native-size-matters";
 import { designHeightToPx } from "../utils/dimensions";


const Paywall = (props) => {
    const [currentLoggedinUser, setCurrentLoggedinUser] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigation();
    const [stripeEmail, setStripeEmail] = useState("");


const curretCreditBalance = Number(user?.creditBalance)
const withdrawableBalance = Number(user?.withdrawBalance)


console.log(typeof curretCreditBalance )
console.log(typeof withdrawableBalance )


const setToZero = () => {
    firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser?.uid)
        .set({withdrawBalance: 0, creditBalance:curretCreditBalance- withdrawableBalance}, { merge: true } )
        .then(() => {
            firebase
              .firestore()
              .collection("withdrawals")
              // @ts-ignore
              .doc(firebase.auth().currentUser.uid)
              .set({
                'withdrawBalance': withdrawableBalance,
                
                
              });
          })
          .then(props.navigation.navigate('Home'))
    
    };

useEffect(() => {
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser?.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUser(snapshot.data());
          } else {
            console.log("does not exist3");
          }
        });
      

    }
  , [firebase.auth().currentUser?.uid]);


  console.log('USER--->',user?.withdrawBalance)
    
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

    console.log('CLIU',currentLoggedinUser?.creditBalance)

    const oneHundredPurchaseBalance = currentLoggedinUser?.creditBalance + 100
    const sevenFiftyPurchaseBalance = currentLoggedinUser?.creditBalance + 750
    const  oneThousandPurchaseBalance = currentLoggedinUser?.creditBalance + 1000

    console.log(oneHundredPurchaseBalance)
    console.log(sevenFiftyPurchaseBalance)
    console.log(oneThousandPurchaseBalance)
    
    
    
    



   
    return (


        <ScrollView className="bg-white ">
            
            
            <View className="m-10 space-y-2">
            </View>
            <TouchableOpacity onPress={() => navigate.goBack(null)} className="absolute top-0 right-0 p-5">
            <MaterialCommunityIcons name="alpha-x-circle-outline" size={32} color="#36d8ff" />
            </TouchableOpacity>
             <View className='items-center'>
             <Text className="text-ohbet-blue font-bold pb-10 text-3xl">
                        Withdrawal your Credits
                    </Text>
                {/* <Image style = {{width: 300, marginTop:-100,
    height: 300,}}source={require('../../assets/tarpsLogo.png')} />  */}
            </View> 




           <View className="space-y-5 px-10 pt-5 pb-5">
            <View className="flex-row space-x-10 items-center">
            <MaterialCommunityIcons name="head-question" size={32} color="#36d8ff" />
                <View className="flex-1">
                    <Text className="text-ohbet-blue font-bold text-lg">
                        How Does it Work?
                    </Text>
                    <Text className="text-ohbet-blue text-sm font-extralight">
                        A withdrawal is a transfer of your OhBet credits to USD
                    </Text>
                </View>
            </View>
            <View className="flex-row space-x-10 items-center">
            <MaterialCommunityIcons name="security" size={32} color="#36d8ff" />
                <View className="flex-1">
                    <Text className="text-ohbet-blue font-bold text-lg">
                        Is it Secure?
                    </Text>
                    <Text className="text-ohbet-blue text-sm font-extralight">
                    Credits are fully secure transaction tokens and prevent 100% of fraud
                    </Text>
                </View>
            </View>
            <View className="flex-row space-x-10 items-center mb-20">
            <MaterialCommunityIcons name="lightning-bolt-outline" size={32} color="#36d8ff" />
                <View className="flex-1">
                    <Text   className="  text-ohbet-blue font-bold text-lg">
                        How Long Does it Take?
                    </Text>
                    
                    <Text className="text-ohbet-blue text-sm font-extralight">
                        The typical withdrawal takes 2-3 business days
                    </Text>
                </View>
            </View>
            <View className="flex-row space-x-10 items-center mb-2">
            <MaterialCommunityIcons name="cash-fast" size={32} color="#36d8ff" />
                <View className="flex-1">
                    <Text   className="  text-ohbet-blue font-bold text-">
                        Cash Available to Withdrawal : ${user?.withdrawBalance}
                    </Text>
                    
                    
                </View>
            </View>
            <View className="flex-row space-x-10 items-center mb-10">
            <MaterialCommunityIcons name="email" size={32} color="#36d8ff" />
                <View className="flex-1">
                    <Text   className="  text-ohbet-blue font-bold text-">
                        Stripe Email : {user?.email}
                    </Text>
                    
                    
                </View>
            </View>
            
           </View>
           {/* <View style={styles.totalsContainer}>
{/* //                 <Text style={styles.userBalance}>Credit Balance</Text>
//                 <Text style={styles.balance}>{user?.creditBalance}</Text>
//                 <Text style={styles.userBalance}>Withdrawable Balance</Text>
//                 <Text style={styles.balance}>{user?.withdrawBalance}</Text> */}
{/* //                 <TextInput
                style={styles.stripeEmail}
                placeholder="Enter your Stripe Email"
                value={stripeEmail}
                multiline
                onChangeText={setStripeEmail}
              />
            </View> */} 

           {/* Daily Subscribe */}

           






           {/* Monthly  Subscribe */}

           

           <TouchableOpacity 
            onPress={setToZero}
           className="items-center px-10 py-5 border-2 border-[#36d8ff] mx-10 rounded-full mt-2">
            <Text className="text-ohbet-blue text-md text-center font-bold mb-1">Cash Out ${user?.withdrawBalance}</Text>
            {/* <Text className="text-white">{currentOffering?.monthly?.product.priceString} / Month</Text> */}
           </TouchableOpacity>

           


           {/* Restore Purchases */}
        </ScrollView>
    )
}

export default Paywall

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:'#36d8ff',
    alignItems: "center",

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
  totalsContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: "#36d8ff",
    alignItems: "center",
    marginTop:250
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: moderateScale(20, 0.1),
    backgroundColor: "#36d8ff",
  },
  wrapper: {
    width: "100%",
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
  userBalance: {
    color:'white',
    fontSize:40
  },
  balance: {
    color:'white',
    fontSize:40
  },
  stripeEmail: {
    color:'white',
    fontSize:40,
    marginTop: 50
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