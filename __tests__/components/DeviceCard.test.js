import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DeviceCard from '@/components/DeviceCard';

describe('DeviceCard', () => {
  const mockDevice = {
    id: 1,
    name: 'Adit',
    sn: 'SN-938472615',
    location: 'Jakarta',
    category: 'Solar',
    system_type: 'Solar System',
  };

  it('renders device information correctly', () => {
    const { getByText } = render(<DeviceCard device={mockDevice} />);

    expect(getByText('Adit')).toBeTruthy();
    expect(getByText('SN: SN-938472615')).toBeTruthy();
    expect(getByText('Jakarta')).toBeTruthy();
    expect(getByText('Solar')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <DeviceCard device={mockDevice} onPress={onPress} />
    );

    fireEvent.press(getByText('Adit'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('handles undefined category', () => {
    const deviceWithoutCategory = { ...mockDevice, category: undefined };
    const { getByText } = render(<DeviceCard device={deviceWithoutCategory} />);

    expect(getByText('Other')).toBeTruthy();
  });

  it('handles undefined location', () => {
    const deviceWithoutLocation = { ...mockDevice, location: undefined };
    const { getByText } = render(<DeviceCard device={deviceWithoutLocation} />);

    expect(getByText('-')).toBeTruthy();
  });

  it('renders with all props present', () => {
    const { getByText, queryByText } = render(<DeviceCard device={mockDevice} />);

    expect(getByText('Adit')).toBeTruthy();
    expect(getByText('SN: SN-938472615')).toBeTruthy();
    expect(getByText('Jakarta')).toBeTruthy();
    expect(getByText('Solar')).toBeTruthy();
  });

  it('does not call onPress when not provided', () => {
    const { getByText } = render(<DeviceCard device={mockDevice} />);

    expect(() => {
      fireEvent.press(getByText('Adit'));
    }).not.toThrow();
  });
});
