//===== (Imports) ======
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DeviceCard from '@/components/DeviceCard';
import {
  formatCityProvince,
  getPlantConnectionStatus,
} from '@/components/device-card/helpers';

//===== (Fixtures) ======
const NOW = new Date('2026-07-30T04:00:00.000Z').getTime();

function createDevice(overrides = {}) {
  return {
    id: 1,
    name: 'Plant Jakarta',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    latestDataStatusTimestamp: new Date(NOW - 5 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

//===== (DeviceCard Tests) ======
describe('DeviceCard', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterAll(() => {
    Date.now.mockRestore();
  });

  it('renders the current plant summary', () => {
    const screen = render(<DeviceCard device={createDevice()} />);

    expect(screen.getByText('Plant Jakarta')).toBeTruthy();
    expect(screen.getByText('Jakarta, DKI Jakarta')).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
  });

  it('calls onPress with the native card interaction', () => {
    const onPress = jest.fn();
    const screen = render(
      <DeviceCard device={createDevice()} onPress={onPress} />,
    );

    fireEvent.press(screen.getByText('Plant Jakarta'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses a dash when city and province are unavailable', () => {
    const screen = render(
      <DeviceCard device={createDevice({ city: null, province: null })} />,
    );

    expect(screen.getByText('-')).toBeTruthy();
  });
});

//===== (DeviceCard Helper Tests) ======
describe('DeviceCard helpers', () => {
  it('formats the available city and province values', () => {
    expect(formatCityProvince({ city: 'Bandung', province: 'Jawa Barat' })).toBe(
      'Bandung, Jawa Barat',
    );
    expect(formatCityProvince({ city: '', province: '' })).toBe('-');
  });

  it('marks data older than fifteen minutes as offline', () => {
    const status = getPlantConnectionStatus(
      createDevice({
        latestDataStatusTimestamp: new Date(NOW - 16 * 60 * 1000).toISOString(),
      }),
    );

    expect(status).toMatchObject({ key: 'offline', isOnline: false });
  });
});
