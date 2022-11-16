import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React, {useState, useContext, useEffect} from 'react'
import { TextInput as Input } from 'react-native-paper'
import Toast from 'react-native-toast-message'

import { AuthContext } from '../navigation/AuthProvider'
import { createNewFeedback } from '../API/feedbacks'
import { getUserByUid, updateUser } from '../API/users'
import FormButton from '../components/FormButton'

const AddFeedback = ({route, navigation}) => {
    const {recipeId} = route.params
    const {user} = useContext(AuthContext)
    const [userData, setUserData] = useState({})
    const [feedback, setFeedback] = useState("")
    const [rating, setRating] = useState([1,2,3,4,5])
    const [defaultRating, setDefaultRating] = useState(1)
    const [loading, setLoading] = useState(false)

    const starImgCorner = '../assets/star_corner.png'
    const starImgFilled = '../assets/star_filled.png'
    
    const handleSubmit = async (navigation) => {
        if(feedback == "" || feedback == null){
            Toast.show({
                type:'error',
                text1:'Please leave a feedback first!',
            })
            return;
        }
        setLoading(true)
       await createNewFeedback(
            feedback,
            defaultRating,
            userData.id,
            recipeId
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
                userData.point + 10)
            }).then(() => {
                setLoading(false)
                Toast.show({
                    type:'success',
                    text1:'Points earned! - Feedback Given',
                    text2: 'Feedback submitted successfully and you have earned 10 points!'
                })
                navigation.navigate("RecipeDetail", {recipeId: recipeId})
            })
        
    }
    useEffect(() => {
        async function fetchData(){
            getUserByUid(user.uid).then(item => {
                setUserData(item)    
            })
             
        }     
          fetchData()   
      }, [])
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} >
            <Text style={styles.labelText}>Was it a good recipe?</Text>
            <View style={styles.customRatingBar}>
                {
                    rating.map((item, key) => {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                key={item}
                                onPress={() => setDefaultRating(item)}
                            >
                                <Image 
                                    style={styles.starImg}
                                    source={
                                        item <= defaultRating ? require(starImgFilled) : require(starImgCorner)
                                    }    
                                />

                            </TouchableOpacity>
                        )
                    })
                }
            </View>
            <Input
                multiline
                maxLength={400}
                numberOfLines={10}
                style={styles.input}
                selectionColor="#560CCE"
                underlineColor="transparent"
                mode="outlined"
                placeholder='Share your experience with this recipe'
                value={feedback}
                onChangeText={(value)=> setFeedback(value)}
            />
            <FormButton buttonTitle={!loading ? "Give Feedback" : <ActivityIndicator /> } onPress={() => {handleSubmit(navigation)}}/>
        </ScrollView>
    </SafeAreaView>
  )
}

export default AddFeedback

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:20,

    },
    input: {
        backgroundColor: "#fff",
        marginBottom: 20,
        marginTop: 20
    },
    labelText: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center'
    },
    customRatingBar:{
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 15
    },
    starImg: {
        width: 40,
        height: 40,
        resizeMode: 'cover'
    }

})