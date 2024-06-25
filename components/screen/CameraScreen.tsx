import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ToastAndroid, BackHandler } from 'react-native';
import { checkGrammerApi } from '../restApi/visionGrammarServer'
import axios from 'axios';

const GOOGLE_CLOUD_VISION_API_KEY = '';
const DOUBLE_PRESS_DELAY = 2000;

export default function CameraScreen({ navigation } : {navigation: any}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  const [isModal, setIsModal] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isCamera, setIsCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  var [correctNumber, setCorrectNumber] = useState('');

  const [lastBackPressed, setLastBackPressed] = useState(0);

  // 뒤로가기 막기
  useFocusEffect(
    useCallback(() => {
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


  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    // setIsCamera(false);
    setIsLoading(true);
    
    if (cameraRef.current) {
      const options = { quality: 1, base64: true };
      let photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });

      setIsCamera(false);
      setPhoto(photo.uri);
      setIsImage(true);

      const detectedText = await analyzeImage(photo.base64);

      const requestText = await getText(detectedText);

      var responseText = await checkGrammerApi(requestText);
      
      const extractedResponseText = /[1-5][번]/.exec(responseText);

      setCorrectNumber(responseText);
    
      setIsModal(true);
    }
    setIsLoading(false);
  };

  const analyzeImage = async (base64Image: string) => {
    try {
       const response = await axios.post(
        'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY,
        {
          requests: [
            {
              image: {
                content: base64Image,
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

    // console.log("[pos] " + pos);

    var questionText = "";
    var cnt = 1;

    for (var i = pos+1; i < mainTextArr.length; i++) {
      // questionText += cnt + "번:\'" + mainTextArr[i] + "\'\n";
      if (mainTextArr[i].indexOf(".") != -1 && mainTextArr[i].indexOf("LV.") == -1 && cnt < 6) {

        questionText += cnt + "번:\'" + mainTextArr[i].replaceAll("..", ".") + "\'\n";
        cnt = cnt + 1;
      }
    }

    // console.log("questionText is " + questionText);
    // let removeSpace = extractedText

    return questionText;
  }

  function activeCamera() {
    setIsCamera(true);
    setIsImage(false);
    setIsModal(false);
  }

  return (
    <View style={styles.container}>
      {isCamera && (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Click!</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      {isModal && (
        <View style={styles.modal}>
          <Text style={styles.modalText}>{correctNumber}</Text>
          {isImage && (
            <Image source={{ uri: photo }} style={styles.preview} />
          )}
          <TouchableOpacity style={styles.activeCameraButton} onPress={activeCamera}>
            <Text style={styles.activeCamera}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLoading && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Checking...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,

  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    // backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    // alignItems: 'center',
    alignItems: 'center',
    bottom: '5%',
    backgroundColor: '#3498db', // 버튼 배경색상 추가
    // borderWidth: 4,
    // borderBlockColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    // padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    // width: '70%',
    // height: 50,
    justifyContent: 'center',

  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  photo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modal: {
    // flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    // backgroundColor: 'black'
  },
  modalText: {
    marginTop: 20,
    fontSize: 20,
    textAlign: 'center',
    // backgroundColor: 'white',
    backgroundColor: '#3498db',
    // height: '10%',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,

    color: '#fff', // 버튼 글자색상 추가
    // fontWeight: 'bold',
    // top: '5%'
    // flex:1,
  },
  preview: {
    flex: 1,
    resizeMode: "contain",
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
  activeCameraButton: {
    alignItems: 'center',
    bottom: '5%',
    backgroundColor: '#3498db', // 버튼 배경색상 추가
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  activeCamera: {
    fontSize: 24,
    color: '#fff', // 버튼 글자색상 추가
    fontWeight: 'bold',
  }
});
