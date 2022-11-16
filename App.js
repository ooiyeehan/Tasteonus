import React, { useCallback, useEffect, useState, useContext } from 'react';
import { LogBox } from 'react-native';
import { BackHandler, Alert } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useBackHandler } from "@react-native-community/hooks"
import { 
  Dosis_200ExtraLight,
  Dosis_300Light,
  Dosis_400Regular,
  Dosis_500Medium,
  Dosis_600SemiBold,
  Dosis_700Bold,
  Dosis_800ExtraBold 
} from '@expo-google-fonts/dosis'
import { 
  Bitter_400Regular,
  Bitter_400Regular_Italic,
  Bitter_700Bold 
} from '@expo-google-fonts/bitter'
import Toast from 'react-native-toast-message';

import { AuthProvider, AuthContext } from './navigation/AuthProvider';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import LogIn from './screens/LogIn';
import Register from './screens/Register';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';
import ChangePassword from './screens/ChangePassword';
import AddRecipe from './screens/AddRecipe';
import RecipeDetail from './screens/RecipeDetail';
import EditRecipe from './screens/EditRecipe';
import AddFeedback from './screens/AddFeedback';

const Stack = createNativeStackNavigator();
// Callback function for back action
const backActionHandler = () => {
  Alert.alert("Alert!", "Are you sure you want to exit this app?", [
    {
      text: "Cancel",
      onPress: () => null,
      style: "cancel"
    },
    { text: "YES", onPress: () => BackHandler.exitApp() }
  ]);
  return true;
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
  LogBox.ignoreAllLogs();//Ignore all log notifications
  // hook which handles event listeners under the hood
  useBackHandler(backActionHandler)
  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          Dosis_200ExtraLight,
          Dosis_300Light,
          Dosis_400Regular,
          Dosis_500Medium,
          Dosis_600SemiBold,
          Dosis_700Bold,
          Dosis_800ExtraBold,
          Bitter_400Regular,
          Bitter_400Regular_Italic,
          Bitter_700Bold,
          'Kufam-SemiBoldItalic': require('./assets/fonts/Kufam-SemiBoldItalic.ttf'),
          'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
          'Lato-BoldItalic': require('./assets/fonts/Lato-BoldItalic.ttf'),
          'Lato-Italic': require('./assets/fonts/Lato-Italic.ttf'),
          'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf')
        });

        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationContainer onReady={onLayoutRootView}>
        <Stack.Navigator initialRouteName="Home">
          {/* <Stack.Screen name="Home" component={Home} options={{title:'Home'}} />
          <Stack.Screen name="Reward" component={Reward} options={{title:'Reward'}} />
          <Stack.Screen name="MyRecipe" component={MyRecipe} options={{title:'MyRecipe'}} /> */}
          <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} options={{headerShown:false}}/>
          <Stack.Screen name="LogIn" component={LogIn} options={{title:''}} /> 
          <Stack.Screen name="Register" component={Register} options={{title:''}} /> 
          <Stack.Screen name="Profile" component={Profile} options={{title:''}} /> 
          <Stack.Screen name="EditProfile" component={EditProfile} options={{title:''}} /> 
          <Stack.Screen name="ChangePassword" component={ChangePassword} options={{title:'Change Password'}} /> 
          <Stack.Screen name="AddRecipe" component={AddRecipe} options={{title:'Add Recipe'}} /> 
          <Stack.Screen name="RecipeDetail" component={RecipeDetail} options={{title:''}} /> 
          <Stack.Screen name="EditRecipe" component={EditRecipe} options={{title:''}} /> 
          <Stack.Screen name="AddFeedback" component={AddFeedback} options={{title:'Leave a Feedback'}} />
        </Stack.Navigator>
     </NavigationContainer>
    </AuthProvider>

  );
}