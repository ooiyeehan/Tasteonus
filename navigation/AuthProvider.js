import React, {createContext, useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import { EmailAuthProvider , updatePassword, reauthenticateWithCredential, fetchSignInMethodsForEmail, getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithCredential, FacebookAuthProvider } from 'firebase/auth';
import * as Facebook from 'expo-facebook'
import {Alert} from 'react-native';
import Toast from "react-native-toast-message";
import * as SQLite from 'expo-sqlite'

import { checkConnected } from '../constants/connection';
import app from '../constants/firebase';
import { createNewUser, getAllUsers } from '../API/users';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [connected, setConnected] = useState(false)
  const [loadedUsers, setLoadedUsers] = useState([])
  const [user, setUser] = useState(null);
  // const [initializing, setInitializing] = useState(true);

  const auth = getAuth(app);
  // const onAuthStateChanged = (user) => {
  //   setUser(user);
  //   if (initializing) setInitializing(false);
  // };
  const db = SQLite.openDatabase('TasteonusDB') // create new SQLite database, if the database doesn’t exists then a new one is created


  // Check if the recipes table exists if not create it
  const createLocalTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS " + 
        "recipes" + 
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, " + 
        "recipeId INTEGER, name TEXT, ingredient TEXT, instruction TEXT, image TEXT, video TEXT)"
      )
    })
  }


  useEffect(() => {
    
    async function fetchData(){
      checkConnected().then(async res => {
        setConnected(res)
        if(res){
          const response = await getAllUsers()
          setLoadedUsers(response)
        }
      })
      
    }
    fetchData()
  }, [])

  useEffect(() => {
    createLocalTable()
  }, [])

  useEffect(() => {
    checkConnected().then(res => {
      setConnected(res)
      if(res){
        const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (user) => {
      
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            setUser(user);
          } else {
            // User is signed out
            setUser(null);
          }
        });
    
        return unsubscribeFromAuthStatusChanged;
      }
    })
    setUser(null)
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (navigation, email, password) => {
          try {
            await signInWithEmailAndPassword(auth, email, password);
            navigation.navigate('Home');
            Toast.show({
              type:'success',
              text1:'Login Successful!'
          })
          } catch (e) {
            Toast.show({
              type:'error',
              text1:'Incorrect email or password!'
          })
          }
        },
        changePassword: async(currentPassword, newPassword) => {
          var currentUser = auth.currentUser;
          var cred = EmailAuthProvider.credential(currentUser.email, currentPassword)
          reauthenticateWithCredential(currentUser, cred).then(() =>{
            updatePassword(currentUser, newPassword).then(() => {
              console.log("Password updated!")
            })
          })
        },
        FacebookLogIn: async (navigation) => {
          try {
            await Facebook.initializeAsync({
              appId: '585859876550913',
            });
            const { type, token, expirationDate, permissions, declinedPermissions } =
              await Facebook.logInWithReadPermissionsAsync({
                permissions: ['public_profile'],

              });
            if (type === 'success') {
              // Get the user's name using Facebook's Graph API
              const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.type(large)`);
              const userInfo = await response.json();
              const credential = FacebookAuthProvider.credential(token);
              await fetchSignInMethodsForEmail(auth, userInfo.email).then(async (result) => {
                //if this email has not signed in (0) before through FB, login and create new user
                console.log(userInfo.picture.data.url)
                if(result.length == 0){
                  await signInWithCredential(auth, credential)
                  await createNewUser(userInfo.name, auth.currentUser.uid, userInfo.email, "", userInfo.picture.data.url, "", "Facebook Login", 50);
                  navigation.navigate('Home');
                }
                //if email has signed in before, just login and don't create new user
                else{
                  await signInWithCredential(auth, credential)
                  Toast.show({
                      type:'success',
                      text1:'Login Successful!'
                    })
                  navigation.navigate('Home');
                }

              });
            
            } else {
              // type === 'cancel'
            }
          } catch ({ message }) {
            alert(`Facebook Login Error: ${message}`);
          }
        },
        register: async (navigation, username, email, password) => {
          try {
            await createUserWithEmailAndPassword(auth, email, password)
            .then(async() => {
              //Once the user creation has happened successfully, we can add the currentUser into firestore
              //with the appropriate details.
              // Alert.alert('Logged in!', `Register Successful!`);
              await createNewUser(username, auth.currentUser.uid, email, password, "", "", "Email and Password", 50)
              Toast.show({
                type:'success',
                text1:'Register Successful!'
            })
              navigation.navigate('MyRecipe')
            })
            //we need to catch the whole sign up process if it fails too.
            .catch(error => {
                console.log(error.code);
                switch(error.code){
                  case 'auth/invalid-email':
                    Toast.show({
                      type:'error',
                      text1:'Invalid Email!'
                  })
                    break;
                  case 'auth/email-already-in-use':
                    Toast.show({
                      type:'error',
                      text1:'Email is already in use!'
                  })
                    break;
                  case 'auth/weak-password':
                    Toast.show({
                      type:'error',
                      text1:'Weak Password',
                      text2: 'Password must be at least 6 characters or longer!'
                  })
                    break;
                  default:
                    Toast.show({
                      type:'error',
                      text1:'Unexpected Firebase Error',
                      text2: 'Error: ' + error
                  })
                  
                }
                 
                
            });
          } catch (e) {
            console.log(e);
          }
        },
        logout: async (navigation) => {
          try {
            await signOut(auth);
            Toast.show({
              type:'success',
              text1:'You have been succesfully logout!'
          })
          navigation.navigate("Home")
          } catch (e) {
            console.log(e);
          }
        },
      }}>
      {children}
      <Toast />
    </AuthContext.Provider>
  );
};
