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
