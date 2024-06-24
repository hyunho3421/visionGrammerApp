import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from "expo-secure-store";
import HomeScreen2 from './NotGrantScreen';
import HomeScreen3 from './NotExistAppIdScreen';

import { checkingAppId } from '../restApi/visionGrammarServer';



export default function CheckingVerifyScreen({ navigation } : {navigation: any}) {
  // const [isAppId, setIsAppId] = useState(false);
  // const [isGrant, setIsGrant] = useState(false);
  
  const setIsCheckingAppId = async () => {
    const result = await checkingAppId();
    if (result == 'NOT_EXIST_APPID') {
      navigation.navigate('notExistAppId');
    } else if (result == 'PERMISSION') {
      navigation.navigate('notGrant');
    } else {
      navigation.navigate('notGrant');
    }
  }

  setIsCheckingAppId();
  
  //onPress={() => navigation.navigate('Details')}
  return (
    <View>
    </View>
  );
}
  