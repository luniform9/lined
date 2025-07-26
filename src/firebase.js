// Firebase 설정 파일
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 콘솔에서 복사한 설정 정보를 여기에 붙여넣으세요
const firebaseConfig = {
    apiKey: "AIzaSyC_VR_p3Nl3WFHNGg_Umv4uhxcsNmxABK8",
    authDomain: "lined-8f7e3.firebaseapp.com",
    projectId: "lined-8f7e3",
    storageBucket: "lined-8f7e3.firebasestorage.app",
    messagingSenderId: "1056067314239",
    appId: "1:1056067314239:web:e04b7f632ab82a75d4ce8a"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;