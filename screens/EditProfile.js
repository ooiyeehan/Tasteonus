import React, {useEffect, useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import storage from '@react-native-firebase/storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
// import ImagePicker from 'react-native-image-crop-picker';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { getUserByUid, updateUser } from '../API/users';
import {AuthContext} from '../navigation/AuthProvider';
import FormButton from '../components/FormButton';




const EditProfile = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false)
  bs = React.createRef();
  fall = new Animated.Value(1);
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

//   const handleUpdate = async(navigation) => {
//         if(userData != null){
//             if(userData.username == ""){
//                 Toast.show({
//                     type:'error',
//                     text1:'Username must not be empty!'
//                 })
//                 return;
//             }
//             else {
//                 let imgUrl = await uploadImage().then(async () => {
//                     if( imgUrl == null && userData.profileImageUrl) {
//                         imgUrl = userData.profileImageUrl;
//                         }
//                         console.log(userData)
//                         await updateUser(
//                             userData.id,
//                             userData.username, 
//                             userData.uid, 
//                             userData.email, 
//                             userData.password,
//                             imgUrl,
//                             userData.biodata,
//                             userData.loginMethod,
//                             userData.point
//                         )
//                 });             
//             }
//         }


//   }

  const handleUpdate = async () => {

    if(userData != null){

        if(userData.username == ""){
            Toast.show({
                type:'error',
                text1:'Username must not be empty!'
            })
            return;
        }
        else if( image == null ) { 
            if(userData.profileImageUrl != null){
                await updateUser(
                    userData.id,
                    userData.username, 
                    userData.uid, 
                    userData.email, 
                    userData.password,
                    userData.profileImageUrl,
                    userData.biodata,
                    userData.loginMethod,
                    userData.point
                )
                Toast.show({
                  type:'success',
                  text1:'Profile Updated!'
              })
                navigation.navigate("Profile");
            }
            else{
                await updateUser(
                    userData.id,
                    userData.username, 
                    userData.uid, 
                    userData.email, 
                    userData.password,
                    null,
                    userData.biodata,
                    userData.loginMethod,
                    userData.point
                )
                Toast.show({
                  type:'success',
                  text1:'Profile Updated!'
              })
                navigation.navigate("Profile");
            }      
            
        }
        else {
            const uploadUri = image;
            let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
        
            // Add timestamp to File Name
            const extension = filename.split('.').pop(); 
            const name = filename.split('.').slice(0, -1).join('.');
            filename = name + Date.now() + '.' + extension;
        
            setUploading(true);
            setTransferred(0);
        
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.log(e);
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uploadUri, true);
                xhr.send(null);
            });
        
            const storage = getStorage();
            const storageRef = ref(storage, `photos/users/${filename}`);
            // Create file metadata including the content type
            const metadata = {
                contentType: 'image/jpeg',
              };
            const task = uploadBytesResumable(storageRef, blob, metadata);
        
            try {
                 // Listen for state changes, errors, and completion of the upload.
                task.on('state_changed',(snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                    break;
                    case 'running':
                        console.log('Upload is running');
                    break;
                    }
                },
                (error) => {
                    this.setState({ isLoading: false })
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                    case 'storage/unauthorized':
                        console.log("User doesn't have permission to access the object");
                    break;
                    case 'storage/canceled':
                        console.log("User canceled the upload");
                    break;
                    case 'storage/unknown':
                        console.log("Unknown error occurred, inspect error.serverResponse");
                    break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(task.snapshot.ref).then(async (downloadURL) => {
                        console.log('File available at', downloadURL);
                        //perform your task
                        setUploading(false);
                        setImage(null);
                        await updateUser(
                            userData.id,
                            userData.username, 
                            userData.uid, 
                            userData.email, 
                            userData.password,
                            downloadURL,
                            userData.biodata,
                            userData.loginMethod,
                            userData.point
                        )
                        Toast.show({
                          type:'success',
                          text1:'Profile Updated!'
                      })
                        navigation.navigate("Profile");
                    });
                });
              
            } catch (e) {
              console.log(e);
              return null;
            }      
        }
    }  

  };

  const takePhotoFromCamera = () => {
    ImagePicker.launchCameraAsync({
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 300,
      cropping: true,
      compressImageQuality: 0.7,
    }).then((image) => {
      console.log(image);
      const imageUri = image.uri;
      setImage(imageUri);
      bs.current.snapTo(1);
    });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.launchImageLibraryAsync({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    }).then((image) => {
    //   console.log(image);
      const imageUri = image.uri;
      setImage(imageUri);
      console.log(image)
      bs.current.snapTo(1);
    });
  };

  renderInner = () => (
    <View style={styles.panel}>
      <View style={{alignItems: 'center'}}>
        <Text style={styles.panelTitle}>Upload Photo</Text>
        <Text style={styles.panelSubtitle}>Choose Your Profile Picture</Text>
      </View>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={takePhotoFromCamera}>
        <Text style={styles.panelButtonTitle}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={choosePhotoFromLibrary}>
        <Text style={styles.panelButtonTitle}>Choose From Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={() => bs.current.snapTo(1)}>
        <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <View style={styles.container}>
      <BottomSheet
        ref={bs}
        snapPoints={[330, -5]}
        renderContent={renderInner}
        renderHeader={renderHeader}
        initialSnap={1}
        callbackNode={fall}
        enabledGestureInteraction={true}
      />
      <Animated.View
        style={{
          margin: 20,
          opacity: Animated.add(0.1, Animated.multiply(fall, 1.0)),
        }}>
        <View style={{alignItems: 'center'}}>
        
          <TouchableOpacity onPress={() => userData != null 
                                        ? userData.loginMethod != "Facebook Login" 
                                        ? bs.current.snapTo(0)
                                        : {}
                                        : bs.current.snapTo(0)}>
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ImageBackground
                source={
                    image ? //if image exists
                    {uri: image} : // use image, else 
                    userData != null ?  //if userdata not null
                    userData.profileImageUrl == null ? //if profileimageurl is null
                    require('../assets/user-default-icon.png') : //use default icon, else
                    userData.profileImageUrl != "" ? //if profileimageurl not blank
                    {uri: userData.profileImageUrl}  : //uri = profileimageurl, else of (if profileimageurl not blank)
                    require('../assets/user-default-icon.png') : //use default icon, else of (if userdata not null)
                    require('../assets/user-default-icon.png') } //use default icon
                style={{height: 100, width: 100}}
                imageStyle={{borderRadius: 15}}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={35}
                    color="#fff"
                    style={{
                      opacity:  userData != null ? 
                                userData.loginMethod != "Facebook Login" ? 
                                0.7 : 
                                0 : 
                                0.7,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#fff',
                      borderRadius: 10,
                    }}
                  />
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <Text style={{marginTop: 10, fontSize: 18, fontWeight: 'bold'}}>
            {userData ? userData.username : ''} 
          </Text>
        </View>

        <View style={styles.action}>
          <FontAwesome name="user-o" color="#333333" size={20} />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#666666"
            autoCorrect={false}
            value={userData ? userData.username : ''}
            onChangeText={(txt) => setUserData({...userData, username: txt})}
            style={styles.textInput}
          />
        </View>
        <View style={styles.action}>
          <FontAwesome name="user-o" color="#333333" size={20} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#808080"
            value={userData ? userData.email + ' (Not Editable)' : ''}
            onChangeText={(txt) => setUserData({...userData, email: txt})}
            autoCorrect={false}
            style={styles.noEditTextInput}
            editable={false}
          />
        </View>
        <View style={styles.action}>
          <Ionicons name="ios-clipboard-outline" color="#333333" size={20} />
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="About Me (Optional)"
            placeholderTextColor="#666666"
            value={userData ? userData.biodata : ''}
            onChangeText={(txt) => setUserData({...userData, biodata: txt})}
            autoCorrect={true}
            style={[styles.multiLineTextInput, {height: 200}]}
          />
        </View>

        <FormButton buttonTitle="Update" onPress={() => handleUpdate(navigation)} /> 
        <FormButton 
          buttonTitle="Change Password"
          onPress={() => 
            userData != null ? 
            userData.loginMethod != "Facebook Login" ? 
            navigation.navigate("ChangePassword") :
            Alert.alert("Can't do that!", "You logged in through Facebook, so changing password is not required."): 
            Alert.alert("Can't do that!", "You logged in through Facebook, so changing password is not required.")} /> 
        
      </Animated.View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
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
