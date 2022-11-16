import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, SafeAreaView, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph } from 'react-native-paper';
import Toast from 'react-native-toast-message'

import { getAllRewards } from '../API/rewards';
import { getUserByUid, updateUser } from '../API/users';
import { AuthContext } from '../navigation/AuthProvider';
import { checkConnected } from '../constants/connection';
import NoConnection from '../components/NoConnection';
import FormButton from '../components/FormButton';

export default function Reward({navigation}) {
  const [connected, setConnected] = useState(false)
  const {user, logout} = useContext(AuthContext)
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadedRewards, setLoadedRewards] = useState([])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData(){
        checkConnected().then(async res => {
          setConnected(res)
          if(res){
            setLoading(true)
            const response = await getAllRewards()
            setLoadedRewards(response)
            const response2 = await getUserByUid(user.uid) 
            setUserData(response2)
            setLoading(false)
          }
        })

    }  
      fetchData()   
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;  
    })       
  }, [navigation]) 
  const handleSubmit = async (userPoint, rewardPoint) => {
    if(userPoint < rewardPoint){
      Toast.show({
        type:'error',
        text1:"You don't have enough points to redeem!"
      })
      return;
    }
    else if(userPoint >= rewardPoint){
      setLoading(true)
      await updateUser(
        userData.id,
        userData.username,
        userData.uid,
        userData.email,
        userData.password,
        userData.profileImageUrl,
        userData.biodata,
        userData.loginMethod,
        userPoint - rewardPoint
      ).then(() =>{
        Toast.show({
          type:'success',
          text1:"Reward redeemed!"
        })
        navigation.navigate("Home")
        setLoading(false)
      })

    }
  }
  return (
    connected ? (
       user != null ? 
       loading ? <View style={styles.container}><ActivityIndicator size="large" /></View> :
       (
        <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Reedemable Rewards</Text>
        <Text style={styles.text}>Points Left: {userData != null ? userData.point : null}</Text>
        <FlatList 
          style={{width:'100%'}}
          data={loadedRewards}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
              <View style={styles.flatView}>
              <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Caution",
                      "Are you sure you want to redeem this reward with your points?",
                      [
                        {
                          text: "No",
                          onPress: () => {return;},
                          style: "cancel"
                        },
                        { text: "Yes", onPress: () => handleSubmit(userData.point, item.point) }
                      ]
                    )
                  }}
              >
                <Card>
                  {/* <Card.Title title={item.foodName} subtitle={item.foodPrice} /> */}
                  <Card.Cover 
                    source={{uri: item.imageUrl}}
                  />
                  <Card.Content>
                    <Title>{item.name}</Title>
                    <Paragraph style={{marginBottom: 10}}>{item.description}</Paragraph>
                    <Paragraph style={{fontWeight: 'bold', fontSize:20}}>{item.point} Points</Paragraph>
                  </Card.Content>
                </Card>
                  {/* <Text style={styles.name}>{item.foodName}</Text>
                  <Text style={styles.name}>RM{item.foodPrice}</Text> */}
              </TouchableOpacity>
              </View>
          )}
          keyExtractor={item => item.id}
        /> 
        <Ionicons style={styles.profileIcon} name="person-circle-outline" onPress={() => {navigation.navigate("Profile")}} size={40}/>
        </SafeAreaView>) : <View style={styles.container}>
                <Image
                    source={require('../assets/reward-icon.png')}
                    style={styles.logo}
                />
                <Text style={styles.text}>Log in or create an account to start earning points for exclusive rewards!</Text>
                <FormButton
                    buttonTitle="Login"
                    onPress={() => navigation.navigate('LogIn')}
                />
            </View>
    ) :  <NoConnection />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 70
  },
  flatViewContainer:{
    flex: 1,
    padding: 20,
    paddingTop:50,
    width: '100%',
    maxWidth: 340,
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatView: {
    justifyContent: 'center',
    paddingTop: 30,
    borderRadius: 2,
  },
  profileIcon:{
    position: 'absolute',
    top:30,
    right:5
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
  text: {
    fontFamily: 'Kufam-SemiBoldItalic',
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  }
})