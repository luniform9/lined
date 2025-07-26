import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError(error.message);
    }
  };

  // 이메일/비밀번호 로그인
  const signInWithEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // 로그아웃
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.5em' }}>
          📚 BookPath
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', opacity: 0.9 }}>
          책과 책 사이의 연결을 발견하세요
        </p>

        {/* Google 로그인 */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '20px',
            border: 'none',
            borderRadius: '10px',
            background: 'white',
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          🔍 Google로 로그인
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0', opacity: 0.7 }}>
          또는
        </div>

        {/* 이메일/비밀번호 로그인 */}
        <form onSubmit={signInWithEmail}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              marginBottom: '15px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              marginBottom: '20px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              marginBottom: '15px',
              border: 'none',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            background: 'transparent',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            opacity: 0.8
          }}
        >
          {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
        </button>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: 'rgba(255, 0, 0, 0.2)',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            오류: {error}
          </div>
        )}
      </div>
    </div>
  );
}