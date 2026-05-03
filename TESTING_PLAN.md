# Rancangan Testing untuk Proyek Belajar-App

## 1. Framework yang Direkomendasikan

### Testing Stack
- **Jest** - Test runner dan assertion library
- **@testing-library/react-native** - Testing React Native components
- **@testing-library/jest-native** - Custom matchers untuk React Native
- **react-test-renderer** - Snapshot testing
- **msw (Mock Service Worker)** - Mock API calls

### Alasan Pilihan
- Jest adalah standar industri untuk React/React Native testing
- React Testing Library fokus pada user behavior, bukan implementation details
- MSW memungkinkan mocking API yang realistis dan terisolasi

## 2. Struktur Direktori Test

```
belajar-app/
├── __tests__/
│   ├── components/           # Test untuk components
│   │   ├── PlantCard.test.js
│   │   ├── DeviceCard.test.js
│   │   ├── DataCard.test.js
│   │   └── PowerFlowDiagram.test.js
│   ├── contexts/             # Test untuk contexts
│   │   └── AuthContext.test.js
│   ├── services/             # Test untuk services
│   │   ├── api.test.js
│   │   └── eksperimenService.test.js
│   ├── screens/              # Test untuk screens
│   │   ├── PlantScreen.test.js
│   │   ├── LoginScreen.test.js
│   │   └── OverviewScreen.test.js
│   └── mocks/                # Mock data dan handlers
│       ├── handlers.js
│       └── data.js
```

## 3. Hal yang Perlu Dites

### 3.1 Components Testing
**Tujuan**: Memastikan komponen render dengan benar dan merespons user interactions

| Komponen | Test Cases |
|----------|------------|
| **PlantCard** | - Render plant name<br>- Memanggil onPress saat diklik |
| **DeviceCard** | - Render device info (name, SN, location, category)<br>- Memanggil onPress saat diklik<br>- Handle undefined props |
| **DataCard** | - Render data dengan format yang benar<br>- Handle edge cases (null, undefined) |
| **PowerFlowDiagram** | - Render diagram dengan data yang diberikan<br>- Handle update data |

### 3.2 Context Testing
**Tujuan**: Memastikan state management bekerja dengan benar

| Context | Test Cases |
|---------|------------|
| **AuthContext** | - Set user dengan benar<br>- Set selectedDevice<br>- Set devices<br>- Default values benar<br>- Provider renders children |

### 3.3 Services Testing
**Tujuan**: Memastikan API calls berfungsi dengan benar

| Service | Test Cases |
|---------|------------|
| **api.js** | - apiGet dengan sukses<br>- apiGet dengan error (404, 500)<br>- apiPost dengan sukses<br>- apiPost dengan error<br>- Headers terkirim dengan benar<br>- Authorization header terkirim |
| **eksperimenService** | - getEksperimenParams<br>- getEksperimenChart<br>- Handle error dari apiGet |

### 3.4 Screens Testing
**Tujuan**: Memastikan screen berfungsi dengan benar dari sisi user

| Screen | Test Cases |
|--------|------------|
| **PlantScreen** | - Render header dengan title "Plant"<br>- Render search box<br>- Render plant list<br>- Search filter berfungsi<br>- Loading state ditampilkan<br>- Empty state saat tidak ada data<br>- Add button hanya muncul untuk admin<br>- HandleSelectDevice navigasi ke detail |
| **LoginScreen** | - Render form login<br>- Validasi input<br>- Handle submit dengan sukses<br>- Handle error response<br>- Show error message |

## 4. Setup Installation

### Install Dependencies
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native react-test-renderer msw
npm install --save-dev @react-native-async-storage/async-storage @react-navigation/native
```

### Update package.json scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Create jest.config.js
```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|expo-router)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/']
};
```

### Create setupTests.js
```javascript
import { jest } from '@jest/globals';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
```

## 5. Contoh Implementasi Test

### Example: Component Test (DeviceCard.test.js)
```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DeviceCard from '@/components/DeviceCard';

