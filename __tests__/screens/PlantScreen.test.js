import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PlantScreen from '@/app/(main)/plant';
import { AuthProvider } from '@/context/AuthContext';
import * as router from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
  Stack: { Screen: () => null },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('PlantScreen', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    router.router.push.mockClear();
    router.router.replace.mockClear();
    global.Alert.alert.mockClear();
    AsyncStorage.setItem.mockClear();
  });

  const renderWithProvider = (user = null) => {
    return render(
      <AuthProvider>
        <PlantScreen />
      </AuthProvider>
    );
  };

  it('renders header and search box', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { getByPlaceholderText, getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Plant')).toBeTruthy();
      expect(getByPlaceholderText('Cari nama plant / SN / lokasi')).toBeTruthy();
    });
  });

  it('displays loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));

    const { getByText } = renderWithProvider();

    expect(getByText('Plant')).toBeTruthy();
  });

  it('shows empty state when no plants', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Belum ada plant.')).toBeTruthy();
    });
  });

  it('displays plant list from API', async () => {
    const mockPlants = [
      { id: 1, name: 'Plant A', sn: 'SN-001', location: 'Jakarta', system_type: 'Solar' },
      { id: 2, name: 'Plant B', sn: 'SN-002', location: 'Bandung', system_type: 'Wind' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Plant A')).toBeTruthy();
      expect(getByText('Plant B')).toBeTruthy();
    });
  });

  it('filters plants by name', async () => {
    const mockPlants = [
      { id: 1, name: 'Adit Plant', sn: 'SN-001', location: 'Jakarta', system_type: 'Solar' },
      { id: 2, name: 'Catur Plant', sn: 'SN-002', location: 'Bandung', system_type: 'Wind' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Adit Plant')).toBeTruthy();
      expect(getByText('Catur Plant')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Cari nama plant / SN / lokasi');
    fireEvent.changeText(searchInput, 'Adit');

    await waitFor(() => {
      expect(getByText('Adit Plant')).toBeTruthy();
      expect(queryByText('Catur Plant')).toBeNull();
    });
  });

  it('filters plants by SN', async () => {
    const mockPlants = [
      { id: 1, name: 'Plant A', sn: 'SN-999', location: 'Jakarta', system_type: 'Solar' },
      { id: 2, name: 'Plant B', sn: 'SN-888', location: 'Bandung', system_type: 'Wind' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Plant A')).toBeTruthy();
      expect(getByText('Plant B')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Cari nama plant / SN / lokasi');
    fireEvent.changeText(searchInput, 'SN-999');

    await waitFor(() => {
      expect(getByText('Plant A')).toBeTruthy();
      expect(queryByText('Plant B')).toBeNull();
    });
  });

  it('filters plants by location', async () => {
    const mockPlants = [
      { id: 1, name: 'Plant A', sn: 'SN-001', location: 'Jakarta', system_type: 'Solar' },
      { id: 2, name: 'Plant B', sn: 'SN-002', location: 'Bandung', system_type: 'Wind' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Plant A')).toBeTruthy();
      expect(getByText('Plant B')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Cari nama plant / SN / lokasi');
    fireEvent.changeText(searchInput, 'Jakarta');

    await waitFor(() => {
      expect(getByText('Plant A')).toBeTruthy();
      expect(queryByText('Plant B')).toBeNull();
    });
  });

  it('navigates to plant detail on press', async () => {
    const mockPlants = [
      { id: 1, name: 'TestPlant', sn: 'SN-001', location: 'Jakarta', system_type: 'Solar' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('TestPlant')).toBeTruthy();
    });

    fireEvent.press(getByText('TestPlant'));

    expect(router.router.push).toHaveBeenCalledWith('/plant/TestPlant/overview');
  });

  it('shows error alert on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error fetching plants' }),
    });

    const { getByText } = renderWithProvider();

    await waitFor(() => {
      expect(global.Alert.alert).toHaveBeenCalledWith('Gagal', 'Error fetching plants');
    });
  });

  it('shows error alert on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithProvider();

    await waitFor(() => {
      expect(global.Alert.alert).toHaveBeenCalledWith('Error', 'Terjadi masalah jaringan atau server mati.');
    });
  });

  it('searches with system_type', async () => {
    const mockPlants = [
      { id: 1, name: 'Plant A', sn: 'SN-001', location: 'Jakarta', system_type: 'Solar' },
      { id: 2, name: 'Plant B', sn: 'SN-002', location: 'Bandung', system_type: 'Wind' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Plant A')).toBeTruthy();
      expect(getByText('Plant B')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Cari nama plant / SN / lokasi');
    fireEvent.changeText(searchInput, 'Wind');

    await waitFor(() => {
      expect(queryByText('Plant A')).toBeNull();
      expect(getByText('Plant B')).toBeTruthy();
    });
  });

  it('fetches data on mount', async () => {
    const mockPlants = [{ id: 1, name: 'Plant A', sn: 'SN-001', location: 'Jakarta' }];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    renderWithProvider();

    expect(global.fetch).toHaveBeenCalled();
  });
});
