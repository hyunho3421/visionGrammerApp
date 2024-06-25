import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Button, StyleSheet, ToastAndroid, BackHandler } from 'react-native';
import * as SecureStore from "expo-secure-store";

const DOUBLE_PRESS_DELAY = 2000;

export default function NotGrantScreen({ navigation } : {navigation: any}) {
  const [lastBackPressed, setLastBackPressed] = React.useState(0);

  // 뒤로가기 막기
  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        const now = Date.now();
        if (now - lastBackPressed < DOUBLE_PRESS_DELAY) {
          BackHandler.exitApp();
        } else {
          setLastBackPressed(now);
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [lastBackPressed])
  );


  const setIsCheckingAppId = async () => {
    SecureStore.deleteItemAsync("appId");
    SecureStore.deleteItemAsync("grant");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for Permission Request</Text>
      <Button title="재요청"
        onPress={setIsCheckingAppId}
      />
    </View>
  );
}
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
    },
  });