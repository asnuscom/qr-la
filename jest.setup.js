// Mock window methods in test env
if (typeof window !== 'undefined') {
  window.addEventListener = window.addEventListener || jest.fn();
  window.removeEventListener = window.removeEventListener || jest.fn();
  window.dispatchEvent = window.dispatchEvent || jest.fn();
}

// Mock qrcode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mockqr')),
  toString: jest.fn(() => Promise.resolve('<svg>mock</svg>')),
  create: jest.fn(() => ({
    modules: {
      size: 21,
      data: new Uint8Array(21 * 21).fill(1),
      get: (r, c) => true,
    },
  })),
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: () => true,
  setParams: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ slug: 'test-slug', id: 'test-id' }),
  useSegments: () => ['test'],
  usePathname: () => '/',
  Link: ({ children }) => children,
  Redirect: () => null,
  useFocusEffect: (cb) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
  router: mockRouter,
}));

// Mock expo-head
jest.mock('expo-router/head', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  MediaTypeOptions: {
    All: 'All',
    Images: 'Images',
    Videos: 'Videos',
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-id')),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[mock]' })),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    SafeAreaView: ({ children, ...props }) => React.createElement('View', props, children),
  };
});

// Mock AsyncStorage / App Storage
jest.mock('@/services/storage', () => {
  const store = {};
  return {
    appStorage: {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = String(value);
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
      }),
    },
  };
});

// Mock Firebase
jest.mock('@/services/firebase', () => ({
  db: {},
  auth: { currentUser: null },
  storage: {},
  isRealFirebaseConfigured: true,
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'mock-user-id', email: 'test@qr-la.com' } })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'mock-user-id', email: 'test@qr-la.com' } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null);
    return () => {};
  }),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(() => ({})),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('https://mock-storage.url/photo.jpg')),
}));

// Mock Firestore methods
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  initializeFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  getDocs: jest.fn(() => Promise.resolve({ empty: true, docs: [], size: 0 })),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  increment: jest.fn((n) => n),
  arrayUnion: jest.fn((...items) => items),
  arrayRemove: jest.fn((...items) => items),
  serverTimestamp: jest.fn(() => new Date().toISOString()),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  onSnapshot: jest.fn((ref, callback) => {
    return () => {};
  }),
}));

