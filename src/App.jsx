// App.jsx
import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useUserTree } from './hook/useUserTree';

const defaultNodes = [];
const defaultEdges = [];

const STORAGE_KEYS = {
  NODES: 'lined-nodes-v1',
  EDGES: 'lined-edges-v1',
  NEXT_ID: 'lined-next-id-v1',
  LAST_SAVE: 'lined-last-save-v1',
};

const getFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    const parsed = JSON.parse(saved);
    return parsed;
  } catch (error) {
    console.warn(`❌ localStorage 읽기 실패 [${key}]:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    localStorage.setItem(STORAGE_KEYS.LAST_SAVE, new Date().toISOString());
    return true;
  } catch (error) {
    console.warn(`❌ localStorage 쓰기 실패 [${key}]:`, error);
    return false;
  }
};

export default function App() {
  const { tree: firestoreTree, user: firestoreUser, loading } = useUserTree();
  const [user, setUser] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [bookTitle, setBookTitle] = useState('');
  const [nextId, setNextId] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [lastSaved, setLastSaved] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.LAST_SAVE)
  );
  
  // 다크모드 감지 - 더 강력한 감지
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 다크모드 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (firestoreUser) setUser(firestoreUser);
  }, [firestoreUser]);

  useEffect(() => {
    if (!loading && firestoreTree) {
      setNodes(firestoreTree.nodes || []);
      setEdges(firestoreTree.edges || []);
      setNextId(firestoreTree.nextId || 1);
    }
  }, [loading, firestoreTree]);

  const saveData = useCallback(async (newNodes, newEdges, newNextId) => {
    const success1 = saveToStorage(STORAGE_KEYS.NODES, newNodes);
    const success2 = saveToStorage(STORAGE_KEYS.EDGES, newEdges);
    const success3 = saveToStorage(STORAGE_KEYS.NEXT_ID, newNextId);

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          nodes: newNodes,
          edges: newEdges,
          nextId: newNextId,
        });
        console.log('✅ Firestore에 저장됨');
      } catch (e) {
        console.error('❌ Firestore 저장 실패:', e);
      }
    }

    if (success1 && success2 && success3) {
      setLastSaved(new Date().toISOString());
    }
  }, [user]);

  useEffect(() => {
    if (nodes.length > 0) {
      saveData(nodes, edges, nextId);
    }
  }, [nodes, edges, nextId, saveData]);

  const onNodesChange = useCallback(
    (changes) => setNodes((prev) => applyNodeChanges(changes, prev)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((prev) => applyEdgeChanges(changes, prev)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((prev) => addEdge(params, prev)),
    []
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNodeId((prevId) => (prevId === node.id ? null : node.id));
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          style: {
            border: isDarkMode ? '2px solid #666' : '2px solid #999',
            backgroundColor: n.id === node.id && selectedNodeId !== node.id 
              ? (isDarkMode ? '#404040' : '#e0e0e0') 
              : (isDarkMode ? '#2d2d2d' : '#ffffff'),
            color: isDarkMode ? '#ffffff' : '#000000',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }))
      );
    },
    [selectedNodeId, isDarkMode]
  );

  const createNewNode = (label) => ({
    id: nextId.toString(),
    position: {
      x: 100 * nextId,
      y: 100 + (nextId % 5) * 80,
    },
    data: { label },
    style: { 
      border: isDarkMode ? '2px solid #666' : '2px solid #999',
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });

  const findNodeByLabel = (label) =>
    nodes.find((node) => node.data.label === label);

  const onAddNode = () => {
    if (!bookTitle.trim() || !selectedNodeId || !user) return;

    const existingNode = findNodeByLabel(bookTitle);

    if (existingNode) {
      const newEdge = {
        id: `${selectedNodeId}-${existingNode.id}`,
        source: selectedNodeId,
        target: existingNode.id,
      };
      setEdges((prev) => [...prev, newEdge]);
    } else {
      const newNode = createNewNode(bookTitle);
      const newEdge = {
        id: `${selectedNodeId}-${newNode.id}`,
        source: selectedNodeId,
        target: newNode.id,
      };
      setNodes((prev) => [...prev, newNode]);
      setEdges((prev) => [...prev, newEdge]);
      setNextId((id) => id + 1);
    }

    setBookTitle('');
  };

  const onAddRootNode = () => {
    if (!bookTitle.trim() || !user) return;

    const existingNode = findNodeByLabel(bookTitle);
    if (existingNode) return;

    const newNode = createNewNode(bookTitle);
    setNodes((prev) => [...prev, newNode]);
    setNextId((id) => id + 1);
    setBookTitle('');
    setSelectedNodeId(null);
  };

  const clearAll = async () => {
    if (!user) {
      alert('로그인 후 삭제할 수 있습니다.');
      return;
    }
    if (window.confirm('모든 데이터를 삭제하시겠습니까?')) {
      setNodes(defaultNodes);
      setEdges(defaultEdges);
      setNextId(1);
      setSelectedNodeId(null);
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      setLastSaved(null);
      try {
        await setDoc(doc(db, 'users', user.uid), {
          nodes: [],
          edges: [],
          nextId: 1,
        });
        console.log('✅ Firestore 데이터 초기화 완료');
      } catch (e) {
        console.error('❌ Firestore 초기화 실패:', e);
      }
    }
  };

  const formatLastSaved = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div
        style={{
          padding: 10,
          background: '#f0f0f0',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: '14px',
        }}
      >
        {user && (
          <>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' &&
                (selectedNodeId ? onAddNode() : onAddRootNode())
              }
              placeholder="책 제목을 입력하세요"
              style={{ padding: 8, flex: '1 1 200px', minWidth: '200px' }}
            />
            <button onClick={onAddNode} disabled={!bookTitle.trim() || !selectedNodeId}>
              선택한 노드에 연결
            </button>
            <button onClick={onAddRootNode} disabled={!bookTitle.trim()}>
              📍 출발점 추가
            </button>
            <button onClick={clearAll} style={{ backgroundColor: '#ff4444', color: 'white' }}>
              🗑️ 전체 삭제
            </button>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            노드: {nodes.length}개 | 마지막 저장: {formatLastSaved(lastSaved)}
          </div>
          {user ? (
            <>
              <span style={{ fontSize: '12px' }}>👤 {user.displayName}</span>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <button onClick={handleLogin}>Google 로그인</button>
          )}
        </div>
      </div>

      <div style={{ width: '100vw', height: 'calc(100vh - 70px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        />
      </div>
    </>
  );
}