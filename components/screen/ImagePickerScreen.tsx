import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Image, View, Text, StyleSheet, TouchableOpacity, ToastAndroid, BackHandler } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { checkGrammerApi } from '../restApi/visionGrammarServer'

const GOOGLE_CLOUD_VISION_API_KEY = '';
const DOUBLE_PRESS_DELAY = 2000;

export default function ImagePickerScreen({ navigation } : {navigation: any}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capture, setCapture] = useState(true);
  const [flip, setFlip] = useState(false);

  var [correctNumber, setCorrectNumber] = useState('');

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


  const pickImage = async () => {
    setFlip(false);
    setIsLoading(true);

    if (capture) {
      setCapture(false);
    }
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('카메라 접근 권한이 필요합니다.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [6, 7],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      const detectedText = await analyzeImage(result.assets[0].uri);

      const requestText = await getText(detectedText);

      var responseText = await checkGrammerApi(requestText);
      
      const extractedResponseText = /[1-5][번]/.exec(responseText);

      setCorrectNumber(responseText);
    }
    setIsLoading(false);
    setFlip(true);
  };

  const analyzeImage = async (uri: string) => {
    const response = await fetch(uri);
      const blob = await response.blob();
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    try {
       const response = await axios.post(
        'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY,
        {
          requests: [
            {
              image: {
                content: base64Image.split(',')[1],
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        }
      );

      return response.data.responses[0].fullTextAnnotation.text;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getText = async (extractedText:string) => {
    const mainTextArr = extractedText.split("\n");
    
    // for (var i = 0; i < mainTextArr.length; i++) {
    //   console.log("mainTextArr [" + i + "]" + mainTextArr[i]);
    // }
    
    var pos = mainTextArr.indexOf("올바른 문장을 선택해 주세요");
    if (pos == -1) {
      // 사진 다시찍도록 유도 
      // console.log("문자 추출 실패");
    }

    var questionText = "";
    var cnt = 1;

    for (var i = pos+1; i < mainTextArr.length; i++) {
      if (mainTextArr[i].indexOf(".") != -1 && mainTextArr[i].indexOf("LV.") == -1 && cnt < 6) {
        questionText += cnt + "번:\'" + mainTextArr[i].replaceAll("..", ".") + "\'\n";
        cnt = cnt + 1;
      }
    }

    console.log("questionText is " + questionText);

    return questionText;
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Checking...</Text>
        </View>
      )}
      {correctNumber && <Text style={styles.text}>{correctNumber}</Text>}
      {imageUri && <View style={styles.imageWrap}><Image source={{ uri: imageUri }} style={styles.image} /></View>}
      {capture && 
        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Text style={styles.camera}>Capture</Text>      
        </TouchableOpacity>
      }
      {flip && 
        <TouchableOpacity style={styles.flipButton} onPress={pickImage}>
          <Text style={styles.flip}>Capture</Text>      
        </TouchableOpacity>
      }
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  imageWrap: {
    // flex: 1,
    width: '80%',
    height: '80%',
    
  },
  image: {
    width: '100%',
    height: '100%',
    marginTop: 10,
    resizeMode: "contain",
  },
  text: {
    // flex: 1,
    fontSize: 20,
    justifyContent: 'center',
    width: '70%',
    height: '7%',
    textAlign: 'center',
    backgroundColor: '#3498db',
    color: '#fff', // 버튼 글자색상 추가
    borderRadius: 10,
    // marginBottom: 20,
    marginTop: 20,
    paddingTop: 10,
  },
  cameraButton: {
    // flex: 1,
    alignItems: 'center',
    top: '70%',
    backgroundColor: '#3498db', // 버튼 배경색상 추가
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    // height: '10%',
  },
  camera: {
    fontSize: 24,
    color: '#fff', // 버튼 글자색상 추가
    fontWeight: 'bold',
  },
  flipButton: {
    // flex: 1,
    alignItems: 'center',
    // top: '70%',
    backgroundColor: '#3498db', // 버튼 배경색상 추가
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 30,
    width: '80%',
    // height: '10%',
  },
  flip: {
    fontSize: 24,
    color: '#fff', // 버튼 글자색상 추가
    fontWeight: 'bold',
  },
  loading: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3498db', // 버튼 배경색상 추가
  },
  loadingText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#fff', // 버튼 글자색상 추가
    fontWeight: 'bold',
    top: '20%',
  },

});
