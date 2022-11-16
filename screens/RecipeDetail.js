import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, Image, Alert, FlatList } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { AntDesign, Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as SQLite from 'expo-sqlite'
import Toast from 'react-native-toast-message'


import { checkConnected } from '../constants/connection';
import NoConnection from '../components/NoConnection';
import { getFeedbacksByRecipeId } from '../API/feedbacks';
import { deleteRecipe, getRecipeById } from '../API/recipes'
import { getAllUsers, getUserByUid } from '../API/users';
import {AuthContext} from '../navigation/AuthProvider';

const RecipeDetail = ({route, navigation}) => {
  const {recipeId} = route.params
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState([])
  const [loadedRecipe, setLoadedRecipe] = useState({})
  const [savedRecipe, setSavedRecipe] = useState({})
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loadedFeedbacks, setLoadedFeedbacks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [rating, setRating] = useState([1,2,3,4,5])
  const [defaultRating, setDefaultRating] = useState(1)
  const [userFeedback, setUserFeedback] = useState([])

  const starImgCorner = '../assets/star_corner.png'
  const starImgFilled = '../assets/star_filled.png'

  const db = SQLite.openDatabase('TasteonusDB') // create new SQLite database, if the database doesn’t exists then a new one is created


  useEffect(() => {
    async function fetchData(){
      checkConnected().then(res => {
        setConnected(res)
        if(res){
          setLoading(true)
          getRecipeById(recipeId).then(async item => {       
            setLoadedRecipe(item)
            const response = await getFeedbacksByRecipeId(item.id)
            setLoadedFeedbacks(response)
            getUserByUid(item.uid).then(async item2 => {       
              setUserData(item2)
              const result = await getAllUsers()
              setAllUsers(result)
              getSavedData()
              setLoading(false)
              // console.log(allUsers)
              // for(const i=0; i<allUsers.length; i++){
              //   if(allUsers[i].id == loadedFeedbacks.userId){     
              //     setUserFeedback(oldArray => [...oldArray, {
              //       recipeId: loadedFeedbacks.recipeId,
              //       userId: allUsers[i].id,
              //       username: allUsers[i].username,
              //       profileImageUrl: allUsers[i].profileImageUrl,
              //       description: loadedFeedbacks.description,
              //       rating: loadedFeedbacks.rating
              //     }])               
              //   }
              // }
              // console.log(userFeedback)      
            })
           })  
        }
        getSavedData()
      })  
    }
    function getSavedData() {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM recipes WHERE recipeId="+recipeId+"",
          [],
          (tx, results) => {         
            setSavedRecipe(results.rows._array[0])           
          }
        )
      })
    }
    
      fetchData()
      

  }, [])
  const handleSave = async (id, name, ingredient, instruction, imageUrl, videoUrl) => {

      if(videoUrl != null){
        setSaveLoading(true)
        const imageUri = imageUrl
        let imageFileUri = FileSystem.documentDirectory + `${Date.now()}.jpg`;
        FileSystem.downloadAsync(imageUri, imageFileUri)
        .then(async () => {
            const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
            if(status === 'granted'){
              const asset = await MediaLibrary.createAssetAsync(imageFileUri)
              await MediaLibrary.createAlbumAsync("Tasteonus Photos", asset, false)
            }

          })
          .catch(error => {
            console.error(error);
          })

        const videoUri = videoUrl
        let videoFileUri = FileSystem.documentDirectory + `${Date.now()}.mp4`;
        await FileSystem.downloadAsync(videoUri, videoFileUri)
        .then(async () => {
            const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
            if(status === 'granted'){
              const asset = await MediaLibrary.createAssetAsync(videoFileUri)
              const album = await MediaLibrary.createAlbumAsync("Tasteonus Videos", asset, false)
            setSaveLoading(false)
            }
          })
          .catch(error => {
            console.error(error);
          })
        db.transaction((tx) =>{
          tx.executeSql(
            "INSERT INTO recipes (recipeId, name, ingredient, instruction, image, video) VALUES " +
            "("+id+", '"+name+"', '"+ingredient+"', '"+instruction+"', '"+imageFileUri+"', '"+videoFileUri+"' )"
          )
        })
        Toast.show({
          type:'success',
          text1:'Recipe Saved!'
        })
      }
      else if (videoUrl == null){
        setSaveLoading(true)
        const imageUri = imageUrl
        let imageFileUri = FileSystem.documentDirectory + `${Date.now()}.jpg`;
        FileSystem.downloadAsync(imageUri, imageFileUri)
        .then(async () => {
            const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
            if(status === 'granted'){
              const asset = await MediaLibrary.createAssetAsync(imageFileUri)
              await MediaLibrary.createAlbumAsync("Tasteonus Photos", asset, false)
             
            }
            setSaveLoading(false)
          })
          .catch(error => {
            console.error(error);
          })
          db.transaction((tx) =>{
            tx.executeSql(
              "INSERT INTO recipes (recipeId, name, ingredient, instruction, image, video) VALUES " +
              "("+id+", '"+name+"', '"+ingredient+"', '"+instruction+"', '"+imageFileUri+"', '"+videoUrl+"' )"
            )
          })
          Toast.show({
            type:'success',
            text1:'Recipe Saved!'
          }) 
      }

  }

  const handleRemove = async(id, image, video) => {
    
    if(video != null){
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM recipes WHERE id="+id+"",
          [],
          async () => {
            setSaveLoading(true) 
            const {imageUri} = await FileSystem.getInfoAsync(`${image}`)
            const {videoUri} = await FileSystem.getInfoAsync(`${video}`)
            FileSystem.deleteAsync(imageUri)
            FileSystem.deleteAsync(videoUri)
            setSaveLoading(false) 
            Toast.show({
              type:'success',
              text1:'Recipe Removed from Saved!'
            })
           },
          error => {console.log(error)}
        )
      })

    }
    else if(video == null){

      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM recipes WHERE id="+id+"",
          [],
          async () => {
            setSaveLoading(true) 
            const {imageUri} = await FileSystem.getInfoAsync(`${image}`)
            FileSystem.deleteAsync(imageUri)
            setSaveLoading(false) 
            Toast.show({
              type:'success',
              text1:'Recipe Removed from Saved!'
            })
           },
          error => {console.log(error)}
        )
      })
    }
  }

  const handleDelete = async(id, navigation) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM recipes WHERE id="+id+"",
        [],
        async () => {
          deleteRecipe(id)
          navigation.navigate("Home");
         },
        error => {console.log(error)}
      )
    })
   
  }

  const listEmptyComponent = () => {
    return (
        <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={styles.itemText}>No Comments Found!</Text>
        </View>
    )
  }

  return (
    connected ? (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
          (<SafeAreaView style={styles.container}>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Text style={styles.labelText}>Created by: {userData.username}
                
              </Text>
              {userData != null && user != null ? 
              user.uid == loadedRecipe.uid ?
              (<View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => {
                navigation.navigate('EditRecipe', {recipeId: loadedRecipe.id});
              }}>
                  <Feather name="edit-2" size={30}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  "Warning",
                  "Are you sure you want to delete this recipe? This action is irreversible!",
                  [
                    {
                      text: "Cancel",
                      onPress: () => {return;},
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => handleDelete(loadedRecipe.id, navigation) }
                  ]
                )
              }}>
                  <AntDesign name="delete" size={30}/>
              </TouchableOpacity>
              </View>
              ) : saveLoading ? <ActivityIndicator size="large" /> :
              savedRecipe != null ? savedRecipe.recipeId != loadedRecipe.id ?
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity 
                onPress={() => {handleSave(
                  loadedRecipe.id,
                  loadedRecipe.name,
                  loadedRecipe.ingredient,
                  loadedRecipe.instruction,
                  loadedRecipe.imageUrl, 
                  loadedRecipe.videoUrl
                  )}}>
                <MaterialIcons name="favorite-outline" size={30}/>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {navigation.navigate("AddFeedback", {recipeId: loadedRecipe.id})}}>
                <MaterialIcons name="comment" size={30}/>
              </TouchableOpacity>
            </View>:
              <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                  onPress={() => {handleRemove(
                      savedRecipe.id,
                      savedRecipe.image,
                      savedRecipe.video
                  )}}>
              <MaterialIcons name="favorite" size={30}/>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => {navigation.navigate("AddFeedback", {recipeId: loadedRecipe.id})}}>
                <MaterialIcons name="comment" size={30}/>
              </TouchableOpacity>
            </View> :  
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity 
                    onPress={() => {handleSave(
                      loadedRecipe.id,
                      loadedRecipe.name,
                      loadedRecipe.ingredient,
                      loadedRecipe.instruction,
                      loadedRecipe.imageUrl, 
                      loadedRecipe.videoUrl
                      )}}>
                  <MaterialIcons name="favorite-outline" size={30}/>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {navigation.navigate("AddFeedback", {recipeId: loadedRecipe.id})}}>
                <MaterialIcons name="comment" size={30}/>
                </TouchableOpacity>
              </View>: 
              <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                    "Guest",
                    "You need to be logged in to save recipes! Login now?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => {return;},
                        style: "cancel"
                      },
                      { text: "OK", onPress: () => {navigation.navigate("LogIn")} }
                    ]
                  )}}>
                <MaterialIcons name="favorite-outline" size={30}/>
              </TouchableOpacity> }

                


            </View>

            <ScrollView showsVerticalScrollIndicator={false} >
                              
                    <Text style={styles.labelText}>{loadedRecipe.name}</Text>
                    <TouchableOpacity 
                        style={{marginBottom: 20, alignItems: 'center', justifyContent: 'center'}} 
                        onPress={() => {}}>
                       <View style={{
                                height: 400,
                                width: "100%",
                                borderRadius: 15,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                              {loadedRecipe.videoUrl == null ?
                              <Image
                              source={{uri: loadedRecipe.imageUrl}}
                              style={{
                                height: 400, 
                                width: "100%",
                                flex: 1, 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                borderRadius:15}}
                                /> :
                               <Video
                                  source={{uri: loadedRecipe.videoUrl}}
                                  autoplay={true}
                                  useNativeControls
                                  resizeMode='contain'
                                  style={{
                                    height: 400, 
                                    width: "100%",
                                    flex: 1, 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    borderRadius:15}}
                                />  }

                        </View>
                    </TouchableOpacity>
                                        
                    <Text style={styles.labelTitle}>Ingredients</Text>
                    <Text style={styles.labelDescription}>{loadedRecipe.ingredient}</Text>

                    <Text style={styles.labelTitle}>Instructions</Text>
                    <Text style={styles.labelDescription}>{loadedRecipe.instruction}</Text>

                    <Text style={styles.labelTitle}>Comments</Text>
                    <FlatList
                      style={styles.root}
                      data={loadedFeedbacks}
                      ListEmptyComponent={listEmptyComponent()}
                      ItemSeparatorComponent={() => {
                        return (
                          <View style={styles.separator}/>
                        )
                      }}
                      keyExtractor={(item)=>{
                        return item.id;
                      }}
                      renderItem={(item) => {                       
                        for(let i=0; i<allUsers.length; i++){
                          // console.log(i)
                          if(allUsers[i].id == item.item.userId){
                            return(
                              // allUsers[item.index].id == item.item.userId ?
                              <View style={styles.commentContainer}>
                                <Image 
                                  style={styles.image} 
                                  source={
                                  allUsers[i].profileImageUrl != null && allUsers[i].profileImageUrl != ""  ? 
                                  {uri: allUsers[i].profileImageUrl} : 
                                  require('../assets/user-default-icon.png') }/>
                              <View style={styles.content}>
                                <View style={styles.contentHeader}>
                                  <Text style={styles.name}>
                                    { allUsers[i].username.length >=12 ? 
                                    allUsers[i].username.substring(0,12) + "...": 
                                    allUsers[i].username}</Text>
                                  
                                    {                                 
                                      rating.map((res, key) => {
                                        return (
                                            <Image 
                                                style={styles.starImg}
                                                source={
                                                    res <= item.item.rating ? require(starImgFilled) : require(starImgCorner)
                                                }    
                                            />
                                        )
                                    })
                                    }
                                </View>
                                <Text>{item.item.description}</Text>
                              </View>
                            </View> 
                            );
                            // console.log(loadedFeedbacks)                        
                          }
                        }
                        
                      }}/>
                    
            </ScrollView>
        </SafeAreaView>) ):
           (<SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} >
                              
                    <Text style={styles.labelText}>{savedRecipe.name}</Text>
                    <TouchableOpacity 
                        style={{marginBottom: 20, alignItems: 'center', justifyContent: 'center'}} 
                        onPress={() => {}}>
                       <View style={{
                                height: 400,
                                width: "100%",
                                borderRadius: 15,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                              {savedRecipe.video == null ?
                              <Image
                              source={{uri: savedRecipe.image}}
                              style={{
                                height: 400, 
                                width: "100%",
                                flex: 1, 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                borderRadius:15}}
                                /> :
                               <Video
                                  source={{uri: savedRecipe.video}}
                                  autoplay={true}
                                  useNativeControls
                                  resizeMode='contain'
                                  style={{
                                    height: 400, 
                                    width: "100%",
                                    flex: 1, 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    borderRadius:15}}
                                />  }

                        </View>
                    </TouchableOpacity>                    
                    <Text style={styles.labelTitle}>Ingredients</Text>
                    <Text style={styles.labelDescription}>{savedRecipe.ingredient}</Text>

                    <Text style={styles.labelTitle}>Instructions</Text>
                    <Text style={styles.labelDescription}>{savedRecipe.instruction}</Text>
                    
            </ScrollView>
        </SafeAreaView>)
  )
}

