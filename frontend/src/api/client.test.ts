import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, httpClient } from './client';

describe('Axios API client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends typed JSON data through the configured client', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: { canSubmit: false } });

    await api.addProviders(['fidelity']);

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/accounts',
      data: { providerIds: ['fidelity'] }
    });
  });

  it('maps server validation responses to the application error contract', async () => {
    vi.spyOn(httpClient, 'request').mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Statements are incomplete.', details: ['HSBC is missing.'] } }
    });

    await expect(api.submit()).rejects.toEqual(
      new ApiError('Statements are incomplete.', ['HSBC is missing.'])
    );
  });
});
