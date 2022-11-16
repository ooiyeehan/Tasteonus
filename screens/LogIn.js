import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import * as Facebook from 'expo-facebook'
import { AuthContext } from '../navigation/AuthProvider';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import SocialButton from '../components/SocialButton';


const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const {login, FacebookLogIn} = useContext(AuthContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.logo}
      />

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />

      <FormButton
        buttonTitle="Sign In"
        onPress={() => login(navigation, email, password)}
      />

      {/* <TouchableOpacity style={styles.forgotButton} onPress={() => {}}>
        <Text style={styles.navButtonText}>Forgot Password?</Text>
      </TouchableOpacity> */}
      <Text style={styles.text}>OR</Text>
        <View>
          <SocialButton
            buttonTitle="Sign In with Facebook"
            btnType="facebook"
            color="#4867aa"
            backgroundColor="#e6eaf4"
            onPress={() => FacebookLogIn(navigation)}
          />
        </View>
      

      <TouchableOpacity
        style={styles.forgotButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.navButtonText}>
          Don't have an acount? Register here
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.navButtonText}>
          Continue as Guest
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// async function FacebookLogIn() {
//   try {
//     await Facebook.initializeAsync({
//       appId: '585859876550913',
//     });
//     const { type, token, expirationDate, permissions, declinedPermissions } =
//       await Facebook.logInWithReadPermissionsAsync({
//         permissions: ['public_profile'],
//       });
//     if (type === 'success') {
//       // Get the user's name using Facebook's Graph API
//       const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,picture.type(large)`);
//       // const userInfo = await response.json();
//       Alert.alert('Logged in!', `Hi ${(await response.json()).picture.data.url}!`);
      
//     } else {
//       // type === 'cancel'
//     }
//   } catch ({ message }) {
//     alert(`Facebook Login Error: ${message}`);
//   }
// }

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
  text: {
    fontFamily: 'Kufam-SemiBoldItalic',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  forgotButton: {
    marginVertical: 10,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e64e5',
    fontFamily: 'Lato-Regular',
  },
});
