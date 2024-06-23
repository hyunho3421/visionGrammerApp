import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import * as Application from 'expo-application';

export default function MainScreen({ navigation } : {navigation: any}) {
  const a = true;

  

  

  function goHome() {
    navigation.navigate('Home1');
  }
  
  useEffect(() => {
    if (a) {
      goHome();
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>메인화면</Text>
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