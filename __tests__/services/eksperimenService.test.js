import { getEksperimenParams, getEksperimenChart } from '@/services/eksperimenService';
import { apiGet } from '@/services/api';

jest.mock('@/services/api');

describe('Eksperimen Service', () => {
  beforeEach(() => {
    apiGet.mockClear();
  });

  describe('getEksperimenParams', () => {
    it('calls apiGet with correct endpoint', async () => {
      const mockParams = {
        params: [
          { id: 1, name: 'Voltage', value: 220 },
          { id: 2, name: 'Current', value: 3.5 },
        ],
      };
      apiGet.mockResolvedValueOnce(mockParams);

      await getEksperimenParams();

      expect(apiGet).toHaveBeenCalledWith('/eksperimen/params');
    });

    it('returns params data successfully', async () => {
      const mockParams = {
        params: [
          { id: 1, name: 'Voltage', value: 220 },
          { id: 2, name: 'Current', value: 3.5 },
        ],
      };
      apiGet.mockResolvedValueOnce(mockParams);

      const result = await getEksperimenParams();

      expect(result).toEqual(mockParams);
    });

    it('handles error from apiGet', async () => {
      apiGet.mockRejectedValueOnce(new Error('API Error'));

      await expect(getEksperimenParams()).rejects.toThrow('API Error');
    });

    it('handles empty params', async () => {
      const emptyParams = { params: [] };
      apiGet.mockResolvedValueOnce(emptyParams);

      const result = await getEksperimenParams();

      expect(result).toEqual(emptyParams);
    });
  });

  describe('getEksperimenChart', () => {
    it('calls apiGet with correct endpoint', async () => {
      const mockChart = {
        labels: ['00:00', '04:00', '08:00'],
        datasets: [
          {
            data: [10, 15, 20],
            color: (opacity) => `rgba(0, 0, 255, ${opacity})`,
          },
        ],
      };
      apiGet.mockResolvedValueOnce(mockChart);

      await getEksperimenChart();

      expect(apiGet).toHaveBeenCalledWith('/eksperimen/chart');
    });

    it('returns chart data successfully', async () => {
      const mockChart = {
        labels: ['00:00', '04:00', '08:00'],
        datasets: [
          {
            data: [10, 15, 20],
            color: (opacity) => `rgba(0, 0, 255, ${opacity})`,
          },
        ],
      };
      apiGet.mockResolvedValueOnce(mockChart);

      const result = await getEksperimenChart();

      expect(result).toEqual(mockChart);
    });

    it('handles error from apiGet', async () => {
      apiGet.mockRejectedValueOnce(new Error('API Error'));

      await expect(getEksperimenChart()).rejects.toThrow('API Error');
    });

    it('handles empty chart data', async () => {
      const emptyChart = {
        labels: [],
        datasets: [],
      };
      apiGet.mockResolvedValueOnce(emptyChart);

      const result = await getEksperimenChart();

      expect(result).toEqual(emptyChart);
    });
  });

  describe('Multiple calls', () => {
    it('handles sequential calls', async () => {
      const mockParams = { params: [{ id: 1, name: 'Test' }] };
      const mockChart = {
        labels: ['Test'],
        datasets: [{ data: [10] }],
      };

      apiGet
        .mockResolvedValueOnce(mockParams)
        .mockResolvedValueOnce(mockChart);

      const paramsResult = await getEksperimenParams();
      const chartResult = await getEksperimenChart();

      expect(paramsResult).toEqual(mockParams);
      expect(chartResult).toEqual(mockChart);
      expect(apiGet).toHaveBeenCalledTimes(2);
    });

    it('handles concurrent calls', async () => {
      const mockParams = { params: [{ id: 1, name: 'Test' }] };
      const mockChart = {
        labels: ['Test'],
        datasets: [{ data: [10] }],
      };

      apiGet
        .mockResolvedValueOnce(mockParams)
        .mockResolvedValueOnce(mockChart);

      const [paramsResult, chartResult] = await Promise.all([
        getEksperimenParams(),
        getEksperimenChart(),
      ]);

      expect(paramsResult).toEqual(mockParams);
      expect(chartResult).toEqual(mockChart);
      expect(apiGet).toHaveBeenCalledTimes(2);
    });
  });
});
