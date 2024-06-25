import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import CheckingVerifyScreen from '../components/screen/CheckingVerifyScreen';
import NotGrantScreen from '../components/screen/NotGrantScreen';
import NotExistAppIdScreen from '../components/screen/NotExistAppIdScreen';
import CameraScreen from '../components/screen/CameraScreen';
import ImagePickerScreen from '../components/screen/ImagePickerScreen'

function CustomTabBar({ navigation } : {navigation: any}) {
  return (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('camera')}>
        <Text style={styles.tabText}>Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('picker')}>
        <Text style={styles.tabText}>Picker</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {  
  
  return (
      <Stack.Navigator initialRouteName='first'>  
        <Stack.Screen name='checkingVerify' component={CheckingVerifyScreen} options={{ title:"main", headerTitleAlign:'center', headerBackVisible: false, gestureEnabled: false}}/>
        <Stack.Screen name='notGrant' component={NotGrantScreen} options={{ title:"Permission denied", headerTitleAlign:'center', headerBackVisible: false, gestureEnabled: false}} />
        <Stack.Screen name='notExistAppId' component={NotExistAppIdScreen} options={{ title: "Permission Request Page", headerTitleAlign:'center', headerBackVisible: false, gestureEnabled: false}}/>
        <Stack.Screen name='camera' component={CameraScreen} options={{ title: "Camera", headerTitleAlign:'center', headerBackVisible: false, gestureEnabled: false, header: ({ navigation }) => <CustomTabBar navigation={navigation} />}}/>
        <Stack.Screen name='picker' component={ImagePickerScreen} options={{ title: "Picker", headerTitleAlign:'center', headerBackVisible: false, gestureEnabled: false, header: ({ navigation }) => <CustomTabBar navigation={navigation} />}}/>
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
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingTop: 20,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});