import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native'
import React, {useContext, useState, useEffect} from 'react'
import { TextInput as Input } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
// import ImagePicker from 'react-native-image-crop-picker';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import {AuthContext} from '../navigation/AuthProvider';
import { getUserByUid, updateUser } from '../API/users';
import FormButton from '../components/FormButton';
import { createNewRecipe } from '../API/recipes';

const AddRecipe = ({navigation}) => {
    const {user} = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [recipeName, setRecipeName] = useState("")
    const [ingredient, setIngredient] = useState("")
    const [instruction, setInstruction] = useState("")
    const [image, setImage] = useState(null)
    const [video, setVideo] = useState(null)
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);

    bs = React.createRef()
    fall = new Animated.Value(1);

    useEffect(() => {
        async function fetchData(){
          getUserByUid(user.uid).then(item => {       
            setUserData(item)   
           })
        }
        fetchData()    
      }, [])

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
          console.log(imageUri);
          bs.current.snapTo(1);
        });
      };
      const chooseVideoFromLibrary = () => {
        ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Videos',
          width: 300,
          height: 300,
          cropping: true,
          compressImageQuality: 0.7,
        }).then((video) => {
        //   console.log(image);
          const videoUri = video.uri;
          setVideo(videoUri);
          console.log(videoUri);
        });
      };
      const handleSubmit = async (userId) => {
 
        if(recipeName == "" || ingredient == "" || instruction == "" ){
            Toast.show({
                type:'error',
                text1:'Please fill in all the details!'
            })
            return;
        }
        else if( image == null ) { 
            Toast.show({
                type:'error',
                text1:'An image of recipe is required!'
            })
            return;         
        }
        else {
            const imageUploadUri = image;
            let filename = imageUploadUri.substring(imageUploadUri.lastIndexOf('/') + 1);
        
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
                xhr.open("GET", imageUploadUri, true);
                xhr.send(null);
            });
        
            const storage = getStorage();
            const storageRef = ref(storage, `photos/recipes/${filename}`);
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
                    getDownloadURL(task.snapshot.ref).then(async (imageDownloadURL) => {
                        console.log('File available at', imageDownloadURL);
                        //perform your task
                        setUploading(false);
                        setImage(null);
                        if(video == null){
                            await createNewRecipe(
                                recipeName,
                                ingredient,
                                instruction,
                                imageDownloadURL,
                                null,
                                userData.id,
                                userData.uid
                            ).then(async () => {
                                await updateUser(
                                    userData.id,
                                    userData.username,
                                    userData.uid,
                                    userData.email,
                                    userData.password,
                                    userData.profileImageUrl,
                                    userData.biodata,
                                    userData.loginMethod,
                                    userData.point + 20
                                ).then(() => {
                                    Toast.show({
                                        type:'success',
                                        text1:'Points earned! - Add Recipe',
                                        text2: 'Recipe added succesfully and you have earned 20 points!'
                                    })
                                    navigation.navigate("MyRecipe");
                                })
                                
                            }) 
                            
                            
                        }
                        else{
                            const videoUploadUri = video;
                            let filename = videoUploadUri.substring(videoUploadUri.lastIndexOf('/') + 1);
                        
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
                                xhr.open("GET", videoUploadUri, true);
                                xhr.send(null);
                            });
                        
                            const storage = getStorage();
                            const storageRef = ref(storage, `videos/${filename}`);
                            // Create file metadata including the content type
                            const metadata = {
                                contentType: 'video/mp4',
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
                                   getDownloadURL(task.snapshot.ref).then(async (videoDownloadURL) => {
                                       console.log('File available at', videoDownloadURL);
                                       //perform your task
                                       setUploading(false);
                                       setVideo(null);
                                       await createNewRecipe(
                                           recipeName,
                                           ingredient,
                                           instruction,
                                           imageDownloadURL,
                                           videoDownloadURL,
                                           userData.id,
                                           userData.uid
                                       ).then(async () => {
                                        await updateUser(
                                            userData.id,
                                            userData.username,
                                            userData.uid,
                                            userData.email,
                                            userData.password,
                                            userData.profileImageUrl,
                                            userData.biodata,
                                            userData.loginMethod,
                                            userData.point + 20
                                        ).then(() => {
                                            Toast.show({
                                                type:'success',
                                                text1:'Points earned! - Add Recipe',
                                                text2: 'Recipe added succesfully and you have earned 20 points!'
                                            })
                                            navigation.navigate("MyRecipe");
                                        })
                                        
                                    }) 
                                       
                                   });
                               });
                             
                           } catch (e) {
                             console.log(e);
                             return null;
                           } 
                        }
                        
                    });
                });
                
            } catch (e) {
                console.log(e);
                return null;
            }      
        }
        
    
      };    
      renderInner = () => (
        <View style={styles.panel}>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.panelTitle}>Upload Photo</Text>
            <Text style={styles.panelSubtitle}>Choose Your Recipe Photo</Text>
          </View>
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
        <SafeAreaView style={styles.container}>
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
            <ScrollView showsVerticalScrollIndicator={false} >             
                    <Text style={styles.labelText}>Recipe Name</Text>
                    <Input
                        style={styles.input}
                        selectionColor="#560CCE"
                        underlineColor="transparent"
                        mode="outlined"
                        placeholder='Give your recipe a name'
                        value={recipeName}
                        onChangeText={(value)=> setRecipeName(value)}
                    />
                    
                    <TouchableOpacity 
                        style={{marginBottom: 20, alignItems: 'center', justifyContent: 'center'}} 
                        onPress={() => {bs.current.snapTo(0)}}>
                       <View style={{
                                height: 200,
                                width: "100%",
                                borderRadius: 15,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <ImageBackground
                                source={image ? {uri: image} : require('../assets/grey-background.png')}
                                style={{height: 200, width: "100%"}}
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
                                        opacity: 0.7,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                        borderRadius: 10,
                                        }}
                                    />
                                    <Text style={{
                                            fontWeight: 'bold', 
                                            fontSize: 20, 
                                            opacity: image != null ? 0 : 1}}>Add Photo</Text>
                                </View>
                            </ImageBackground>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{marginBottom: 20, alignItems: 'center', justifyContent: 'center'}} 
                        onPress={() => {chooseVideoFromLibrary()}}>
                       <View style={{
                                height: 200,
                                width: "100%",
                                borderRadius: 15,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <ImageBackground
                                source={video ? {uri: video} : require('../assets/grey-background.png')}
                                style={{height: 200, width: "100%"}}
                                imageStyle={{borderRadius: 15}}>
                                <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <MaterialCommunityIcons
                                        name="video"
                                        size={35}
                                        color="#fff"
                                        style={{
                                        opacity: 0.7,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                        borderRadius: 10,
                                        }}
                                    />
                                    <Text 
                                        style={{
                                            fontWeight: 'bold', 
                                            fontSize: 20, 
                                            opacity: video != null ? 0 : 1}}>Add Video (Optional)</Text>
                                </View>
                            </ImageBackground>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.labelText}>Ingredients</Text>
                    <Input
                        multiline
                        numberOfLines={10}
                        style={styles.input}
                        selectionColor="#560CCE"
                        underlineColor="transparent"
                        mode="outlined"
                        placeholder='Ingredients used for preparing the recipe'
                        value={ingredient}
                        onChangeText={(value)=> setIngredient(value)}
                    />
                    <Text style={styles.labelText}>Instructions</Text>
                    <Input
                        multiline
                        numberOfLines={10}
                        style={styles.input}
                        selectionColor="#560CCE"
                        underlineColor="transparent"
                        mode="outlined"
                        placeholder='Instructions for preparing the recipe'
                        value={instruction}
                        onChangeText={(value)=> setInstruction(value)}
                    />
                    <FormButton buttonTitle={!uploading ? "Add Recipe" : <ActivityIndicator />} onPress={() => {handleSubmit()}} />
            </ScrollView>
        </Animated.View>
        </SafeAreaView>
    )
}

export default AddRecipe

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
        // paddingTop: StatusBar.currentHeight
      },
    input: {
        backgroundColor: "#fff",
        marginBottom: 20
    },
    labelText: {
        fontWeight: 'bold',
        fontSize: 20
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
})