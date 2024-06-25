import axios from 'axios';
import * as Device from 'expo-device';
import * as SecureStore from "expo-secure-store";

export const getFirstCertify = async (userName:string) => {

    try {
        const name = userName;
        const brand = Device.brand;
        const modelName = Device.modelName;
        const manufacturer = Device.manufacturer;   

        const response = await axios.post(
            'https://vision-427210.as.r.appspot.com/app/first',
            {
                name: name,
                brand: brand,
                modelName: modelName,
                manufacturer: manufacturer
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const appId = response.data.appId;
        await SecureStore.setItemAsync("appId", appId);
        await SecureStore.deleteItemAsync("grant");
    } catch (e) {
        console.log("error" + e);
    }
}

export const checkGrammerApi = async (questionText:string) => {

    try {
        const appId = await SecureStore.getItemAsync("appId");
        
        console.log("appid : " + appId);
        console.log("questionText : " + questionText);

        const response = await axios.post(
            'https://vision-427210.as.r.appspot.com/grammar/check',
            {
                appId: appId,
                questionText: questionText
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("[checkGrammer]" + response.data.result);
        console.log("[checkGrammer]" + response.data.correct);

        if (response == null) {
            return "Connect server fail";
        } else if (response.data.result == "NO_USER") {
            SecureStore.deleteItemAsync("appId");
            SecureStore.deleteItemAsync("grant");
            
            return "You are not a registered user";
        } else if (response.data.result == "SUCCESS") {
            return response.data.correct;
        } else if (response.data.result == "NO_GRANT") {
            return "You don't have permission";
        } else {
            return "Connect server fail";
        }
    } catch (e) {
        console.log("error" + e);
    }
}

const getGrant = async (appId:string) => {
    try {
        const response = await axios.post(
            'https://vision-427210.as.r.appspot.com/app/certify',
            {
                appId: appId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const result = response.data.result;
        console.log("result is " + result);

        if (result == "PERMISION_GRANT") {
            await SecureStore.setItemAsync("grant", "PERMISSION");
            return "PERMISSION";
        } else if (result == "NO_USER") {
            SecureStore.deleteItemAsync("appId");
            SecureStore.deleteItemAsync("grant");
        } else {
            return "NO_GRANT";
        }
        
    } catch (e) {
        return false;
    }
}

export const checkingAppId = async () => {
    const appId = await SecureStore.getItemAsync("appId");
    const grant = await SecureStore.getItemAsync("grant");
    console.log("appId is " + appId + " grant is " + grant);

    if (appId == null || appId == "") {
        // 인증아이디 없을떄 - 서버 등록 요청
        
        return "NOT_EXIST_APPID";
    } else {
        // 권한 확인.
        if (grant == "PERMISSION") {
            return "PERMISSION";
        } else {
            return await getGrant(appId);
        }
    }
}