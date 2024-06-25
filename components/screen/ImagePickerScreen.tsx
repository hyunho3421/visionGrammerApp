import React, { useState } from 'react';
import { Button, Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { checkGrammerApi } from '../restApi/visionGrammarServer'

const GOOGLE_CLOUD_VISION_API_KEY = '';

export default function ImagePickerScreen({ navigation } : {navigation: any}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [capture, setCapture] = useState(true);
  const [flip, setFlip] = useState(false);

  var [correctNumber, setCorrectNumber] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [8, 7],
      quality: 0.5,
    });



    if (!result.canceled) {
      console.log("result uri is " + result.assets[0].uri);

      setImageUri(result.assets[0].uri);
      const detectedText = await analyzeImage(result.assets[0].uri);
      console.log(detectedText); // 콘솔에 추출된 텍스트 출력

      const requestText = await getText(detectedText);

      var responseText = await checkGrammerApi(requestText);
      console.log("responseText is " + responseText);
      
      const extractedResponseText = /[1-5][번]/.exec(responseText);
      console.log("temp is " + extractedResponseText);

      setCorrectNumber(responseText);
    }
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

      console.log("connected");

      return response.data.responses[0].fullTextAnnotation.text;
    } catch (error) {
      console.error(error);
      console.log("google connect error");
      return null;
    }
  };

  const getText = async (extractedText:string) => {
    const mainTextArr = extractedText.split("\n");
    
    for (var i = 0; i < mainTextArr.length; i++) {
      console.log("mainTextArr [" + i + "]" + mainTextArr[i]);
    }
    
    var pos = mainTextArr.indexOf("올바른 문장을 선택해 주세요");
    if (pos == -1) {
      // 사진 다시찍도록 유도 
      console.log("문자 추출 실패");
    }

    console.log("[pos] " + pos);

    var questionText = "";
    var cnt = 1;

    for (var i = pos+1; i < mainTextArr.length; i++) {
      // questionText += cnt + "번:\'" + mainTextArr[i] + "\'\n";
      if (mainTextArr[i].indexOf(".") != -1 && mainTextArr[i].indexOf("LV.") == -1 && cnt < 6) {
        questionText += cnt + "번:\'" + mainTextArr[i] + "\'\n";
        cnt = cnt + 1;
      }
    }

    console.log("questionText is " + questionText);
    // let removeSpace = extractedText

    return questionText;
  }

  return (
    <View style={styles.container}>
      {correctNumber && <Text style={styles.text}>{correctNumber}</Text>}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {/* <Text style={styles.text}>5번. 테스트</Text> */}
      {/* <Button title="사진 찍기" onPress={pickImage} /> */}
      <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
        <Text style={styles.camera}>Capture</Text>      
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  image: {
    width: '90%',
    height: '70%',
    marginTop: 10,
  },
  text: {
    // flex: 1,
    fontSize: 24,
    justifyContent: 'center',
    width: '100%',
    height: '5%',
    textAlign: 'center',
    backgroundColor: 'white',
    // top: '5%'
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
    // height: '10%',
  },
  camera: {
    fontSize: 24,
    color: '#fff', // 버튼 글자색상 추가
    fontWeight: 'bold',
  }

});
