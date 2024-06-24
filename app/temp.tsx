import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import axios from 'axios';

const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyD3ebphLLTT1vyE_CGfCqZC_xr5MjJSGBk';
const CHAT_GPT_API_KEY = 'sk-proj-EkhHFnDR8dscxpch7e3OT3BlbkFJAlmlNd37OoGA7V3AJIpE';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [response, setResponse] = useState('');
  // const cameraRef = useRef(null);
  const cameraRef = useRef(null);

  const [isModal, setIsModal] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isCamera, setIsCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  var [correctNumber, setCorrectNumber] = useState('');
  // var correctNumber = null;

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function activeCamera() {
    console.log("isCamera is " + isCamera);
    setIsCamera(true);
    setIsImage(false);
    setIsModal(false);
    console.log("isCamera is " + isCamera);
  }

  const analyzeImage = async (base64Image: string) => {
    // console.log("analyzeImage is " + base64Image);
    console.log("GOOGLE_CLOUD_VISION_API_KEY is " + GOOGLE_CLOUD_VISION_API_KEY);
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

      
      console.log("response Block is " + response.data.responses[0].fullTextAnnotation.Block);
      
      
      return response.data.responses[0].fullTextAnnotation.text;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const takePicture = async () => {
    // setIsCamera(false);
    setIsLoading(true);
    
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      let photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

      // console.log("photo is " + photo.uri);
      setPhoto(photo.uri);
      setIsImage(true);
      //await MediaLibrary.createAssetAsync(photo.uri); // 앨범저장

      const detectedText = await analyzeImage(photo.base64);
      console.log(detectedText); // 콘솔에 추출된 텍스트 출력

      const requestText = await getText(detectedText);

      var responseText = await checkGrammer(requestText);
      console.log("responseText is " + responseText);
      
      // correctNumber = responseText[0] + responseText[1];

      // const temp = responseText.match("/[1-5][번]/g");
      const extractedResponseText = /[1-5][번]/.exec(responseText);
      console.log("temp is " + extractedResponseText);

      // setCorrectNumber(extractedResponseText);
      setCorrectNumber(responseText);
      // correctNumber = extractedResponseText;
      
      console.log("correctNumber is " + correctNumber)

      setIsModal(true);
      
    }
    setIsLoading(false);
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
    // for (var i = pos+1; i < pos+1+5; i++) {
    //   questionText += cnt + "번:\'" + mainTextArr[i] + "\'\n";
    //   cnt = cnt + 1;
    // }

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

  const checkGrammer = async (questionText:string) => {
    // const requestQuestionText = questionText + "1~5번중에 맞춤법, 뛰어쓰기, 문법이 맞는 말이 뭐야? 정답 번호만 알려줘.";
    const requestQuestionText = questionText + "1~5번중에 맞춤법, 뛰어쓰기, 문법이 맞는 말이 뭐야? 정답 번호와 문장만 알려줘. 설명은 하지마.";

    console.log("requestQuestionText is " + requestQuestionText);

    try {
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [{ role: 'system', content: '당신은 한국어 문법 전문가입니다.' },{ role: 'user', content: requestQuestionText }],
        },
        {
          headers: {
            Authorization: 'Bearer ' + CHAT_GPT_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      // setResponse(result.data.choices[0].message.content);
      console.log("result.data.choices[0].message.content is " + result.data.choices[0].message.content);
      return result.data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      // setResponse('Error: Unable to get response from ChatGPT');
    }
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
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
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
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'white',
    height: '10%',
    top: '5%'
    // flex:1,
  },
  preview: {
    flex: 1,
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
    // alignSelf: 'flex-end',
    alignItems: 'center',
    // left: '80%',
    // height: '20%',
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