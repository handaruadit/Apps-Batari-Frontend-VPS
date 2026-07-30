//===== (Imports) ======
import { apiRequest, parseApiResponse } from '@/services/apiClient';
import { clearAuth, getToken, isTokenValid } from '@/auth/token';

//===== (Mocks) ======
jest.mock('@/auth/token', () => ({
  clearAuth: jest.fn(async () => undefined),
  getToken: jest.fn(async () => 'valid-token'),
  isTokenValid: jest.fn(() => true),
}));

//===== (createResponse) ======
function createResponse({ ok = true, status = 200, body = '{}' } = {}) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: jest.fn(async () => body),
  };
}

//===== (API Client Tests) ======
describe('apiClient', () => {
  beforeEach(() => {
    global.fetch.mockReset();
    clearAuth.mockClear();
    getToken.mockResolvedValue('valid-token');
    isTokenValid.mockReturnValue(true);
  });

  it('sends an authenticated GET request', async () => {
    global.fetch.mockResolvedValue(
      createResponse({ body: JSON.stringify({ data: [1] }) }),
    );

    const result = await apiRequest('/api/plant/');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/plant/'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token',
        }),
      }),
    );
    expect(result.body).toEqual({ data: [1] });
  });

  it('serializes a public POST request body', async () => {
    global.fetch.mockResolvedValue(createResponse());

    await apiRequest('/api/auth/login', {
      auth: false,
      method: 'POST',
      body: { email: 'user@example.com' },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com' }),
      }),
    );
  });

  it('clears an invalid session before making a request', async () => {
    isTokenValid.mockReturnValue(false);

    await expect(apiRequest('/api/plant/')).rejects.toMatchObject({
      code: 'AUTH_EXPIRED',
    });
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('keeps non-JSON response text available for domain errors', async () => {
    const response = createResponse({ body: '<pre>Backend unavailable</pre>' });

    await expect(parseApiResponse(response)).resolves.toEqual({
      raw: '<pre>Backend unavailable</pre>',
      message: 'Backend unavailable',
    });
  });
});
