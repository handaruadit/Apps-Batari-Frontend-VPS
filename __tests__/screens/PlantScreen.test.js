//===== (Imports) ======
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import PlantScreen from '@/app/(home)/plant';
import { AuthProvider } from '@/context/AuthContext';
import { AppSettingsProvider } from '@/context/AppSettingsContext';
import { fetchPlants } from '@/services/plantService';
import { router } from 'expo-router';

//===== (Mocks) ======
jest.mock('@/services/plantService', () => ({
  DEMO_PLANT_NAME: 'Plant Testing',
  deletePlant: jest.fn(async () => undefined),
  fetchPlants: jest.fn(),
  isDemoPlant: jest.fn((plant) => plant?.name === 'Plant Testing'),
}));

jest.mock('@/features/home/utils/plantStatus', () => ({
  attachLatestDeviceTimestamps: jest.fn(async (plants) => plants),
}));

jest.mock('@/components/DeviceCard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockDeviceCard({ device, onPress }) {
    return (
      <Pressable onPress={() => onPress(device)}>
        <Text>{device.name}</Text>
      </Pressable>
    );
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

//===== (renderPlantScreen) ======
function renderPlantScreen() {
  return render(
    <AppSettingsProvider>
      <AuthProvider>
        <PlantScreen />
      </AuthProvider>
    </AppSettingsProvider>,
  );
}

//===== (Plant Screen Tests) ======
describe('PlantScreen', () => {
  beforeEach(() => {
    fetchPlants.mockReset();
    router.push.mockClear();
    router.replace.mockClear();
  });

  it('renders plants returned by the service', async () => {
    fetchPlants.mockResolvedValue([
      { id: 1, name: 'Plant Jakarta', location: 'Jakarta' },
    ]);
    const screen = renderPlantScreen();

    await waitFor(() => expect(screen.getByText('Plant Jakarta')).toBeTruthy());
    expect(fetchPlants).toHaveBeenCalled();
  });

  it('filters the rendered plant list', async () => {
    fetchPlants.mockResolvedValue([
      { id: 1, name: 'Plant Jakarta', location: 'Jakarta' },
      { id: 2, name: 'Plant Bandung', location: 'Bandung' },
    ]);
    const screen = renderPlantScreen();
    await waitFor(() => expect(screen.getByText('Plant Jakarta')).toBeTruthy());

    fireEvent.changeText(
      screen.getByPlaceholderText('Search Plant Name/SN/Location'),
      'Bandung',
    );

    expect(screen.queryByText('Plant Jakarta')).toBeNull();
    expect(screen.getByText('Plant Bandung')).toBeTruthy();
  });

  it('opens the existing overview route when a plant is pressed', async () => {
    fetchPlants.mockResolvedValue([{ id: 7, name: 'Plant Tujuh' }]);
    const screen = renderPlantScreen();
    await waitFor(() => expect(screen.getByText('Plant Tujuh')).toBeTruthy());

    fireEvent.press(screen.getByText('Plant Tujuh'));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/plant/7/overview'),
    );
  });
});
