import axios from "axios";

import Toast from "react-native-toast-message";
import { URL } from "../constants/constants";

export async function createNewRecipe(name, ingredient, instruction, imageUrl, videoUrl, userId, uid) {
    fetch(URL+"/api/Recipes", {
        method: 'POST',
        body: JSON.stringify({
            name: name,
            ingredient: ingredient,
            instruction: instruction,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            userId: userId,
            uid: uid
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

export async function getRecipeByUid(uid) {
    let recipes = {}
    const res = await axios.get(URL+"/api/Recipes/User?uid="+uid)
    .then((response) => {
        recipes=response.data
        // console.log(response.data)
    });
    return recipes;
}

export async function getRecipeById(id) {
    let recipe = {}
    const res = await axios.get(URL+"/api/Recipes/"+id)
    .then((response) => {
        recipe=response.data
         //console.log(response.data)
    });
    return recipe;
}

export async function getAllRecipes() {
    let recipes = []
    await axios.get(URL+"/api/Recipes")
    .then((response) => {
        recipes=response.data;
        // console.log(response.data)
    });
    return recipes;
}

export async function updateRecipe(id, name, ingredient, instruction, imageUrl, videoUrl, userId, uid) {
    fetch(URL+"/api/Recipes/"+id, {
        method: 'PUT',
        body: JSON.stringify({
            id: id,
            name: name,
            ingredient: ingredient,
            instruction: instruction,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            userId: userId,
            uid: uid
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    }).then(e => {
        console.log(JSON.stringify(e))
        Toast.show({
            type:'success',
            text1:'Recipe Updated!'
        })
    }).catch(e => console.log(e)
    )
}

export async function deleteRecipe(id) {
    fetch(URL+"/api/Recipes/"+id, {
        method: 'DELETE',
    }).then(res => {
        console.log(res)
        Toast.show({
            type:'info',
            text1:'Recipe deleted successfully!'
        })
    })
}