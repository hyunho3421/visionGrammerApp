import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from "expo-secure-store";

import { checkingAppId } from '../restApi/visionGrammarServer';

export default function CheckingVerifyScreen({ navigation } : {navigation: any}) {
  const setIsCheckingAppId = async () => {
    const result = await checkingAppId();

    if (result == 'NOT_EXIST_APPID') {
      navigation.navigate('notExistAppId');
    } else if (result == 'PERMISSION') {
      navigation.navigate('camera');
      // navigation.navigate('picker');
    } else {
      navigation.navigate('notGrant');
    }
  }
  
  setIsCheckingAppId();

  return (
    <View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});