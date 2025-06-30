import {ScrollView, Text, TouchableOpacity, View, Image, Alert} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import useRevenueCat from "../../hooks/useRevenueCat";
import Purchases from "react-native-purchases";
import { useEffect, useState } from "react";
import firebase from "firebase/compat/app";



const Paywall = (props) => {
    const [currentLoggedinUser, setCurrentLoggedinUser] = useState(null);
    const navigate = useNavigation();
    const {currentOffering, customerInfo, isProMember} = useRevenueCat();


    
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
    const handleWeeklyPurchase = async () => {
        if(!currentOffering?.annual) return; 

        const purchaserInfo = await Purchases.purchasePackage(
            currentOffering.annual
        )

        console.log("Weekly sub active", purchaserInfo.customerInfo.entitlements.active)

        if (purchaserInfo.customerInfo.entitlements.active.Pro) {
            props.navigation.goBack();
        }
    }
    
    const handleMonthlyPurchase = async () => {
        if(!currentOffering?.monthly) return; 

        const purchaserInfo = await Purchases.purchasePackage(
            currentOffering.monthly
        )

        console.log("Monthly sub active", purchaserInfo.customerInfo.entitlements.active)

        if (purchaserInfo.customerInfo.entitlements.active.Pro) {
            props.navigation.goBack();
        }
    }

    const handle100Coins = async () => {

        try {

            const { customerInfo } = await Purchases.purchasePackage(currentOffering?.availablePackages[0]);
            if (
              typeof customerInfo.entitlements.active["coins"] !==
              "undefined"
            ) {
                firebase
                .firestore()
                .collection("users")
                .doc(firebase.auth().currentUser?.uid)
                .set({creditBalance: oneHundredPurchaseBalance}, { merge: true } );
            
            }
          } catch (e) {
            if (!e.userCancelled) {
              console.log(e);
            }          
    }
}
    const handle200Coins = async () => {

        try {

            const { customerInfo } = await Purchases.purchasePackage(currentOffering?.availablePackages[1]);
            if (
              typeof customerInfo.entitlements.active["CoinsPro"] !==
              "undefined"
            ) {
                firebase
                .firestore()
                .collection("users")
                .doc(firebase.auth().currentUser?.uid)
                .set({creditBalance: sevenFiftyPurchaseBalance}, { merge: true } );
            
            }
          } catch (e) {
            if (!e.userCancelled) {
              console.log(e);
            }          
    }
}
    const handle300Coins = async () => {

        try {

            const { customerInfo } = await Purchases.purchasePackage(currentOffering?.availablePackages[2]);
            if (
              typeof customerInfo.entitlements.active["CoinsElite"] !==
              "undefined"
            ) {
                firebase
                .firestore()
                .collection("users")
                .doc(firebase.auth().currentUser?.uid)
                .set({creditBalance: oneThousandPurchaseBalance}, { merge: true } );
            
            }
          } catch (e) {
            if (!e.userCancelled) {
              console.log(e);
            }          
    }
}



    const restorePurchases = async() => {
        const purchaserInfo = await Purchases.restorePurchases();       

        if (purchaserInfo.acttiveSubscriptions.length > 0) {
            Alert.alert("Success, Your purchases have been restred")
        } else {
            Alert.alert("Error","No Purchase to restore ")
        }
    }
    return (


        <ScrollView className="bg-white ">
            
            
            <View className="m-10 space-y-2">
            </View>
            <TouchableOpacity onPress={() => navigate.goBack(null)} className="absolute top-0 right-0 p-5">
            <MaterialCommunityIcons name="alpha-x-circle-outline" size={32} color="#6CB4EE" />
            </TouchableOpacity>
             <View className='items-center'>
             <Text className="text-ohbet-blue font-bold pb-10 text-3xl">
                        What are Credits? 
                    </Text>
                {/* <Image style = {{width: 300, marginTop:-100,
    height: 300,}}source={require('../../assets/tarpsLogo.png')} />  */}
            </View> 




           <View className="space-y-5 px-10 pt-5 pb-5">
            <View className="flex-row space-x-10 items-center">
            <MaterialCommunityIcons name="poker-chip" size={32} color="#6CB4EE" />
                <View className="flex-1">
                    <Text className="text-ohbet-blue font-bold text-lg">
                        Transferrable Credits
                    </Text>
                    <Text className="text-ohbet-blue text-sm font-extralight">
                        Allows for seamless transactions between all OhBet users
                    </Text>
                </View>
            </View>
            <View className="flex-row space-x-10 items-center">
            <MaterialCommunityIcons name="security" size={32} color="#6CB4EE" />
                <View className="flex-1">
                    <Text className="text-ohbet-blue font-bold text-lg">
                        Fully Secure
                    </Text>
                    <Text className="text-ohbet-blue text-sm font-extralight">
                    Credits are fully secure transaction tokens and prevent 100% of fraud
                    </Text>
                </View>
            </View>
            <View className="flex-row space-x-10 items-center mb-10">
            <MaterialCommunityIcons name="cash-fast" size={32} color="#6CB4EE" />
                <View className="flex-1">
                    <Text   className="  text-ohbet-blue font-bold text-lg">
                        Withdrawal for Cash
                    </Text>
                    <Text className="text-ohbet-blue text-sm font-extralight">
                        Convert your credits to cash at any time
                    </Text>
                </View>
            </View>
            
           </View>

           {/* Daily Subscribe */}

           






           {/* Monthly  Subscribe */}

           <TouchableOpacity 
            onPress={handle100Coins}
           className="items-center px-10 py-5 border-2 border-[#6CB4EE] mx-10 rounded-full mt-2">
            <Text className="text-ohbet-blue text-md text-center font-bold mb-1">100 Credits for $50</Text>
            {/* <Text className="text-white">{currentOffering?.monthly?.product.priceString} / Month</Text> */}
           </TouchableOpacity>

           <TouchableOpacity 
        onPress={handle200Coins}
           
        //    className="items-center px-10 py-5 bg-[#6CB4EE] mx-10 rounded-full">
           className="items-center px-10 py-5  bg-[#6CB4EE] mx-10 rounded-full mt-2">
            <Text className="text-white text-md text-center font-bold mb-1">750 Credits for $75</Text>
            {/* <Text className="text-white">{currentOffering?.weekly?.product.priceString} / week after</Text> */}
           </TouchableOpacity>

           <TouchableOpacity 
            onPress={handle300Coins}
           className="items-center px-10 py-5 border-2 border-[#6CB4EE] mx-10 rounded-full mt-2">
            <Text className="text-ohbet-blue text-md text-center font-bold mb-1">1000 Credits for $100</Text>
            {/* <Text className="text-white">{currentOffering?.monthly?.product.priceString} / Month</Text> */}
           </TouchableOpacity>

           <TouchableOpacity className="m-5" 
         onPress={restorePurchases}
        >
            <Text className="text-center text-[#6CB4EE]">Restore Purchases</Text>
           </TouchableOpacity>


           {/* Restore Purchases */}
        </ScrollView>
    )
}

export default Paywall