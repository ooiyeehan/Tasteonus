import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import Home from '../screens/Home';
import MyRecipe from '../screens/MyRecipe';
import Reward from '../screens/Reward';


const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {

    return (
        <Tab.Navigator
        screenOptions={{ unmountOnBlur: true, tabBarHideOnKeyboard: true }}>
            <Tab.Screen 
                name="Home" component={Home} options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: () => (
                        <Ionicons name="home" size={22}/>
                    ),
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="MyRecipe" component={MyRecipe} options={{
                    tabBarLabel: 'My Recipe',
                    tabBarIcon: () => (
                        <MaterialCommunityIcons name="chef-hat" size={22}/>
                    ),
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="Reward" component={Reward} options={{
                    tabBarLabel: 'Reward',
                    tabBarIcon: () => (
                        <Ionicons name="gift" size={22}/>
                    ),
                    headerShown: false
                }}
            />
        </Tab.Navigator>
    )
}
