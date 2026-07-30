//===== (Imports) ======
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/app/(auth)/login';
import { AuthProvider } from '@/context/AuthContext';
import { login as loginUser } from '@/features/auth/services/authService';
import { saveToken, saveUserInfo, setRememberMe } from '@/auth/token';
import { getRememberedAccounts } from '@/auth/rememberedAccounts';
import { checkAppUpdate } from '@/services/updateService';
import { router } from 'expo-router';

//===== (Mocks) ======
jest.mock('@/features/auth/services/authService', () => ({
  login: jest.fn(),
}));

jest.mock('@/auth/token', () => ({
  clearAuth: jest.fn(async () => undefined),
  getUserFromToken: jest.fn(() => null),
  saveToken: jest.fn(async () => undefined),
  saveUserInfo: jest.fn(async () => undefined),
  setRememberMe: jest.fn(async () => undefined),
}));

jest.mock('@/auth/rememberedAccounts', () => ({
  getRememberedAccounts: jest.fn(async () => []),
  getRememberedPassword: jest.fn(async () => ''),
  saveRememberedAccount: jest.fn(async () => undefined),
}));

jest.mock('@/services/updateService', () => ({
  checkAppUpdate: jest.fn(async () => undefined),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
  Stack: { Screen: () => null },
}));

//===== (renderLogin) ======
function renderLogin() {
  return render(
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>,
  );
}

//===== (Login Screen Tests) ======
describe('LoginScreen', () => {
  beforeEach(() => {
    loginUser.mockReset();
    saveToken.mockClear();
    saveUserInfo.mockClear();
    setRememberMe.mockClear();
    getRememberedAccounts.mockClear();
    getRememberedAccounts.mockResolvedValue([]);
    checkAppUpdate.mockClear();
    router.push.mockClear();
    router.replace.mockClear();
    global.Alert.alert.mockClear();
  });

  it('renders the current login controls', async () => {
    const screen = renderLogin();

    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByPlaceholderText('batari@gmail.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('password')).toBeTruthy();
    expect(screen.getByText('Log In')).toBeTruthy();
    await waitFor(() => expect(checkAppUpdate).toHaveBeenCalledTimes(1));
  });

  it('keeps the required-field validation', async () => {
    const screen = renderLogin();

    await waitFor(() =>
      expect(getRememberedAccounts).toHaveBeenCalledTimes(1),
    );

    fireEvent.press(screen.getByText('Log In'));

    expect(global.Alert.alert).toHaveBeenCalledWith(
      'Login gagal',
      'Email dan password harus diisi.',
    );
    expect(loginUser).not.toHaveBeenCalled();
  });

  it('stores a successful session and opens the plant screen', async () => {
    loginUser.mockResolvedValue({
      response: { ok: true },
      data: {
        status: 'success',
        token: 'valid-token',
        user: { id: 1, email: 'user@example.com' },
      },
    });
    const screen = renderLogin();

    fireEvent.changeText(
      screen.getByPlaceholderText('batari@gmail.com'),
      'user@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('password'), 'secret');
    fireEvent.press(screen.getByText('Log In'));

    await waitFor(() => expect(loginUser).toHaveBeenCalledTimes(1));
    expect(saveToken).toHaveBeenCalledWith('valid-token');
    expect(setRememberMe).toHaveBeenCalledWith(false);
    expect(saveUserInfo).toHaveBeenCalledWith({
      id: 1,
      email: 'user@example.com',
    });
    expect(router.replace).toHaveBeenCalledWith('/(home)/plant');
  });
});
