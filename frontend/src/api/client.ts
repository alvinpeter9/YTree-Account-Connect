import axios, { type AxiosRequestConfig } from 'axios';
import type { AccountsSnapshot, ApiErrorBody, Provider } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'ApiError';
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000
});

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>(config);
    return response.data;
  } catch (caught) {
    if (axios.isAxiosError<ApiErrorBody>(caught)) {
      const body = caught.response?.data;
      const message = body?.message
        ?? (caught.code === 'ECONNABORTED'
          ? 'The request took too long. Please try again.'
          : 'Something went wrong. Please try again.');

      throw new ApiError(message, body?.details ?? []);
    }

    throw new ApiError('Something went wrong. Please try again.');
  }
}

export const api = {
  accounts: () => request<AccountsSnapshot>({ method: 'GET', url: '/accounts' }),
  availableProviders: () => request<Provider[]>({ method: 'GET', url: '/providers/available' }),
  addProviders: (providerIds: string[]) => request<AccountsSnapshot>({ method: 'POST', url: '/accounts', data: { providerIds } }),
  removeAccount: (id: string) => request<AccountsSnapshot>({ method: 'DELETE', url: `/accounts/${id}` }),
  uploadStatement: (id: string, fileName: string, statementDate: string) => request<AccountsSnapshot>({
    method: 'PUT',
    url: `/accounts/${id}/statement`,
    data: { fileName, statementDate }
  }),
  submit: () => request<{ status: string; message: string }>({ method: 'POST', url: '/submissions' })
};
