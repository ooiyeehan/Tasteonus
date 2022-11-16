import axios from "axios";

import Toast from "react-native-toast-message";
import { URL } from "../constants/constants";

export async function createNewUser(username, uid, email, password, profileImageUrl, biodata, loginMethod, point) {
    fetch(URL+"/api/Users", {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            uid: uid,
            email: email,
            password: password,
            profileImageUrl: profileImageUrl,
            biodata: biodata,
            loginMethod: loginMethod,
            point: point
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    }).then(e => {
        console.log(JSON.stringify(e))
        Toast.show({
            type:'success',
            text1:'Register Successful!'
        })
    }).catch(e => {
        console.log(e)
        Toast.show({
            type:'error',
            text1:'Something went wrong!'
        })
    })
}

export async function getUserByUid(uid) {
    let user = {}
    const res = await axios.get(URL+"/api/Users/Uid?uid="+uid)
    .then((response) => {
        user=response.data
        // console.log(response.data)
    });
    return user;
}

export async function getAllUsers() {
    let users = []
    await axios.get(URL+"/api/Users")
    .then((response) => {
        users=response.data;
        // console.log(response.data)
    });
    return users;
}

export async function updateUser(id, username, uid, email, password, profileImageUrl, biodata, loginMethod, point) {
    fetch(URL+"/api/Users/"+id, {
        method: 'PUT',
        body: JSON.stringify({
            id: id,
            username: username,
            uid: uid,
            email: email,
            password: password,
            profileImageUrl: profileImageUrl,
            biodata: biodata,
            loginMethod: loginMethod,
            point: point
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    }).then(e => {
        console.log(JSON.stringify(e))
    }).catch(e => console.log(e)
    )
}

export async function deleteUser(id) {
    fetch(URL+"/api/Users/"+id, {
        method: 'DELETE',
    }).then(res => {
        console.log(res)
        Toast.show({
            type:'info',
            text1:'Deleted Crew!'
        })
    })
}