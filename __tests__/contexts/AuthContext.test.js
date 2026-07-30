//===== (Imports) ======
import React, { useContext } from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { clearAuth } from '@/auth/token';
import { router } from 'expo-router';

//===== (Mocks) ======
jest.mock('@/auth/token', () => ({
  clearAuth: jest.fn(async () => undefined),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

//===== (ContextConsumer) ======
function ContextConsumer() {
  const context = useContext(AuthContext);

  return (
    <>
      <Text testID='user'>{context.user?.name || 'no-user'}</Text>
      <Text testID='device'>{context.selectedDevice?.name || 'no-device'}</Text>
      <Text testID='plant-count'>{String(context.plant.length)}</Text>
      <Pressable onPress={() => context.setUser({ name: 'User Baru' })}>
        <Text>set-user</Text>
      </Pressable>
      <Pressable onPress={() => context.setSelectedDevice({ name: 'Device Baru' })}>
        <Text>set-device</Text>
      </Pressable>
      <Pressable onPress={() => context.setPlant([{ id: 1 }])}>
        <Text>set-plant</Text>
      </Pressable>
      <Pressable onPress={context.logout}>
        <Text>logout</Text>
      </Pressable>
    </>
  );
}

//===== (renderContext) ======
function renderContext() {
  return render(
    <AuthProvider>
      <ContextConsumer />
    </AuthProvider>,
  );
}

//===== (AuthContext Tests) ======
describe('AuthContext', () => {
  beforeEach(() => {
    clearAuth.mockClear();
    router.replace.mockClear();
  });

  it('provides the current default state', () => {
    const screen = renderContext();

    expect(screen.getByTestId('user').props.children).toBe('no-user');
    expect(screen.getByTestId('device').props.children).toBe('no-device');
    expect(screen.getByTestId('plant-count').props.children).toBe('0');
  });

  it('updates user, selected device, and plant state', () => {
    const screen = renderContext();

    fireEvent.press(screen.getByText('set-user'));
    fireEvent.press(screen.getByText('set-device'));
    fireEvent.press(screen.getByText('set-plant'));

    expect(screen.getByTestId('user').props.children).toBe('User Baru');
    expect(screen.getByTestId('device').props.children).toBe('Device Baru');
    expect(screen.getByTestId('plant-count').props.children).toBe('1');
  });

  it('clears auth state and returns to login', async () => {
    const screen = renderContext();

    fireEvent.press(screen.getByText('logout'));

    await waitFor(() => expect(clearAuth).toHaveBeenCalledTimes(1));
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
