import {Image, TouchableOpacity, FlatList, SectionList, ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import {SearchBar} from 'react-native-elements';

import { checkConnected } from '../constants/connection';
import NoConnection from '../components/NoConnection';
import { getAllRecipes } from '../API/recipes';

export default function Home({navigation}) {
  const [connected, setConnected] = useState(false)
  const [loadedRecipes, setLoadedRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [arrayHolder, setArrayHolder] = useState([])
  

  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData(){
        checkConnected().then(async res => {
          setConnected(res)
          if(res){
            setLoading(true)
            const response = await getAllRecipes()
            setLoadedRecipes(response) 
            setArrayHolder(response)  
            setLoading(false)
          }
        })

    }  
      fetchData()   
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;  
    })       
  }, [navigation]) 

  const SECTIONS = [
    {
      title: "Trending Recipes",
      horizontal: "true",
      data: [
        loadedRecipes
      ]
    },
    {
      title: "You might also like",
      horizontal: "true",
      data: [
        loadedRecipes
      ]
    }
  ]

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
  const onChangeSearch = query => setSearchQuery(query);
  const searchFunction = (text) => {
    if(text == null){
      setArrayHolder(loadedRecipes) 
    }
    const updatedData = arrayHolder.filter((item) => {
      const item_data = `${item.name.toUpperCase()})`;
      const text_data = text.toUpperCase();
      return item_data.indexOf(text_data) > -1;
    });
    setLoadedRecipes(updatedData)
    setSearchQuery(text)
  };
  const reAssignValue = () => {
    console.log("triggered")
    setLoadedRecipes(loadedRecipes) 
  }
  return (
    connected ? 
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    (
        <View style={styles.container}>
          <SearchBar
              style={{width: 1000}}
              round
              lightTheme
              placeholder="Search Recipe"
              onChangeText={(text) => searchFunction(text)}
              value={searchQuery}
              onCancel={() => reAssignValue()}
          />
          <SectionList
            contentContainerStyle={{ paddingHorizontal: 10 }}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            sections={SECTIONS}
            renderSectionHeader={({ section }) => (
              <>
                <Text style={styles.sectionHeader}>{section.title}</Text>
                {section.horizontal ? (
                  <FlatList
                    horizontal
                    data={loadedRecipes}
                    renderItem={({ item }) => <ListItem item={item} />}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={listEmptyComponent()}
                  />
                ) : null}
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
      ): <NoConnection />
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    padding: 2
  },
  loadingContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
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