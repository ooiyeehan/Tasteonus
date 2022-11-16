import axios from "axios";

import Toast from "react-native-toast-message";
import { URL } from "../constants/constants";

export async function createNewFeedback(description, rating, userId, recipeId) {
    fetch(URL+"/api/Feedbacks", {
        method: 'POST',
        body: JSON.stringify({
            description: description,
            rating: rating,
            userId: userId,
            recipeId: recipeId
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    }).then(e => {
        console.log(JSON.stringify(e))
    }).catch(e => {
        console.log(e)
        Toast.show({
            type:'error',
            text1:'Something went wrong!'
        })
    })
}

export async function getFeedbacksByRecipeId(recipeId) {
    let feedback = {}
    const res = await axios.get(URL+"/api/Feedbacks/RecipeId?recipeId="+recipeId)
    .then((response) => {
        feedback=response.data
        // console.log(response.data)
    });
    return feedback;
}