import { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert  } from 'react-native';
import { getFirstCertify } from '../restApi/visionGrammarServer';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// SplashScreen.preventAutoHideAsync().catch(() => { /* iphone 용 */ });

export default function NotExistAppId({ navigation } : {navigation: any}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const setIsCheckingAppId = async () => {
    if (text == '') {
      Alert.alert("write name please");
      return;
    }

    if (sending == true) {
      return;
    }

    try {
      setSending(true);
      SplashScreen.preventAutoHideAsync().catch(() => { /* iphone 용 */ });
      await getFirstCertify(text);
      navigation.navigate('notGrant');
      
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
      SplashScreen.hideAsync(); 
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Please write name in english</Text>
        <TextInput style={styles.input} value={text} onChangeText={(newText) => setText(newText)} placeholder='phone name'/>
        <Button title="request" onPress={setIsCheckingAppId}/>
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
    input: {
      backgroundColor: 'white',
      padding: 10,
      margin: 15,
      height: 40,
      width: 160,
      borderColor: "black",
      borderWidth: 1
    }
    
  });