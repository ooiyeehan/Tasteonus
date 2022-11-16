import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';

import { getUserByUid } from '../API/users';
import NoConnection from '../components/NoConnection';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider';

const Profile = ({navigation}) => {
  const {user, logout} = useContext(AuthContext);
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchData(){
      setLoading(true)
      getUserByUid(user.uid).then(item => {       
        setUserData(item)
        setLoading(false)   
       })
    }
    fetchData()    
  }, [])

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
        showsVerticalScrollIndicator={false}>
        <Image
          style={styles.userImg}
          source={userData != null ? 
            userData.profileImageUrl == null ?
            require('../assets/user-default-icon.png') :
            userData.profileImageUrl != ""  ? 
            {uri: userData.profileImageUrl}  : 
            require('../assets/user-default-icon.png') : 
            require('../assets/user-default-icon.png') }
        />
        <Text style={styles.userName}>{userData != null ? userData.username : ""}</Text>

        <Text style={styles.aboutUser}>
        {userData != null ? userData.biodata != null ? userData.biodata : "" : ""}
        </Text>
        <View style={styles.userBtnWrapper}>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate('EditProfile');
                }}>
                <Text style={styles.userBtnTxt}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => logout(navigation)}>
                <Text style={styles.userBtnTxt}>Logout</Text>
              </TouchableOpacity>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{userData != null ? userData.point : "0"}</Text>
            <Text style={styles.userInfoSubTitle}>Points</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
