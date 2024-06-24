import { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { checkingAppId, requestAccount } from '../restApi/visionGrammarServer';

export default function NotExistAppId({ navigation } : {navigation: any}) {
  const [text, setText] = useState('');

  const setIsCheckingAppId = async () => {
    await requestAccount(text);

    navigation.navigate('notGrant');
  };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please write in English</Text>
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