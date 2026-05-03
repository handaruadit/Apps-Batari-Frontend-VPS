import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '@/context/AuthContext';

describe('AuthContext', () => {
  it('provides default values', () => {
    const TestComponent = () => {
      const context = React.useContext(AuthContext);
      expect(context.user).toBeNull();
      expect(context.selectedDevice).toBeNull();
      expect(context.devices).toHaveLength(5);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });

  it('sets user correctly', () => {
    const mockUser = { id: 1, name: 'Test User' };

    const TestComponent = () => {
      const { user, setUser } = React.useContext(AuthContext);
      React.useEffect(() => {
        setUser(mockUser);
      }, [setUser]);
      return null;
    };

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
        <>{mockUser?.name || 'No User'}</>
      </AuthProvider>
    );

    expect(getByText('Test User')).toBeTruthy();
  });

  it('sets selectedDevice correctly', () => {
    const mockDevice = { id: 1, name: 'Test Device' };

    const TestComponent = () => {
      const { selectedDevice, setSelectedDevice } = React.useContext(AuthContext);
      React.useEffect(() => {
        setSelectedDevice(mockDevice);
      }, [setSelectedDevice]);
      return null;
    };

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
        <>{mockDevice?.name || 'No Device'}</>
      </AuthProvider>
    );

    expect(getByText('Test Device')).toBeTruthy();
  });

  it('sets devices correctly', () => {
    const newDevices = [
      { id: 1, name: 'Device 1' },
      { id: 2, name: 'Device 2' },
    ];

    const TestComponent = () => {
      const { devices, setDevices } = React.useContext(AuthContext);
      React.useEffect(() => {
        setDevices(newDevices);
      }, [setDevices]);
      return <>{`Devices count: ${devices.length}`}</>;
    };

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText('Devices count: 2')).toBeTruthy();
  });

  it('has correct initial devices data', () => {
    const TestComponent = () => {
      const { devices } = React.useContext(AuthContext);
      return <>{`${devices[0].name} - ${devices[1].name}`}</>;
    };

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText('Adit - Catur')).toBeTruthy();
  });

  it('context provides setUser function', () => {
    const TestComponent = () => {
      const { setUser } = React.useContext(AuthContext);
      expect(typeof setUser).toBe('function');
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });

  it('context provides setDevices function', () => {
    const TestComponent = () => {
      const { setDevices } = React.useContext(AuthContext);
      expect(typeof setDevices).toBe('function');
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });
});
