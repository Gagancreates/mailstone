'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, DocumentData } from 'firebase/firestore';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string>('Checking Firebase connection...');
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [testData, setTestData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    goal: 'Debug Firebase',
    deadline: '01/01/2025',
    frequency: 'weekly',
    tone: 'friendly'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!db) {
          setStatus('❌ Firebase DB not initialized');
          return;
        }
        
        setStatus('✅ Firebase DB initialized');
        
        // Try to read data
        const querySnapshot = await getDocs(collection(db, 'goals'));
        setDocs(querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      } catch (error) {
        console.error('Firebase error:', error);
        setStatus(`❌ Firebase error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkConnection();
  }, []);

  const handleAddTest = async () => {
    setLoading(true);
    try {
      if (!db) {
        setStatus('❌ Cannot add document: Firebase DB not initialized');
        setLoading(false);
        return;
      }

      const day = parseInt(testData.deadline.split('/')[0], 10);
      const month = parseInt(testData.deadline.split('/')[1], 10) - 1;
      const year = parseInt(testData.deadline.split('/')[2], 10);
      const deadlineDate = new Date(year, month, day);
      const deadlineDateISO = deadlineDate.toISOString();

      const docData = {
        name: testData.name,
        email: testData.email,
        goal: testData.goal,
        deadline: deadlineDateISO,
        deadlineDay: day,
        deadlineMonth: month + 1,
        deadlineYear: year,
        frequency: testData.frequency,
        tone: testData.tone,
        status: 'pending',
        lastSent: null,
        nextSend: null,
        completed: false,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'goals'), docData);
      setStatus(`✅ Test document added successfully with ID: ${docRef.id}`);
      
      // Refresh the list
      const querySnapshot = await getDocs(collection(db, 'goals'));
      setDocs(querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    } catch (error) {
      console.error('Error adding document:', error);
      setStatus(`❌ Error adding document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <p className="text-lg">{status}</p>
        
        <div className="mt-4">
          <h3 className="font-semibold">Environment Variables:</h3>
          <p>FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not Set'}</p>
          <p>FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Not Set'}</p>
        </div>
      </div>

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add Test Document</h2>
        <button 
          onClick={handleAddTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Test Document to goals Collection'}
        </button>
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Existing Documents ({docs.length})</h2>
        {docs.length === 0 ? (
          <p>No documents found</p>
        ) : (
          <div className="grid gap-4">
            {docs.map(doc => (
              <div key={doc.id} className="p-3 border rounded">
                <p><strong>ID:</strong> {doc.id}</p>
                <p><strong>Name:</strong> {doc.name}</p>
                <p><strong>Email:</strong> {doc.email}</p>
                <p><strong>Goal:</strong> {doc.goal}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 