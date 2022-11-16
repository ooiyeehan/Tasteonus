import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const NoConnection = () => {
  return (
    <View style={styles.container}>
      <Image
          source={require('../assets/no_connections.png')}
          style={{width:'30%', height: '30%'}}
          resizeMode='contain'
      />
      <Text>No Connection</Text>
    </View>
  )
}

export default NoConnection

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
})