describe('DeviceCard', () => {
  const mockDevice = {
    name: 'Adit',
    sn: 'SN-938472615',
    location: 'Jakarta',
    category: 'Solar',
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

    expect(onPress).toHaveBeenCalledWith(mockDevice);
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
});
```

### Example: Context Test (AuthContext.test.js)
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
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
    const TestComponent = () => {
      const { user, setUser } = React.useContext(AuthContext);
      React.useEffect(() => {
        setUser({ id: 1, name: 'Test User' });
      }, []);
      expect(user).toEqual({ id: 1, name: 'Test User' });
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });

  it('sets selectedDevice correctly', () => {
    const mockDevice = { id: 1, name: 'Test Device' };
    const TestComponent = () => {
      const { selectedDevice, setSelectedDevice } = React.useContext(AuthContext);
      React.useEffect(() => {
        setSelectedDevice(mockDevice);
      }, []);
      expect(selectedDevice).toEqual(mockDevice);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });
});
```

### Example: Service Test (api.test.js)
```javascript
import { apiGet, apiPost } from '@/services/api';

global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('apiGet', () => {
    it('successfully fetches data', async () => {
      const mockData = { success: true, data: [] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiGet('/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockData);
    });

    it('throws error on failed request', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiGet('/test')).rejects.toThrow('GET /test gagal: 404');
    });

    it('throws error on network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiGet('/test')).rejects.toThrow();
    });
  });

  describe('apiPost', () => {
    it('successfully posts data', async () => {
      const mockBody = { name: 'Test' };
      const mockData = { success: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiPost('/test', mockBody);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockBody)
        })
      );
      expect(result).toEqual(mockData);
    });
  });
});
```

### Example: Screen Test (PlantScreen.test.js)
```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlantScreen from '@/app/(main)/plant';
import { AuthProvider } from '@/context/AuthContext';
import * as router from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

global.fetch = jest.fn();

describe('PlantScreen', () => {
  beforeEach(() => {
    fetch.mockClear();
    router.router.push.mockClear();
  });

  const renderWithProvider = (user) => {
    return render(
      <AuthProvider>
        <PlantScreen />
      </AuthProvider>
    );
  };

  it('renders header and search box', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { getByPlaceholderText, getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Plant')).toBeTruthy();
      expect(getByPlaceholderText('Cari nama plant / SN / lokasi')).toBeTruthy();
    });
  });

  it('filters plants by name', async () => {
    const mockPlants = [
      { id: 1, name: 'Adit', sn: 'SN-001', location: 'Jakarta' },
      { id: 2, name: 'Catur', sn: 'SN-002', location: 'Bandung' },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPlants }),
    });

    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Adit')).toBeTruthy();
      expect(getByText('Catur')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Cari nama plant / SN / lokasi');
    fireEvent.changeText(searchInput, 'Adit');

    expect(getByText('Adit')).toBeTruthy();
    expect(queryByText('Catur')).toBeNull();
  });

  it('navigates to plant detail on press', async () => {
    const mockPlants = [{ id: 1, name: 'TestPlant', sn: 'SN-001', location: 'Jakarta' }];

    fetch.mockResolvedValueOnce({
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

  it('shows empty state when no plants', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText('Belum ada plant.')).toBeTruthy();
    });
  });
});
```

## 6. Mock Data Structure

### __tests__/mocks/data.js
```javascript
export const mockDevices = [
  {
    id: 1,
    name: 'Adit',
    sn: 'SN-938472615',
    location: 'Jakarta',
    category: 'Solar',
    updatedAt: '2026-03-30 08:10:00',
    productionToday: 3.2,
    weather: '30°C',
    status: 'On grid',
  },
  // ... more mock data
];

export const mockUser = {
  id: 1,
  name: 'Test User',
  role: 'admin',
};
```

## 7. Test Priorities

### High Priority (Lakukan ini dulu)
1. **Component tests** - DeviceCard, PlantCard
2. **Context tests** - AuthContext
3. **Service tests** - api.js (GET dan POST)

### Medium Priority
4. **Screen tests** - PlantScreen (basic functionality)
5. **Additional component tests** - DataCard, PowerFlowDiagram

### Low Priority
6. **Integration tests** - Full user flow
7. **E2E tests** - Jika dibutuhkan

## 8. Coverage Target

- **Lines**: Minimum 70%
- **Functions**: Minimum 75%
- **Branches**: Minimum 60%
- **Statements**: Minimum 70%

## 9. Running Tests

### Run all tests
```bash
npm test
```

### Run in watch mode
```bash
npm run test:watch
```

### Run with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test DeviceCard.test.js
```

## 10. Best Practices

1. **Test user behavior, bukan implementation**
2. **Gunakan meaningful test descriptions**
3. **Setup dan cleanup dengan benar (beforeEach, afterEach)**
4. **Mock external dependencies (API, navigation, storage)**
5. **Jangan test library pihak ketiga**
6. **Jaga test tetap sederhana dan readable**
7. **Gunakan descriptive assertions**
8. **Mock data harus realistis**
