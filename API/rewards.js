import axios from "axios";

import Toast from "react-native-toast-message";
import { URL } from "../constants/constants";

export async function getAllRewards() {
    let rewards = []
    await axios.get(URL+"/api/Rewards")
    .then((response) => {
        rewards=response.data;
        // console.log(response.data)
    });
    return rewards;
}