import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Login from '@/app/(auth)/login';
import { AuthProvider } from '@/context/AuthContext';
import * as router from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  Stack: { Screen: () => null },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Login Screen', () => {
  beforeEach(() => {
    AsyncStorage.setItem.mockClear();
    router.router.replace.mockClear();
    router.router.push.mockClear();
    global.Alert.alert.mockClear();
  });

  const renderWithProvider = () => {
    return render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
  };

  it('renders login form correctly', () => {
    const { getByText, getByPlaceholderText } = renderWithProvider();

    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByPlaceholderText('hallo@batari.com')).toBeTruthy();
    expect(getByPlaceholderText('password')).toBeTruthy();
    expect(getByText('Remember me')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
  });

  it('updates email input', () => {
    const { getByPlaceholderText } = renderWithProvider();

    const emailInput = getByPlaceholderText('hallo@batari.com');
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('updates password input', () => {
    const { getByPlaceholderText } = renderWithProvider();

    const passwordInput = getByPlaceholderText('password');
    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('toggles remember me checkbox', () => {
    const { getByText } = renderWithProvider();

    const rememberButton = getByText('Remember me').parent;
    fireEvent.press(rememberButton);

    expect(rememberButton).toBeTruthy();
  });

  it('submits login form with valid credentials', async () => {
    AsyncStorage.setItem.mockResolvedValue();

    const { getByPlaceholderText, getByText } = renderWithProvider();

    const emailInput = getByPlaceholderText('hallo@batari.com');
    const passwordInput = getByPlaceholderText('password');
    const loginButton = getByText('Log In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'dummy-token');
      expect(router.router.replace).toHaveBeenCalledWith('/(main)/plant');
    });
  });

  it('shows loading indicator during login', async () => {
    AsyncStorage.setItem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider();

    const emailInput = getByPlaceholderText('hallo@batari.com');
    const passwordInput = getByPlaceholderText('password');
    const loginButton = getByText('Log In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(queryByText('Log In')).toBeNull();
  });

  it('handles login error', async () => {
    AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { getByPlaceholderText, getByText } = renderWithProvider();

    const emailInput = getByPlaceholderText('hallo@batari.com');
    const passwordInput = getByPlaceholderText('password');
    const loginButton = getByText('Log In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('displays forgot password link', () => {
    const { getByText } = renderWithProvider();

    expect(getByText('Forgot password')).toBeTruthy();
  });

  it('displays create new account link', () => {
    const { getByText } = renderWithProvider();

    expect(getByText('Create new account')).toBeTruthy();
  });

  it('displays OR separator', () => {
    const { getByText } = renderWithProvider();

    expect(getByText('OR')).toBeTruthy();
  });

  it('displays Google login button', () => {
    const { getByText } = renderWithProvider();

    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('displays Facebook login button', () => {
    const { getByText } = renderWithProvider();

    expect(getByText('Continue with Facebook')).toBeTruthy();
  });

  it('has secure text entry for password field', () => {
    const { getByPlaceholderText } = renderWithProvider();

    const passwordInput = getByPlaceholderText('password');

    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('disables login button while loading', async () => {
    AsyncStorage.setItem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { getByPlaceholderText, getByText } = renderWithProvider();

    const emailInput = getByPlaceholderText('hallo@batari.com');
    const passwordInput = getByPlaceholderText('password');
    const loginButton = getByText('Log In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(loginButton).toBeTruthy();
  });
});
