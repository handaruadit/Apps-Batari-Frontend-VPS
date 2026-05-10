import React from 'react';
import { render } from '@testing-library/react-native';
import PowerFlowDiagram from '@/components/PowerFlowDiagram';

describe('PowerFlowDiagram', () => {
  const mockPowerData = {
    production: 2.1,
    grid: 0.5,
    battery: -1.2,
    upsLoad: 1.0,
    load: 0.8,
    status: 'On grid',
    energy: {
      consumptionKwh: 2.1,
      batteryKwh: -1.2,
      gridKwh: 0.5,
      totalKwh: 1.4,
    },
  };

  it('renders with power data', () => {
    const { getByText } = render(<PowerFlowDiagram data={mockPowerData} />);

    expect(getByText('Consumption')).toBeTruthy();
    expect(getByText(/2\.10/)).toBeTruthy();
  });

  it('displays all flow labels', () => {
    const { getByText } = render(<PowerFlowDiagram data={mockPowerData} />);

    expect(getByText('Consumption')).toBeTruthy();
    expect(getByText('Grid')).toBeTruthy();
    expect(getByText('Battery')).toBeTruthy();
  });

  it('updates when data changes', () => {
    const { rerender, getByText, queryByText } = render(
      <PowerFlowDiagram data={mockPowerData} />
    );

    expect(getByText(/2\.10/)).toBeTruthy();

    const newData = {
      ...mockPowerData,
      energy: { ...mockPowerData.energy, consumptionKwh: 3.5 },
    };
    rerender(<PowerFlowDiagram data={newData} />);

    expect(queryByText(/2\.10/)).toBeNull();
    expect(getByText(/3\.50/)).toBeTruthy();
  });

  it('handles zero values', () => {
    const zeroData = {
      production: 0,
      grid: 0,
      battery: 0,
      upsLoad: 0,
      load: 0,
      status: 'Off grid',
      energy: {
        consumptionKwh: 0,
        batteryKwh: 0,
        gridKwh: 0,
        totalKwh: 0,
      },
    };
    const { getAllByText } = render(<PowerFlowDiagram data={zeroData} />);

    const zeroValues = getAllByText(/0\.00/);
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  it('handles negative battery values', () => {
    const negativeBatteryData = {
      ...mockPowerData,
      energy: { ...mockPowerData.energy, batteryKwh: -5.5 },
    };
    const { getByText } = render(<PowerFlowDiagram data={negativeBatteryData} />);

    expect(getByText(/-5\.50/)).toBeTruthy();
  });

  it('renders all components', () => {
    const { getByText, queryByText } = render(<PowerFlowDiagram data={mockPowerData} />);

    expect(getByText('Consumption')).toBeTruthy();
    expect(getByText('Grid')).toBeTruthy();
    expect(getByText('Battery')).toBeTruthy();
    expect(queryByText('Ups-Load')).toBeNull();
    expect(queryByText('Load')).toBeNull();
  });
});
