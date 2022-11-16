import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, SectionList, ActivityIndicator } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { FAB, Card, Title } from 'react-native-paper';
import * as SQLite from 'expo-sqlite'

import { AuthContext } from '../navigation/AuthProvider';
import { checkConnected } from '../constants/connection';
import NoConnection from '../components/NoConnection';
import FormButton from '../components/FormButton';
import { getRecipeByUid } from '../API/recipes';

export default function MyRecipe({navigation}) {
  const [connected, setConnected] = useState(false)
  const {user, logout} = useContext(AuthContext)
  const [loadedRecipes, setLoadedRecipes] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [loading, setLoading] = useState(false)


  const db = SQLite.openDatabase('TasteonusDB') // create new SQLite database, if the database doesn’t exists then a new one is created

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        async function fetchData(){
          checkConnected().then(async res => {
            setConnected(res)
            if(res){
              if(user){
                setLoading(true)
                await getRecipeByUid(user.uid).then(item => {
                  getSavedData()
                  setLoadedRecipes(item)   
                  setLoading(false)
                })

              }              
            }
            getSavedData()
          })
      }
      function getSavedData() {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT * FROM recipes",
            [],
            (tx, results) => {
              var rows = results.rows.length
              if(rows > 0){              
                  setSavedRecipes(results.rows._array)              
              }
            }
          )
        })
      }
        fetchData()        
      // Return the function to unsubscribe from the event so it gets removed on unmount
      return unsubscribe;  
      })       
    }, [navigation]) 
    
    const listEmptyComponent = () => {
      return (
          <View style={styles.container}>
              <Text style={styles.itemText}>No Recipes Found!</Text>
          </View>
      )
    }

    const ListItem = ({ item }) => {
      return (
        <View style={styles.item}>
          <TouchableOpacity
                  onPress={() => navigation.navigate("RecipeDetail", {recipeId: item.id})}
                >
          <Image
            source={{
              uri: item.imageUrl,
            }}
            style={styles.itemPhoto}
            resizeMode="cover"
          />
          <Text style={styles.itemText}>{item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</Text>
          </TouchableOpacity>
        </View> 
      );
    };

    const ListSavedItem = ({ item }) => {
      return (
        <View style={styles.item}>
          <TouchableOpacity
                  onPress={() => navigation.navigate("RecipeDetail", {recipeId: item.recipeId})}
                >
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.itemPhoto}
            resizeMode="cover"
          />
          <Text style={styles.itemText}>{item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</Text>
          </TouchableOpacity>
        </View> 
      );
    };

    const SECTIONS = [
      {
        title: "Your Recipes",
        horizontal: "true",
        data: [
          loadedRecipes
        ]
      },
      {
        title: "Saved Recipes",
        horizontal: "true",
        data: [
          savedRecipes
        ]
      }
    ]

    const SAVEDSECTIONS = [
      {
        title: "Saved Recipes",
        horizontal: "true",
        data: [
          savedRecipes
        ]
      }
    ]

  return (
    connected ? (
       user != null ? 
      loading ? <View style={styles.container}><ActivityIndicator size="large" /></View> :
      (
          <View style={styles.container}>
            <SectionList
              contentContainerStyle={{ paddingHorizontal: 10 }}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
              sections={SECTIONS}
              renderSectionHeader={({ section }) => (
                <>
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                  {section.title == "Your Recipes" ? (
                    <FlatList
                      horizontal
                      data={loadedRecipes}
                      renderItem={({ item }) =>  <ListItem item={item} />}
                      showsHorizontalScrollIndicator={false}
                      ListEmptyComponent={listEmptyComponent()}
                    />
                  ) : (
                    <FlatList
                      horizontal
                      data={savedRecipes}
                      renderItem={({ item }) =>  <ListSavedItem item={item} />}
                      showsHorizontalScrollIndicator={false}
                      ListEmptyComponent={listEmptyComponent()}
                    />
                  ) }
                </>
              )}
              renderItem={({ item, section }) => {
                if (section.horizontal) {
                  return null;
                }

                return <ListItem item={item} />;
              }}
            />
            <Ionicons style={styles.profileIcon} name="person-circle-outline" onPress={() => {navigation.navigate("Profile")}} size={40}/>      
            <FAB
              icon="plus"
              style={styles.fab}
              onPress={() => navigation.navigate("AddRecipe")}
            />
          </View>
        ) :  <View style={styles.container}>
                <Image
                    source={require('../assets/recipe-icon.jpg')}
                    style={styles.logo}
                />
                <Text style={styles.text}>Log in or create an account to manage your favourite recipes!</Text>
                <FormButton
                    buttonTitle="Login"
                    onPress={() => navigation.navigate('LogIn')}
                />
            </View>
    ) : <View style={styles.container}>
            <Text style={styles.text}>While you are offline, you can check out your saved recipes!</Text>
            <SectionList
              contentContainerStyle={{ paddingHorizontal: 10 }}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
              sections={SAVEDSECTIONS}
              renderSectionHeader={({ section }) => (
                <>
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                    <FlatList
                      horizontal
                      data={savedRecipes}
                      renderItem={({ item }) =>  <ListSavedItem item={item} />}
                      showsHorizontalScrollIndicator={false}
                      ListEmptyComponent={listEmptyComponent()}
                    />
                </>
              )}
              renderItem={({ item, section }) => {
                if (section.horizontal) {
                  return null;
                }

                return <ListItem item={item} />;
              }}
            />
          </View>

  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50
  },
  flatview: {
    justifyContent: 'center',
    paddingTop: 30,
    borderRadius: 2,
  },
  profileIcon: {
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
  },
  fab:{
    position: 'absolute',
    bottom:30,
    right: 15
  },
  sectionHeader: {
    fontWeight: '800',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 5,
  },
  item: {
    margin: 10,
  },
  itemPhoto: {
    width: 200,
    height: 200,
  },
  itemText: {
    marginTop: 5,
  }
})