import { getAuthTypeHeaderValue } from '@/lib/auth-type-storage';
import { getStaffTokenHeaderValue } from '@/lib/staff-auth-storage';
import { getUserTokenHeaderValue } from '@/lib/user-auth-storage';
import { notifyUnauthorizedSession } from '@/lib/unauthorized-session';
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;
  readonly data: unknown;

  constructor(
    message: string,
    options: { status?: number | null; code?: string | null; data?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.data = options.data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type CreateApiClientOptions = {
  baseURL: string;
  ulbId: string;
};

function getErrorMessage(error: AxiosError): string {
  const { data } = error.response ?? {};

  if (data && typeof data === 'object') {
    if ('message' in data && typeof data.message === 'string') {
      return data.message;
    }
    if ('error' in data && typeof data.error === 'string') {
      return data.error;
    }
  }

  if (typeof data === 'string' && data.length > 0) {
    return data;
  }

  if (error.message === 'Network Error') {
    return 'Unable to reach the server. Check your connection.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }

  return error.message || 'Something went wrong';
}

function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return new ApiError(getErrorMessage(error), {
      status: error.response?.status ?? null,
      code: error.code ?? null,
      data: error.response?.data,
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Unknown error');
}

export function createApiClient({ baseURL, ulbId }: CreateApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers.set('x-ulb-id', ulbId);

      const authType = getAuthTypeHeaderValue();
      if (authType) {
        config.headers.set('x-auth-type', authType);
      }

      // Attach bearer token for the active auth role only (avoid staff token on user routes).
      const hasRequestAuthorization = Boolean(config.headers.get('Authorization'));
      if (!hasRequestAuthorization) {
        if (authType === 'Staff') {
          const staffToken = getStaffTokenHeaderValue();
          if (staffToken) {
            config.headers.set('Authorization', `Bearer ${staffToken}`);
          }
        } else if (authType === 'User') {
          const userToken = getUserTokenHeaderValue();
          if (userToken) {
            config.headers.set('Authorization', `Bearer ${userToken}`);
          }
        }
      }

      if (__DEV__) {
        console.log(`[API] ${config.method?.toUpperCase() ?? 'GET'} ${config.baseURL ?? ''}${config.url ?? ''}`);
      }

      return config;
    },
    (error) => Promise.reject(toApiError(error)),
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (__DEV__) {
        console.log(`[API] ${response.status} ${response.config.url ?? ''}`);
      }

      return response.data;
    },
    (error) => {
      const apiError = toApiError(error);
      const requestUrl = axios.isAxiosError(error) ? error.config?.url : undefined;

      if (__DEV__) {
        console.error('[API]', apiError.status, apiError.message, apiError.data);
      }

      void notifyUnauthorizedSession(apiError, requestUrl);

      return Promise.reject(apiError);
    },
  );

  return client;
}
