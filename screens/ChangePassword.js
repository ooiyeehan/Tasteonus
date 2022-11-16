import React, {useEffect, useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message'


import { getUserByUid, updateUser } from '../API/users';
import {AuthContext} from '../navigation/AuthProvider';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';



const ChangePassword = ({navigation}) => {
  const {user, changePassword, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchData(){
      getUserByUid(user.uid).then(item => {       
        setUserData(item)   
       })
    }
    fetchData()    
  }, [])


  const handleUpdate = async () => {

    if(userData != null){
        if( oldPassword == "" || newPassword == "" || confirmPassword == ""){
            Toast.show({
                type:'error',
                text1:'Please insert all the details!'
            })
            return;
        }
        else if(newPassword != confirmPassword ){
            Toast.show({
                type:'error',
                text1:'New Passwords do not match!'
            })
            return;
        }
        else if(oldPassword != userData.password){
            Toast.show({
                type:'error',
                text1:'Old Password is incorrect!'
            })
            return;
        }
        else if(newPassword.length < 6 ){
            Toast.show({
                type:'error',
                text1:'Weak Password',
                text2: 'Password must be at least 6 characters or longer!'
            })
            return;
        }
        changePassword(oldPassword, newPassword)
        await updateUser(
            userData.id,
            userData.username,
            userData.uid,
            userData.email,
            newPassword,
            userData.profileImageUrl,
            userData.biodata,
            userData.loginMethod,
            userData.point
        )
        Alert.alert("Updated", "Please login again with your new credentials")
        logout(navigation)
    }  

  };

  return (
    <View style={styles.container}>
        <FormInput
            labelValue={oldPassword}
            onChangeText={(userPassword) => setOldPassword(userPassword)}
            placeholderText="Old Password"
            iconType="lock"
            secureTextEntry={true}
        />

        <FormInput
            labelValue={newPassword}
            onChangeText={(userPassword) => setNewPassword(userPassword)}
            placeholderText="New Password"
            iconType="lock"
            secureTextEntry={true}
        />

        <FormInput
            labelValue={confirmPassword}
            onChangeText={(userPassword) => setConfirmPassword(userPassword)}
            placeholderText="Confirm New Password"
            iconType="lock"
            secureTextEntry={true}
        />

        <FormButton buttonTitle="Update" onPress={() => handleUpdate(navigation)} />
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f9fafd',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    marginTop: 10,
  },
  panel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    width: '100%',
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.4,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#2e64e5',
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#333333',
  },
  noEditTextInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#333333',
    fontSize: 10
  },
  multiLineTextInput:{
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#333333',
    height: 400
  }
});
