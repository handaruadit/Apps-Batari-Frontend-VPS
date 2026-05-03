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
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockData);
    });

    it('throws error on 404 response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiGet('/test')).rejects.toThrow('GET /test gagal: 404');
    });

    it('throws error on 500 response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiGet('/test')).rejects.toThrow('GET /test gagal: 500');
    });

    it('throws error on network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiGet('/test')).rejects.toThrow('Network error');
    });

    it('sends correct headers', async () => {
      const mockData = { data: [] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await apiGet('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('handles empty response', async () => {
      const mockData = {};
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiGet('/test');
      expect(result).toEqual({});
    });
  });

  describe('apiPost', () => {
    it('successfully posts data', async () => {
      const mockBody = { name: 'Test', value: 123 };
      const mockData = { success: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiPost('/test', mockBody);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockBody)
        })
      );
      expect(result).toEqual(mockData);
    });

    it('throws error on failed request', async () => {
      const mockBody = { name: 'Test' };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(apiPost('/test', mockBody)).rejects.toThrow('POST /test gagal: 400');
    });

    it('throws error on network error', async () => {
      const mockBody = { name: 'Test' };
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiPost('/test', mockBody)).rejects.toThrow('Network error');
    });

    it('sends JSON body correctly', async () => {
      const mockBody = { data: 'test value' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await apiPost('/test', mockBody);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(mockBody)
        })
      );
    });

    it('handles complex nested objects', async () => {
      const complexBody = {
        user: { id: 1, name: 'Test' },
        items: [{ id: 1 }, { id: 2 }],
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await apiPost('/test', complexBody);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(complexBody)
        })
      );
    });
  });

  describe('Error handling', () => {
    it('handles timeout errors', async () => {
      fetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      await expect(apiGet('/test')).rejects.toThrow('Timeout');
    });

    it('handles malformed JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiGet('/test')).rejects.toThrow('Invalid JSON');
    });
  });
});
