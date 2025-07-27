// src/hooks/useUserTree.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// 관리자 UID (로그인 전에는 이 계정의 트리를 사용)
const DEFAULT_UID = 'lined-admin';

export function useUserTree() {
  const [tree, setTree] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      const uid = firebaseUser?.uid || DEFAULT_UID;
      setUser(firebaseUser);

      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (!snap.exists() && firebaseUser) {
        // 새 유저일 경우 빈 트리 생성
        const newTree = { nodes: [], edges: [], nextId: 1 };
        await setDoc(ref, newTree);
        setTree(newTree);
      } else {
        // 기존 유저의 트리 불러오기
        setTree(snap.data());
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { tree, user, loading };
}
