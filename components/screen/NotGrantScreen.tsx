import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from "expo-secure-store";

export default function NotGrantScreen({ navigation } : {navigation: any}) {

  const setIsCheckingAppId = async () => {
    

    SecureStore.deleteItemAsync("appId");
    SecureStore.deleteItemAsync("grant");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈2</Text>
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