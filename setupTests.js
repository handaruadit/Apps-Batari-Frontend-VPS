//===== (AsyncStorage Mock) ======
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

//===== (SecureStore Mock) ======
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

//===== (AuthSession Mock) ======
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'mock-redirect-uri'),
}));
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));


//===== (Notifications Mock) ======
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => ({})),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'notif-123'),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3 },
  AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
}));

//===== (Vector Icons Mock) ======
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = (props) => React.createElement('MockIcon', props);

  return {
    AntDesign: MockIcon,
    Feather: MockIcon,
    FontAwesome: MockIcon,
    FontAwesome5: MockIcon,
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    MaterialIcons: MockIcon,
  };
});

//===== (Global Mocks) ======
const { Alert } = require('react-native');

Alert.alert = jest.fn();
global.Alert = Alert;
global.fetch = jest.fn();