export default RecipeDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop:50,
        paddingBottom: 50
    },
    loadingContainer:{
      flex:1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    input: {
        backgroundColor: "#fff",
        marginBottom: 20
    },
    labelText: {
        fontWeight: 'bold',
        fontSize: 20
    },
    labelTitle: {
      fontWeight: 'bold',
      fontSize: 20,
      marginBottom: 20,
    },
    labelDescription: {
      marginLeft: 10,
      fontSize: 16,
      marginBottom: 20,
    },
    root: {
      backgroundColor: "#ffffff",
      marginTop:10,
    },
    separator: {
      height: 1,
      backgroundColor: "#CCCCCC"
    },
    commentContainer: {
      paddingLeft: 19,
      paddingRight: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    content: {
      marginLeft: 16,
      flex: 1,
    },
    contentHeader: {
      flexDirection: 'row',
      marginBottom: 6
    },
    image:{
      width:45,
      height:45,
      borderRadius:20,
      marginLeft:20
    },
    time:{
      fontSize:11,
      color:"#808080",
    },
    name:{
      fontSize:16,
      fontWeight:"bold",
    },
    itemText: {
      marginTop: 5,
    },
    starImg: {
      marginLeft: 5,
      width: 16,
      height: 16,
      resizeMode: 'cover'
  } 
})