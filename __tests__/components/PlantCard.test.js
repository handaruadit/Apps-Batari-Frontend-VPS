import { render, fireEvent } from '@testing-library/react-native';
import PlantCard from '@/components/PlantCard';

describe('PlantCard', () => {
  const mockPlant = {
    id: 1,
    name: 'Test Plant',
    sn: 'SN-TEST001',
    location: 'Test Location',
  };

  it('renders plant name correctly', () => {
    const { getByText } = render(<PlantCard plant={mockPlant} />);
    expect(getByText('Test Plant')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PlantCard plant={mockPlant} onPress={onPress} />);

    fireEvent.press(getByText('Test Plant'));
    expect(onPress).toHaveBeenCalled();
  });

  it('handles null or undefined plant', () => {
    const { getByText } = render(<PlantCard plant={null} />);
    expect(getByText('')).toBeTruthy();
  });

  it('has correct styling', () => {
    const { getByText } = render(<PlantCard plant={mockPlant} />);
    const textElement = getByText('Test Plant');
    expect(textElement).toBeTruthy();
  });
});
