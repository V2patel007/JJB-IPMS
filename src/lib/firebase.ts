import React from 'react';

// Mock types to match Firebase SDK
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Local Storage Helper
const STORAGE_KEY = 'brick_store_demo_data';

const getStoredData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  
  // Seed initial data if empty
  const initialData = {
    projects: [
      {
        id: 'p1',
        name: 'The Grand Heights',
        description: 'A luxury residential complex using premium red bricks.',
        location: { city: 'New York', state: 'NY', country: 'USA' },
        projectType: 'Residential',
        brickType: 'Premium Red',
        images: ['https://picsum.photos/seed/p1/800/600'],
        status: 'PUBLISHED',
        submittedBy: 'demo-user',
        builderName: 'Skyline Builders',
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'p2',
        name: 'Tech Hub Plaza',
        description: 'Modern office space with industrial grey brick finish.',
        location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        projectType: 'Commercial',
        brickType: 'Industrial Grey',
        images: ['https://picsum.photos/seed/p2/800/600'],
        status: 'PENDING_ADMIN',
        submittedBy: 'demo-user',
        builderName: 'TechBuild Inc',
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'p3',
        name: 'Riverside Villas',
        description: 'Eco-friendly villas using sustainable clay bricks.',
        location: { city: 'Austin', state: 'TX', country: 'USA' },
        projectType: 'Residential',
        brickType: 'Eco Clay',
        images: ['https://picsum.photos/seed/p3/800/600'],
        status: 'PENDING_SUPERADMIN',
        submittedBy: 'demo-user',
        builderName: 'Green Homes',
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        lastUpdatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    ],
    users: [],
    brickTypes: [
      { id: 'bt1', name: 'Premium Red', description: 'Classic high-strength red clay brick.' },
      { id: 'bt2', name: 'Industrial Grey', description: 'Modern grey finish for commercial projects.' },
      { id: 'bt3', name: 'Eco Clay', description: 'Sustainable and eco-friendly clay brick.' },
      { id: 'bt4', name: 'Fly Ash Brick', description: 'Lightweight and durable ash-based brick.' },
    ],
    projectTypes: [
      { id: 'pt1', name: 'Residential' },
      { id: 'pt2', name: 'Commercial' },
      { id: 'pt3', name: 'Industrial' },
      { id: 'pt4', name: 'Institutional' },
    ],
    userRequests: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

const saveStoredData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Trigger a custom event for "real-time" updates in the same tab
  window.dispatchEvent(new Event('demo-data-updated'));
};

// Helper to mock Firestore Timestamp
const wrapData = (data: any) => {
  if (!data) return data;
  const wrapped = { ...data };
  Object.keys(wrapped).forEach(key => {
    const val = wrapped[key];
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/)) {
      wrapped[key] = {
        toDate: () => new Date(val),
        toISOString: () => val,
        toMillis: () => new Date(val).getTime()
      };
    }
  });
  return wrapped;
};

// Mock Auth
export const auth = {
  currentUser: null as any,
  onAuthStateChanged: (callback: (user: any) => void) => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('demo_user') || 'null');
      auth.currentUser = user;
      callback(user);
    };
    checkAuth();
    window.addEventListener('demo-auth-updated', checkAuth);
    return () => window.removeEventListener('demo-auth-updated', checkAuth);
  },
  signInWithPopup: async () => {
    // This will be handled in the UI
    return { user: { uid: 'demo-user', email: 'demo@example.com' } };
  },
  signOut: async () => {
    localStorage.removeItem('demo_user');
    window.dispatchEvent(new Event('demo-auth-updated'));
  }
};

// Mock Firestore
export const db = {} as any;
export const storage = {} as any;

export const collection = (db: any, path: string) => ({ path });
export const doc = (db: any, path: string, id: string) => ({ path, id });

export const query = (col: any, ...constraints: any[]) => ({ col, constraints });
export const where = (field: string, op: string, value: any) => ({ field, op, value });
export const orderBy = (field: string, dir: string = 'asc') => ({ field, dir });

export const getDoc = async (docRef: any) => {
  const store = getStoredData();
  const collection = store[docRef.path] || [];
  const data = collection.find((d: any) => d.id === docRef.id);
  return {
    id: docRef.id,
    exists: () => !!data,
    data: () => wrapData(data)
  };
};

export const addDoc = async (col: any, data: any) => {
  const store = getStoredData();
  const id = Math.random().toString(36).substr(2, 9);
  const newDoc = { ...data, id, createdAt: new Date().toISOString() };
  
  if (!store[col.path]) store[col.path] = [];
  store[col.path].push(newDoc);
  
  saveStoredData(store);
  return { id };
};

export const updateDoc = async (docRef: any, data: any) => {
  const store = getStoredData();
  const collection = store[docRef.path] || [];
  const index = collection.findIndex((d: any) => d.id === docRef.id);
  
  if (index !== -1) {
    collection[index] = { ...collection[index], ...data, updatedAt: new Date().toISOString() };
    saveStoredData(store);
  }
};

export const deleteDoc = async (docRef: any) => {
  const store = getStoredData();
  const collection = store[docRef.path] || [];
  store[docRef.path] = collection.filter((d: any) => d.id !== docRef.id);
  saveStoredData(store);
};

export const onSnapshot = (q: any, callback: (snapshot: any) => void, errorCallback?: (err: any) => void) => {
  const update = () => {
    const store = getStoredData();
    let data = store[q.col?.path || q.path] || [];
    
    // Simple filtering for mock
    if (q.constraints) {
      q.constraints.forEach((c: any) => {
        if (c.field && c.op === '==') {
          data = data.filter((d: any) => d[c.field] === c.value);
        }
      });
    }
    
    callback({
      docs: data.map((d: any) => ({
        id: d.id,
        data: () => wrapData(d),
        exists: () => true
      }))
    });
  };

  update();
  window.addEventListener('demo-data-updated', update);
  return () => window.removeEventListener('demo-data-updated', update);
};

export const serverTimestamp = () => new Date().toISOString();

// Mock Storage
export const ref = (storage: any, path: string) => ({ path });
export const uploadBytes = async (ref: any, file: File) => {
  // In demo mode, we just return a fake URL
  return { ref };
};
export const getDownloadURL = async (ref: any) => {
  // Return a consistent image based on the path or random
  return `https://picsum.photos/seed/${Math.random()}/800/600`;
};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Mock Firestore Error [${operationType}] on ${path}:`, error);
}
