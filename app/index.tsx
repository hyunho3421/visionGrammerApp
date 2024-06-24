import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { checkingAppId } from '../components/restApi/visionGrammarServer';

const Stack = createNativeStackNavigator();

import CheckingVerifyScreen from '../components/screen/CheckingVerifyScreen';
import NotGrantScreen from '../components/screen/NotGrantScreen';
import NotExistAppIdScreen from '../components/screen/NotExistAppIdScreen';

export default function App() {  
  return (
      <Stack.Navigator initialRouteName='first'>  
        <Stack.Screen name='checkingVerify' component={CheckingVerifyScreen} options={{ headerTitleAlign:'center'}}/>
        <Stack.Screen name='notGrant' component={NotGrantScreen} options={{ headerTitleAlign:'center'}}/>
        <Stack.Screen name='notExistAppId' component={NotExistAppIdScreen} options={{ title: "Permission Request Page", headerTitleAlign:'center'}}/>
      </Stack.Navigator>
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